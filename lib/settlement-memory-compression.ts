type EntryInput = {
    mood: string;
    content: string;
    keywords: string[];
  };
  
  type SummaryInput = {
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
  
  export function extractJson(raw: string) {
    const trimmed = raw.trim();
  
    if (trimmed.startsWith("```")) {
      const match = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (match?.[1]) {
        return match[1].trim();
      }
    }
  
    return trimmed;
  }
  
  export function buildCompressionPrompt(params: {
    previousMemoryText: string | null;
    todayA: EntryInput;
    todayB: EntryInput;
    todaySummary: Record<string, unknown>;
    recentSummaries: SummaryInput[];
  }) {
    const recentSummariesText =
      params.recentSummaries.length > 0
        ? params.recentSummaries
            .map((item) => {
              return [
                `[${item.summary_date}]`,
                `共土变化：${item.garden_change_text ?? "无"}`,
                `观察：${item.ai_observation_text ?? "无"}`,
                `关系气候：${item.relationship_weather ?? "无"}`,
                `共振主题：${item.shared_theme ?? "无"}`,
              ].join(" | ");
            })
            .join("\n")
        : "无";
  
    return `
  你是“共土”的长期关系记忆压缩引擎。
  
  你的任务不是写当天结算，而是维护一份长期关系记忆。
  你会拿到：
  1. 旧的长期记忆
  2. 今天双方的记录
  3. 今天新生成的结算结果
  4. 最近几次结算结果
  
  你要把这些信息压缩成一份“长期关系画像”，用于之后每天结算时参考。
  
  原则：
  - 不责备任何一方
  - 不做极端判断
  - 重点沉淀“长期重复模式、靠近方式、退缓方式、节奏差异、修复方式、关系基调”
  - 不要重复堆砌细节
  - 不要写成散文
  - 要稳定、清楚、可长期复用
  - 输出必须是纯 JSON，不要 markdown，不要解释，不要代码块
  
  【旧长期记忆】
  ${params.previousMemoryText ?? "无"}
  
  【今天记录 A】
  mood: ${JSON.stringify(params.todayA.mood)}
  keywords: ${JSON.stringify(params.todayA.keywords)}
  content:
  ${params.todayA.content}
  
  【今天记录 B】
  mood: ${JSON.stringify(params.todayB.mood)}
  keywords: ${JSON.stringify(params.todayB.keywords)}
  content:
  ${params.todayB.content}
  
  【今天结算结果】
  ${JSON.stringify(params.todaySummary, null, 2)}
  
  【最近结算结果】
  ${recentSummariesText}
  
  请输出下面结构：
  
  {
    "summary_text": "一段 180-320 字左右的长期关系记忆摘要，供后续结算参考。必须自然、克制、稳定，不要模板腔。",
    "memory_json": {
      "relationship_baseline": "这段关系更长期的基调",
      "recurring_patterns": [
        "反复出现的模式1",
        "反复出现的模式2"
      ],
      "care_signals": [
        "仍然在意的表现1",
        "仍然在意的表现2"
      ],
      "friction_signals": [
        "经常出现的阻力1",
        "经常出现的阻力2"
      ],
      "repair_style": "这段关系更容易以什么方式恢复或回暖",
      "pace_description": "双方长期节奏特征",
      "current_arc": "最近阶段的大体走向"
    }
  }
    `.trim();
  }
  
  export function buildMemoryContextForSettlement(params: {
    longTermMemoryText: string | null;
    recentSummaries: SummaryInput[];
  }) {
    const recentSummaryText =
      params.recentSummaries.length > 0
        ? params.recentSummaries
            .map((item) => {
              return [
                `[${item.summary_date}]`,
                `共土变化：${item.garden_change_text ?? "无"}`,
                `观察：${item.ai_observation_text ?? "无"}`,
                `关系气候：${item.relationship_weather ?? "无"}`,
                `共振主题：${item.shared_theme ?? "无"}`,
              ].join(" | ");
            })
            .join("\n")
        : "无近期结算。";
  
    return `
  【长期关系记忆】
  ${params.longTermMemoryText ?? "暂无长期关系记忆。"}
  
  【最近结算结果】
  ${recentSummaryText}
    `.trim();
  }