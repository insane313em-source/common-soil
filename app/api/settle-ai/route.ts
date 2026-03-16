import { NextResponse } from "next/server";
import { getCurrentGardenOrThrow } from "@/lib/garden-server";
import { openai } from "@/lib/openai";
import { buildSettlementPrompt } from "@/lib/settlement-prompt";
import { buildDailySummary } from "@/lib/helpers";

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
        { error: "当前庭院今天已经执行过结算了" },
        { status: 400 }
      );
    }

    let summaryResult;

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
            content: "你是一个只输出 JSON 的关系庭院结算引擎。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const raw = response.choices[0]?.message?.content?.trim();

      if (!raw) {
        throw new Error("AI 返回内容为空");
      }

      summaryResult = JSON.parse(raw);
    } catch {
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
      summary: insertedSummary,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 结算时发生未知错误";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}