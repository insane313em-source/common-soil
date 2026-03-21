import { NextResponse } from "next/server";
import { getCurrentGardenOrThrow } from "@/lib/garden-server";
import { openai } from "@/lib/openai";
import { buildDailySummary } from "@/lib/helpers";
import {
  buildStageOnePrompt,
  buildStageTwoPrompt,
  extractJson as extractStageJson,
  normalizeSummary,
} from "@/lib/settlement-two-stage";
import {
  buildCompressionPrompt,
  buildMemoryContextForSettlement,
  extractJson,
} from "@/lib/settlement-memory-compression";

type SummaryRecord = {
  summary_date: string;
  garden_change_text: string | null;
  ai_observation_text: string | null;
  relationship_weather: string | null;
  shared_theme: string | null;
  symbolic_suggestion: string | null;
  gentle_action: string | null;
  soil_state?: string | null;
  light_state?: string | null;
  vitality_state?: string | null;
  connection_state?: string | null;
};

export async function POST() {
  try {
    const { supabase, garden } = await getCurrentGardenOrThrow();
    const today = new Date().toISOString().slice(0, 10);

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

    // 读取长期记忆
    const { data: longTermMemoryRow, error: longTermMemoryError } = await supabase
      .from("garden_long_term_memory")
      .select("*")
      .eq("garden_id", garden.id)
      .maybeSingle();

    if (longTermMemoryError) {
      throw new Error(longTermMemoryError.message);
    }

    // 最近结算结果，给当天结算做辅助
    const { data: recentSummariesData, error: recentSummariesError } = await supabase
      .from("daily_summaries")
      .select(
        "summary_date, garden_change_text, ai_observation_text, relationship_weather, shared_theme, symbolic_suggestion, gentle_action, soil_state, light_state, vitality_state, connection_state"
      )
      .eq("garden_id", garden.id)
      .lt("summary_date", today)
      .order("summary_date", { ascending: false })
      .limit(10);

    if (recentSummariesError) {
      throw new Error(recentSummariesError.message);
    }

    const recentSummaries = ((recentSummariesData ?? []) as SummaryRecord[]).reverse();

    const memoryContext = buildMemoryContextForSettlement({
      longTermMemoryText: longTermMemoryRow?.summary_text ?? null,
      recentSummaries,
    });

    let summaryResult: Record<string, unknown>;
    let source: "ai" | "fallback" = "ai";
    let aiErrorMessage: string | null = null;
    let stageOneRaw: string | null = null;
    let stageTwoRaw: string | null = null;
    let compressionRaw: string | null = null;

    try {
      // 第一阶段：读今天 + 长期记忆
      const stageOnePrompt = buildStageOnePrompt({
        todayA: {
          mood: entryA.mood,
          content: entryA.content,
          keywords: entryA.keywords ?? [],
        },
        todayB: {
          mood: entryB.mood,
          content: entryB.content,
          keywords: entryB.keywords ?? [],
        },
        memoryContext,
      });

      const stageOneResponse = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "你是共土的第一阶段关系分析引擎。你负责读懂今天与长期记忆，不负责最终文案。禁止输出 markdown，禁止解释，只输出 JSON。",
          },
          {
            role: "user",
            content: stageOnePrompt,
          },
        ],
        temperature: 0.7,
        top_p: 0.9,
      });

      stageOneRaw = stageOneResponse.choices[0]?.message?.content?.trim() ?? null;

      if (!stageOneRaw) {
        throw new Error("第一阶段 AI 返回内容为空");
      }

      const stageOneParsed = JSON.parse(extractStageJson(stageOneRaw));

      // 第二阶段：转最终结算 JSON
      const stageTwoPrompt = buildStageTwoPrompt({
        stageOneAnalysis: stageOneParsed,
      });

      const stageTwoResponse = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "你是共土的第二阶段转译引擎。你把内部关系理解转成最终给用户看的共土结算 JSON。禁止输出 markdown，禁止解释，只输出 JSON。",
          },
          {
            role: "user",
            content: stageTwoPrompt,
          },
        ],
        temperature: 0.95,
        top_p: 0.95,
      });

      stageTwoRaw = stageTwoResponse.choices[0]?.message?.content?.trim() ?? null;

      if (!stageTwoRaw) {
        throw new Error("第二阶段 AI 返回内容为空");
      }

      const stageTwoParsed = JSON.parse(extractStageJson(stageTwoRaw));
      summaryResult = normalizeSummary(stageTwoParsed);

      // 写入当天结算
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

      // 压缩长期记忆
      const compressionPrompt = buildCompressionPrompt({
        previousMemoryText: longTermMemoryRow?.summary_text ?? null,
        todayA: {
          mood: entryA.mood,
          content: entryA.content,
          keywords: entryA.keywords ?? [],
        },
        todayB: {
          mood: entryB.mood,
          content: entryB.content,
          keywords: entryB.keywords ?? [],
        },
        todaySummary: insertedSummary,
        recentSummaries,
      });

      const compressionResponse = await openai.chat.completions.create({
        model: "gpt-4.1",
        messages: [
          {
            role: "system",
            content:
              "你是共土的长期记忆压缩引擎。你负责把关系过程沉淀成可复用的长期记忆。禁止输出 markdown，禁止解释，只输出 JSON。",
          },
          {
            role: "user",
            content: compressionPrompt,
          },
        ],
        temperature: 0.6,
        top_p: 0.9,
      });

      compressionRaw =
        compressionResponse.choices[0]?.message?.content?.trim() ?? null;

      if (!compressionRaw) {
        throw new Error("长期记忆压缩返回内容为空");
      }

      const compressionParsed = JSON.parse(extractJson(compressionRaw));

      const memoryPayload = {
        garden_id: garden.id,
        summary_text: String(
          compressionParsed.summary_text ??
            longTermMemoryRow?.summary_text ??
            "这片共土仍在形成自己的长期关系记忆。"
        ),
        memory_json: compressionParsed.memory_json ?? null,
        updated_at: new Date().toISOString(),
      };

      if (longTermMemoryRow) {
        const { error: updateMemoryError } = await supabase
          .from("garden_long_term_memory")
          .update({
            summary_text: memoryPayload.summary_text,
            memory_json: memoryPayload.memory_json,
            updated_at: memoryPayload.updated_at,
            memory_version: (longTermMemoryRow.memory_version ?? 1) + 1,
          })
          .eq("garden_id", garden.id);

        if (updateMemoryError) {
          throw new Error(updateMemoryError.message);
        }
      } else {
        const { error: insertMemoryError } = await supabase
          .from("garden_long_term_memory")
          .insert({
            garden_id: garden.id,
            memory_version: 1,
            summary_text: memoryPayload.summary_text,
            memory_json: memoryPayload.memory_json,
            updated_at: memoryPayload.updated_at,
          });

        if (insertMemoryError) {
          throw new Error(insertMemoryError.message);
        }
      }

      console.log("[settle-ai] stageOne raw:", stageOneRaw);
      console.log("[settle-ai] stageTwo raw:", stageTwoRaw);
      console.log("[settle-ai] compression raw:", compressionRaw);
      console.log("[settle-ai] source=ai");

      return NextResponse.json({
        success: true,
        source,
        aiErrorMessage,
        stageOneRaw,
        stageTwoRaw,
        compressionRaw,
        summary: insertedSummary,
      });
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
        stageOneRaw,
        stageTwoRaw,
        compressionRaw,
        summary: insertedSummary,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "AI 结算时发生未知错误";

    console.error("[settle-ai] fatal:", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}