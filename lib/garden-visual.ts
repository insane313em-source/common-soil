type SummaryRecord = {
    garden_change_type: string | null;
    light_state: string | null;
    vitality_state: string | null;
    connection_state: string | null;
  };
  
  export type GardenVisualState = {
    leafCount: number;
    flowerCount: number;
    lightLevel: number;
    mistLevel: number;
    fireflyCount: number;
    waterGlow: boolean;
    activeTypes: string[];
  };
  
  export function buildGardenVisualState(
    summaries: SummaryRecord[]
  ): GardenVisualState {
    let leafCount = 0;
    let flowerCount = 0;
    let lightLevel = 0;
    let mistLevel = 0;
    let fireflyCount = 0;
    let waterGlow = false;
  
    const activeTypes: string[] = [];
  
    for (const item of summaries) {
      const type = item.garden_change_type ?? "";
  
      if (type) {
        activeTypes.push(type);
      }
  
      if (type === "new_leaves") {
        leafCount += 2;
        lightLevel += 1;
      }
  
      if (type === "small_flower") {
        flowerCount += 1;
        lightLevel += 1;
      }
  
      if (type === "night_light") {
        lightLevel += 2;
        waterGlow = true;
      }
  
      if (type === "quiet_garden") {
        mistLevel += 1;
      }
  
      if (type === "fireflies") {
        fireflyCount += 3;
        lightLevel += 1;
      }
  
      if (item.vitality_state?.includes("发芽")) {
        leafCount += 1;
      }
  
      if (item.connection_state?.includes("回暖")) {
        flowerCount += 1;
      }
  
      if (item.light_state?.includes("微亮") || item.light_state?.includes("微暖")) {
        lightLevel += 1;
      }
    }
  
    return {
      leafCount: Math.min(leafCount, 12),
      flowerCount: Math.min(flowerCount, 8),
      lightLevel: Math.min(lightLevel, 6),
      mistLevel: Math.min(mistLevel, 4),
      fireflyCount: Math.min(fireflyCount, 10),
      waterGlow,
      activeTypes,
    };
  }