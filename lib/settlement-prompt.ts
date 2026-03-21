type EntryInput = {
  mood: string;
  content: string;
  keywords: string[];
};

type RecentSummaryInput = {
  summary_date: string;
  garden_change_text: string | null;
  ai_observation_text: string | null;
  relationship_weather: string | null;
  shared_theme: string | null;
};

type BuildPromptParams = {
  todayA: EntryInput;
  todayB: EntryInput;
  recentSummaries: RecentSummaryInput[];
};

function buildRecentSummaryText(recentSummaries: RecentSummaryInput[]) {
  if (!recentSummaries.length) {
    return "无近期结算。";
  }

  return recentSummaries
    .map((item) => {
      return [
        `[${item.summary_date}]`,
        `变化:${item.garden_change_text ?? "无"}`,
        `观察:${item.ai_observation_text ?? "无"}`,
        `气候:${item.relationship_weather ?? "无"}`,
        `主题:${item.shared_theme ?? "无"}`,
      ].join(" | ");
    })
    .join("\n");
}

export function buildSettlementPrompt({
  todayA,
  todayB,
  recentSummaries,
}: BuildPromptParams) {
  const recentSummaryText = buildRecentSummaryText(recentSummaries);

  return `
你是“共土”的每日结算引擎。

请根据两个人今天的记录，并参考最近几次结算，生成温和、具体、不模板化的关系结算。

要求：
- 不责备任何一方
- 不轻易下“冷淡、疏远、关系变差”这类重判断
- 优先识别：疲惫、节奏错位、想靠近但表达变慢、仍在意但没说出口
- 今天的记录权重最高
- 不复述原文，不暴露隐私
- 语言克制、自然、具体

【今天记录 A】
mood: ${JSON.stringify(todayA.mood)}
keywords: ${JSON.stringify(todayA.keywords)}
content:
${todayA.content}

【今天记录 B】
mood: ${JSON.stringify(todayB.mood)}
keywords: ${JSON.stringify(todayB.keywords)}
content:
${todayB.content}

【最近几次结算】
${recentSummaryText}

请根据这些内容输出结果。`.trim();
}