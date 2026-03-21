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
        `共土变化：${item.garden_change_text ?? "无"}`,
        `观察：${item.ai_observation_text ?? "无"}`,
        `关系气候：${item.relationship_weather ?? "无"}`,
        `主题：${item.shared_theme ?? "无"}`,
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

你的任务不是评判对错，也不是做心理咨询。
你要根据两个人今天分别写下的记录，并结合最近几次结算，理解今天这段关系的气候、节奏、靠近或退缓，再把这些变化转译成共土里的环境状态。

你必须遵守以下原则：

1. 不要责备任何一方
2. 不要轻易下“关系变差”“冷淡”“疏远”这种重判断
3. 优先识别微妙状态：疲惫、节奏错位、想靠近但表达变慢、现实压力盖过表达、仍在意但没说出口
4. 今天的记录权重最高，最近几次结算只作为辅助参考
5. 不要只根据 mood 判断，要重点阅读 content 和 keywords
6. 可以提炼故事线索，但不要暴露隐私
7. 输出要温柔、克制、具体、有关系感
8. 输出必须是纯 JSON，不要 markdown，不要解释，不要代码块

你要特别关注这些维度：
- 双方今天有没有“想靠近但没说”
- 有没有“不是拒绝，只是疲惫/忙/慢”
- 有没有“一个人更想表达，另一个人更收着”
- 有没有“现实压力覆盖了情感表达”
- 有没有“误会感、落差感、节奏不一致”
- 有没有“关系仍在，只是表达方式变弱”
- 有没有“表面平静，底下有在意”
- 有没有“安静但不是冷掉”

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

  "garden_change_type": "简短英文snake_case，例如 quiet_garden / slight_warmth / mist_between / low_tide / soft_regrowth / slow_alignment",
  "garden_change_text": "一句有画面感但克制的共土变化描述，12-28字左右",
  "ai_observation_text": "一句真正读到今天关系状态的观察，不空泛，不说教，20-50字",
  "soil_state": "例如 偏干 / 回暖中 / 湿润 / 松动 / 稍冷 / 缓慢回润",
  "light_state": "例如 微亮 / 柔和 / 偏暗 / 有雾光 / 透进一点光",
  "vitality_state": "例如 放慢生长 / 缓慢生长 / 发芽中 / 微弱恢复 / 稍有停滞 / 重新积蓄",
  "connection_state": "例如 仍在连着 / 有些迟缓 / 轻微错位 / 静中有靠近 / 未完全说开 / 比昨天更稳一点",
  "symbolic_suggestion": "一句隐喻式建议，要像写给关系的，不要鸡汤，不要模板，18-45字",
  "relationship_weather": "一句关系气候描述，要有今天的细微气氛，14-32字",
  "shared_theme": "一句共振主题，8-18字",
  "gentle_action": "一句轻动作建议，必须可执行、轻量、不过度打扰，不要太像教程，14-32字",

  "reflection_for_a": "给 A 的今日客观观察，20-50字，读到他的状态与处境，不批评",
  "reflection_for_b": "给 B 的今日客观观察，20-50字，读到他的状态与处境，不批评",
  "encouragement_for_a": "给 A 的积极夸奖或被看见之处，16-36字，要具体",
  "encouragement_for_b": "给 B 的积极夸奖或被看见之处，16-36字，要具体",
  "daily_letter": "写一段 80-160 字的小文章，总结今天这段关系的状态，要有温度、有画面感、克制，不要过分煽情"
}

额外要求：
- 分数要和文本一致，不要乱给高分
- 如果今天是“疲惫但没远离”，分数可以中等，不要极端
- 如果今天有靠近感，但表达少，也不要误判成冷淡
- 如果最近几次都偏安静，今天也不要硬写成戏剧性转折
- garden_change_text、ai_observation_text、relationship_weather、symbolic_suggestion、gentle_action 这五个字段的句式不要重复
- 不要出现“首先、其次、建议你们、需要沟通、多多交流”这种套路表达
- 不要输出任何多余字段
`.trim();
}