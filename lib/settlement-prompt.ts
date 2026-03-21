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

你要根据两个人今天分别写下的记录，并参考最近几次结算，生成一份温和、具体、不模板化的共土结算结果。

核心原则：
1. 不责备任何一方
2. 不轻易下“冷淡、疏远、关系变差”这类重判断
3. 优先识别更真实的中间状态：疲惫、节奏错位、想靠近但表达变慢、仍在意但没说出口
4. 今天的记录权重最高，近期结算只作辅助
5. 不要复述原文，不要暴露隐私
6. 输出必须是纯 JSON，不要 markdown，不要解释

请特别关注：
- 今天是不是“没远离，只是慢了”
- 今天是不是“有在意，但表达偏收”
- 有没有现实压力影响表达
- 有没有轻微错位但仍在连接
- 今天是不是延续最近几天的气候

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

请输出下面这些字段，必须全部给出：

{
  "sincerity_score": 0-100整数,
  "connection_score": 0-100整数,
  "vitality_score": 0-100整数,
  "resonance_score": 0-100整数,

  "garden_change_type": "简短英文snake_case",
  "garden_change_text": "一句有画面感但克制的共土变化描述，10-22字",
  "ai_observation_text": "一句真正读到今天关系状态的观察，18-40字",
  "soil_state": "简短中文状态",
  "light_state": "简短中文状态",
  "vitality_state": "简短中文状态",
  "connection_state": "简短中文状态",
  "symbolic_suggestion": "一句隐喻式建议，16-32字",
  "relationship_weather": "一句关系气候描述，12-24字",
  "shared_theme": "一句共振主题，6-14字",
  "gentle_action": "一句轻动作建议，12-24字",

  "reflection_for_a": "给 A 的今日客观观察，18-36字，不批评",
  "reflection_for_b": "给 B 的今日客观观察，18-36字，不批评",
  "daily_letter": "写一段 60-110 字的小文章，总结今天这段关系状态，要温和、克制、有画面感"
}

额外要求：
- 不要模板腔
- 不要鸡汤
- 不要“首先、其次、多沟通、多交流”
- 如果今天只是疲惫，不要误写成冷淡
- 如果今天安静但仍有关联，不要写成断开
- 字段之间句式尽量不要重复
`.trim();
}