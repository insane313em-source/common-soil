export function joinKeywords(input: string) {
  return input
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function generateInviteCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";

  for (let i = 0; i < length; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }

  return result;
}

type SettlementInput = {
  moodA: string;
  moodB: string;
  contentA: string;
  contentB: string;
};

type SettlementResult = {
  sincerity_score: number;
  connection_score: number;
  vitality_score: number;
  resonance_score: number;
  garden_change_type: string;
  garden_change_text: string;
  ai_observation_text: string;
  soil_state: string;
  light_state: string;
  vitality_state: string;
  connection_state: string;
  symbolic_suggestion: string;
  relationship_weather: string;
  shared_theme: string;
  gentle_action: string;
};

const positiveMoods = ["开心", "期待", "平静"];
const lowEnergyMoods = ["疲惫", "混乱", "委屈", "焦虑"];
const connectionKeywords = ["想", "惦记", "一起", "关系", "靠近", "理解", "在意", "陪", "我们"];

export function buildDailySummary(input: SettlementInput): SettlementResult {
  const { moodA, moodB, contentA, contentB } = input;

  const mergedText = `${contentA} ${contentB}`;
  const connectionCount = connectionKeywords.filter((word) =>
    mergedText.includes(word)
  ).length;

  const sameMood = moodA === moodB;
  const bothPositive = positiveMoods.includes(moodA) && positiveMoods.includes(moodB);
  const bothLowEnergy = lowEnergyMoods.includes(moodA) && lowEnergyMoods.includes(moodB);
  const mixedState =
    (positiveMoods.includes(moodA) && lowEnergyMoods.includes(moodB)) ||
    (positiveMoods.includes(moodB) && lowEnergyMoods.includes(moodA));

  let sincerityScore = 70;
  let connectionScore = 55;
  let vitalityScore = 55;
  let resonanceScore = 50;

  sincerityScore += Math.min(20, Math.floor((contentA.length + contentB.length) / 40));
  connectionScore += connectionCount * 5;

  if (sameMood) resonanceScore += 20;
  if (bothPositive) {
    vitalityScore += 20;
    connectionScore += 10;
  }

  if (bothLowEnergy) {
    vitalityScore -= 10;
    resonanceScore += 10;
  }

  if (mixedState) {
    resonanceScore += 5;
    connectionScore += 5;
  }

  sincerityScore = Math.max(0, Math.min(100, sincerityScore));
  connectionScore = Math.max(0, Math.min(100, connectionScore));
  vitalityScore = Math.max(0, Math.min(100, vitalityScore));
  resonanceScore = Math.max(0, Math.min(100, resonanceScore));

  if (bothPositive && connectionScore >= 65) {
    return {
      sincerity_score: sincerityScore,
      connection_score: connectionScore,
      vitality_score: vitalityScore,
      resonance_score: resonanceScore,
      garden_change_type: "new_leaves",
      garden_change_text: "庭院里长出了两片新叶。",
      ai_observation_text: "今天这里多了一点愿意靠近彼此的生长力。",
      soil_state: "湿润",
      light_state: "微暖",
      vitality_state: "缓慢生长",
      connection_state: "安静流动",
      symbolic_suggestion: "今晚不必急着让花开大，先给彼此留一点能呼吸的空隙。",
      relationship_weather: "微晴，风缓，地面有持续回温的迹象。",
      shared_theme: "轻轻靠近的生长",
      gentle_action: "今天适合留一句不需要被立刻回应的话。",
    };
  }

  if (bothLowEnergy && sincerityScore >= 75) {
    return {
      sincerity_score: sincerityScore,
      connection_score: connectionScore,
      vitality_score: vitalityScore,
      resonance_score: resonanceScore,
      garden_change_type: "night_light",
      garden_change_text: "夜里的灯亮了一点。",
      ai_observation_text: "虽然今天都有些疲惫，但仍有人在认真守着这片土壤。",
      soil_state: "偏湿",
      light_state: "微亮",
      vitality_state: "放慢生长",
      connection_state: "仍在连接",
      symbolic_suggestion: "有些根系不是靠用力向上，而是靠安静地不松开。",
      relationship_weather: "薄雾未散，但地面仍有余温。",
      shared_theme: "疲惫中的并肩",
      gentle_action: "明天可以先问一句“你今天是不是很累”。",
    };
  }

  if (connectionScore >= 70) {
    return {
      sincerity_score: sincerityScore,
      connection_score: connectionScore,
      vitality_score: vitalityScore,
      resonance_score: resonanceScore,
      garden_change_type: "small_flower",
      garden_change_text: "角落里开出了一朵很小的花。",
      ai_observation_text: "有些没说出口的话，仍然在悄悄靠近彼此。",
      soil_state: "回暖中",
      light_state: "柔和",
      vitality_state: "发芽中",
      connection_state: "轻微回暖",
      symbolic_suggestion: "明天也许不必急着开花，先让土壤松一点就好。",
      relationship_weather: "薄雾转柔，风向稳定下来。",
      shared_theme: "没说出口的靠近",
      gentle_action: "今天适合说一件本来想略过的小事。",
    };
  }

  return {
    sincerity_score: sincerityScore,
    connection_score: connectionScore,
    vitality_score: vitalityScore,
    resonance_score: resonanceScore,
    garden_change_type: "quiet_garden",
    garden_change_text: "今天的庭院很安静。",
    ai_observation_text: "生长放慢了，但并没有停下。",
    soil_state: "偏干",
    light_state: "微弱",
    vitality_state: "静止观察",
    connection_state: "有些迟缓",
    symbolic_suggestion: "若不知道怎么靠近，可以先把白天的灰轻轻放下。",
    relationship_weather: "夜色偏重，风小，适合慢一点说话。",
    shared_theme: "迟缓但仍未离开",
    gentle_action: "今天可以先发一张路上的照片，而不是急着解释很多。",
  };
}