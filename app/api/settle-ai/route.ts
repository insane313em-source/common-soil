import { NextResponse } from "next/server";
import { getCurrentGardenOrThrow } from "@/lib/garden-server";
import { openai } from "@/lib/openai";
import { buildSettlementPrompt } from "@/lib/settlement-prompt";
import { buildDailySummary } from "@/lib/helpers";

function extractJson(raw: string) {
  const trimmed = raw.trim();

  if (trimmed.startsWith("```")) {
    const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return trimmed;
}

export async function POST() {
  try {
    const { supabase, garden } = await getCurrentGardenOrThrow();
    const today = new Date().toISOString().slice(0, 10);

    const { data: todayEntries, error: entriesError } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("garden_id", garden.id)
      .eq("entry_date", today);

    if (entriesError) {
      throw new Error(entriesError.message);
    }

    if (!todayEntries || todayEntries.length < 2) {
      return NextResponse.json(
        { error: "当前庭院今天还没有足够的记录用于结算" },
        { status: 400 }
      );
    }

    const [entryA, entryB] = todayEntries;

    const { data: existingSummary, error: existingError } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("garden_id", garden.id)
      .eq("summary_date", today)
      .maybeSingle();

    if (existingError) {
      throw new Error(existingError.message);
    }

    if (existingSummary) {
      return NextResponse.json(
        {
          error: "当前庭院今天已经执行过结算了",
          source: "already_exists",
          summary: existingSummary,
        },
        { status: 400 }
      );
    }

    let summaryResult: Record<string, unknown>;
    let source: "ai" | "fallback" = "ai";
    let rawAiText: string | null = null;
    let aiErrorMessage: string | null = null;

    try {
      const prompt = buildSettlementPrompt(
        {
          mood: entryA.mood,
          content: entryA.content,
          keywords: entryA.keywords ?? [],
        },
        {
          mood: entryB.mood,
          content: entryB.content,
          keywords: entryB.keywords ?? [],
        }
      );

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "你是一个只输出 JSON 的关系庭院结算引擎。禁止输出 markdown 代码块，禁止输出解释文字，直接输出 JSON 对象。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const raw = response.choices[0]?.message?.content?.trim();
      rawAiText = raw ?? null;

      if (!raw) {
        throw new Error("AI 返回内容为空");
      }

      const jsonText = extractJson(raw);
      summaryResult = JSON.parse(jsonText);

      console.log("[settle-ai] AI raw response:", raw);
      console.log("[settle-ai] source=ai");
    } catch (error) {
      source = "fallback";
      aiErrorMessage =
        error instanceof Error ? error.message : "AI 调用失败";

      console.error("[settle-ai] AI failed, fallback used:", error);

      summaryResult = buildDailySummary({
        moodA: entryA.mood,
        moodB: entryB.mood,
        contentA: entryA.content,
        contentB: entryB.content,
      });
    }

    const { data: insertedSummary, error: insertError } = await supabase
      .from("daily_summaries")
      .insert({
        garden_id: garden.id,
        summary_date: today,
        ...summaryResult,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      success: true,
      source,
      aiErrorMessage,
      rawAiText,
      summary: insertedSummary,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 结算时发生未知错误";

    console.error("[settle-ai] fatal:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}