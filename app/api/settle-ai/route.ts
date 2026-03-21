import { NextResponse } from "next/server";
import { getCurrentGardenOrThrow } from "@/lib/garden-server";
import { openai } from "@/lib/openai";
import { buildDailySummary } from "@/lib/helpers";
import { buildSettlementPrompt } from "@/lib/settlement-prompt";

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

function clipText(text: string | null | undefined, maxLen = 260) {
  const value = (text ?? "").trim();
  if (!value) return "";
  return value.length > maxLen ? `${value.slice(0, maxLen)}...` : value;
}

function normalizeSummary(input: Record<string, unknown>) {
  return {
    sincerity_score: Number(input.sincerity_score ?? 60),
    connection_score: Number(input.connection_score ?? 60),
    vitality_score: Number(input.vitality_score ?? 60),
    resonance_score: Number(input.resonance_score ?? 60),

    garden_change_type: String(input.garden_change_type ?? "quiet_garden"),
    garden_change_text: String(input.garden_change_text ?? "今天的庭院很安静。"),
    ai_observation_text: String(
      input.ai_observation_text ?? "今天像是放慢了一些，但并没有真正离开。"
    ),
    soil_state: String(input.soil_state ?? "回暖中"),
    light_state: String(input.light_state ?? "微亮"),
    vitality_state: String(input.vitality_state ?? "缓慢生长"),
    connection_state: String(input.connection_state ?? "仍在连着"),
    symbolic_suggestion: String(
      input.symbolic_suggestion ?? "先别急着把所有话说完，留一点缓冲给今天。"
    ),
    relationship_weather: String(
      input.relationship_weather ?? "夜色偏静，风小，仍有一点温度。"
    ),
    shared_theme: String(input.shared_theme ?? "安静里的牵挂"),
    gentle_action: String(
      input.gentle_action ?? "发一句轻一点的问候，不急着延展开。"
    ),

    reflection_for_a: String(
      input.reflection_for_a ?? "你今天更像是在收着状态，并不是不在意。"
    ),
    reflection_for_b: String(
      input.reflection_for_b ?? "你今天的表达偏克制，但并没有真正抽离。"
    ),
    daily_letter: String(
      input.daily_letter ??
        "今天的共土没有剧烈变化，它更像是在安静地保存两个人还没说完的部分。风不大，光也不强，但土壤底下仍然有热度。你们并没有离开彼此，只是今天更适合慢一点。"
    ),
  };
}

export async function POST(request: Request) {
  try {
    const { supabase, garden } = await getCurrentGardenOrThrow();
    const today = new Date().toISOString().slice(0, 10);

    const body = await request.json().catch(() => ({}));
    const forceRegenerate = body?.forceRegenerate === true;

    const { data: todayEntries, error: entriesError } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("garden_id", garden.id)
      .eq("entry_date", today)
      .order("created_at", { ascending: true });

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

    if (existingSummary && !forceRegenerate) {
      return NextResponse.json(
        {
          error: "当前庭院今天已经执行过结算了",
          source: "already_exists",
          summary: existingSummary,
        },
        { status: 400 }
      );
    }

    if (existingSummary && forceRegenerate) {
      const currentRegenerateCount = Number(existingSummary.regenerate_count ?? 0);

      if (currentRegenerateCount >= 2) {
        return NextResponse.json(
          {
            error: "今天的结算最多只能重新生成 2 次",
            source: "regenerate_limit_reached",
            summary: existingSummary,
          },
          { status: 400 }
        );
      }
    }

    // 只取最近 3 次，进一步控 token
    const { data: recentSummariesData, error: recentSummariesError } = await supabase
      .from("daily_summaries")
      .select(
        "summary_date, garden_change_text, ai_observation_text, relationship_weather, shared_theme"
      )
      .eq("garden_id", garden.id)
      .lt("summary_date", today)
      .order("summary_date", { ascending: false })
      .limit(3);

    if (recentSummariesError) {
      throw new Error(recentSummariesError.message);
    }

    const recentSummaries = (recentSummariesData ?? []).reverse();

    let summaryResult: Record<string, unknown>;
    let source: "ai" | "fallback" = "ai";
    let aiErrorMessage: string | null = null;
    let rawAiText: string | null = null;

    try {
      const prompt = buildSettlementPrompt({
        todayA: {
          mood: entryA.mood,
          content: clipText(entryA.content, 260),
          keywords: (entryA.keywords ?? []).slice(0, 6),
        },
        todayB: {
          mood: entryB.mood,
          content: clipText(entryB.content, 260),
          keywords: (entryB.keywords ?? []).slice(0, 6),
        },
        recentSummaries,
      });

      const response = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content:
              "你是共土的每日结算引擎。请用克制、自然、不模板化的方式输出 JSON。禁止 markdown，禁止解释。",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.72,
        top_p: 0.85,
        max_completion_tokens: 900,
      });

      rawAiText = response.choices[0]?.message?.content?.trim() ?? null;

      if (!rawAiText) {
        throw new Error("AI 返回内容为空");
      }

      const parsed = JSON.parse(extractJson(rawAiText));
      summaryResult = normalizeSummary(parsed);

      console.log("[settle-ai] source=ai");
    } catch (error) {
      source = "fallback";
      aiErrorMessage =
        error instanceof Error ? error.message : "AI 调用失败";

      console.error("[settle-ai] AI failed, fallback used:", error);

      const fallback = buildDailySummary({
        moodA: entryA.mood,
        moodB: entryB.mood,
        contentA: entryA.content,
        contentB: entryB.content,
      });

      summaryResult = {
        ...fallback,
        reflection_for_a: "你今天更像是在收着状态，并不是不在意。",
        reflection_for_b: "你今天的表达偏克制，但并没有真正抽离。",
        daily_letter:
          "今天的共土没有剧烈变化，它更像是在安静地保存两个人还没说完的部分。风不大，光也不强，但土壤底下仍然有热度。你们并没有离开彼此，只是今天更适合慢一点。",
      };
    }

    if (existingSummary && forceRegenerate) {
      const nextRegenerateCount = Number(existingSummary.regenerate_count ?? 0) + 1;

      const { data: updatedSummary, error: updateError } = await supabase
        .from("daily_summaries")
        .update({
          ...summaryResult,
          regenerate_count: nextRegenerateCount,
        })
        .eq("id", existingSummary.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      return NextResponse.json({
        success: true,
        regenerated: true,
        source,
        aiErrorMessage,
        rawAiText,
        summary: updatedSummary,
      });
    }

    const { data: insertedSummary, error: insertError } = await supabase
      .from("daily_summaries")
      .insert({
        garden_id: garden.id,
        summary_date: today,
        regenerate_count: 0,
        ...summaryResult,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json({
      success: true,
      regenerated: false,
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