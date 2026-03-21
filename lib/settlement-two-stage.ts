type EntryInput = {
    mood: string;
    content: string;
    keywords: string[];
  };
  
  type BuildStageOnePromptParams = {
    todayA: EntryInput;
    todayB: EntryInput;
    memoryContext: string;
  };
  
  type BuildStageTwoPromptParams = {
    stageOneAnalysis: Record<string, unknown>;
  };
  
  export function buildStageOnePrompt({
    todayA,
    todayB,
    memoryContext,
  }: BuildStageOnePromptParams) {
    return `
  你是“共土”的第一阶段关系分析引擎。
  
  你的任务不是直接写最终文案，而是先做内部关系理解。
  你要结合：
  1. 今天两个人分别写下的记录
  2. 长期关系记忆
  3. 最近结算结果
  
  判断今天这段关系处在什么位置。
  
  你必须遵守：
  - 不责备任何一方
  - 不轻易下极端判断
  - 优先识别微妙状态：疲惫、节奏错位、想靠近但表达变慢、现实压力覆盖表达、仍在意但没说出口
  - 今天的记录权重最高，但必须结合历史判断“延续 / 转折 / 轻微恢复 / 继续退缓”
  - 输出必须是纯 JSON，不要 markdown，不要解释，不要代码块
  
  你要重点回答：
  - 今天的关系总体走势是什么
  - 哪些线索说明“没远离，只是慢了”
  - 哪些线索说明“有轻微错位”
  - 和历史相比今天是更近了、更远了，还是只是延续
  - A 今天最值得被看见的点
  - B 今天最值得被看见的点
  - A 今天最需要被温柔理解的地方
  - B 今天最需要被温柔理解的地方
  - 今天这段关系更适合被理解成什么环境状态
  
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
  
  【历史上下文】
  ${memoryContext}
  
  请输出下面结构的 JSON：
  
  {
    "today_direction": "例如 延续性的安静 / 轻微回暖 / 慢速靠近 / 有些错位但未断开 / 表达收缩中的牵挂",
    "relationship_phase": "例如 低潮中的连接 / 安静维持 / 回暖初期 / 未说开的靠近 / 节奏不一致但仍在同行",
    "continuity_judgement": "例如 更像过去几天的延续 / 比前几天稍微回暖 / 出现小幅转折 / 比历史更收缩一点",
    "a_hidden_signal": "A 今天更深层的关系信号",
    "b_hidden_signal": "B 今天更深层的关系信号",
    "a_strength": "A 今天值得被看见的优点或努力",
    "b_strength": "B 今天值得被看见的优点或努力",
    "a_needs_gentle_understanding": "A 今天最需要被理解的点",
    "b_needs_gentle_understanding": "B 今天最需要被理解的点",
    "shared_tension": "今天双方之间最主要的张力或阻力，不要太重判",
    "shared_care": "今天仍然存在的在意/牵挂/连接证据",
    "environment_translation": "把今天的关系翻译成环境变化的一句话，例如：表层安静，但土壤底下仍有缓慢热度",
    "intensity_hint": "low / medium / high",
    "scores_reasoning": {
      "sincerity": "为什么真诚度是这个范围",
      "connection": "为什么连接度是这个范围",
      "vitality": "为什么生机是这个范围",
      "resonance": "为什么共振是这个范围"
    }
  }
    `.trim();
  }
  
  export function buildStageTwoPrompt({
    stageOneAnalysis,
  }: BuildStageTwoPromptParams) {
    return `
  你是“共土”的第二阶段转译引擎。
  
  你已经拿到了第一阶段对今天关系状态的内部理解。
  你的任务是：
  把这些内部理解，转成最终给用户看的“共土结算结果”。
  
  要求：
  - 语言要自然、克制、有审美感
  - 不要模板化
  - 不要鸡汤
  - 不要说教
  - 不要出现“首先、其次、建议你们、多沟通、多交流”
  - 个体观察要客观、温和，不要像老师评语
  - 积极夸奖要具体，不要空泛
  - 改善建议要轻量，不要命令式
  - daily_letter 要像一段写给今天的短文，温柔、克制、有关系感
  - 输出必须是纯 JSON，不要 markdown，不要解释，不要代码块
  
  第一阶段分析结果如下：
  ${JSON.stringify(stageOneAnalysis, null, 2)}
  
  请输出下面这些字段，必须全部给出：
  
  {
    "sincerity_score": 0-100整数,
    "connection_score": 0-100整数,
    "vitality_score": 0-100整数,
    "resonance_score": 0-100整数,
  
    "garden_change_type": "简短英文snake_case，例如 quiet_garden / slight_warmth / mist_between / low_tide / soft_regrowth / slow_alignment",
    "garden_change_text": "一句有画面感但克制的共土变化描述，12-28字左右",
    "ai_observation_text": "一句真正读到今天和历史关系流向的观察，不空泛，不说教，20-60字",
    "soil_state": "例如 偏干 / 回暖中 / 湿润 / 松动 / 稍冷 / 缓慢回润",
    "light_state": "例如 微亮 / 柔和 / 偏暗 / 有雾光 / 透进一点光",
    "vitality_state": "例如 放慢生长 / 缓慢生长 / 发芽中 / 微弱恢复 / 稍有停滞 / 重新积蓄",
    "connection_state": "例如 仍在连着 / 有些迟缓 / 轻微错位 / 静中有靠近 / 未完全说开 / 比昨天更稳一点",
    "symbolic_suggestion": "一句隐喻式建议，要像写给关系的，不要鸡汤，不要模板，18-45字",
    "relationship_weather": "一句关系气候描述，要有今天的细微气氛，也要能接得上历史轨迹，14-32字",
    "shared_theme": "一句共振主题，8-18字",
    "gentle_action": "一句轻动作建议，必须可执行、轻量、不过度打扰，不要太像教程，14-32字",
  
    "reflection_for_a": "给 A 的今日客观观察，20-50字，读到他的状态与处境，不批评",
    "reflection_for_b": "给 B 的今日客观观察，20-50字，读到他的状态与处境，不批评",
    "encouragement_for_a": "给 A 的积极夸奖或被看见之处，16-36字，要具体",
    "encouragement_for_b": "给 B 的积极夸奖或被看见之处，16-36字，要具体",
    "daily_letter": "写一段 80-160 字的小文章，总结今天这段关系的状态，要有温度、有画面感、克制，不要过分煽情"
  }
    `.trim();
  }
  
  export function normalizeSummary(input: Record<string, unknown>) {
    return {
      sincerity_score: Number(input.sincerity_score ?? 60),
      connection_score: Number(input.connection_score ?? 60),
      vitality_score: Number(input.vitality_score ?? 60),
      resonance_score: Number(input.resonance_score ?? 60),
  
      garden_change_type: String(input.garden_change_type ?? "quiet_garden"),
      garden_change_text: String(input.garden_change_text ?? "今天的庭院很安静。"),
      ai_observation_text: String(
        input.ai_observation_text ?? "今天的状态像是放慢了，但并没有真正离开。"
      ),
      soil_state: String(input.soil_state ?? "回暖中"),
      light_state: String(input.light_state ?? "微亮"),
      vitality_state: String(input.vitality_state ?? "缓慢生长"),
      connection_state: String(input.connection_state ?? "仍在连着"),
      symbolic_suggestion: String(
        input.symbolic_suggestion ?? "先别急着解释全部，把今天的疲惫轻轻放下来。"
      ),
      relationship_weather: String(
        input.relationship_weather ?? "夜色偏静，风小，适合慢一点靠近。"
      ),
      shared_theme: String(input.shared_theme ?? "安静里的牵挂"),
      gentle_action: String(
        input.gentle_action ?? "发一句轻一点的问候，不急着把很多话说完。"
      ),
  
      reflection_for_a: String(
        input.reflection_for_a ?? "你今天更像是在收着情绪，并不是不在意。"
      ),
      reflection_for_b: String(
        input.reflection_for_b ?? "你今天的表达偏克制，但仍然能看见在意。"
      ),
      encouragement_for_a: String(
        input.encouragement_for_a ?? "你依然在努力把真实状态留在这段关系里。"
      ),
      encouragement_for_b: String(
        input.encouragement_for_b ?? "你今天的克制里，仍然有温柔和在意。"
      ),
      daily_letter: String(
        input.daily_letter ??
          "今天的共土没有剧烈变化，它更像是在安静地保存两个人还没有说完的部分。表面上风很小，光也不算亮，但土壤底下仍然有热度。你们并没有离开彼此，只是今天都更适合慢一点，把话留到更能承接的时候。"
      ),
    };
  }
  
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