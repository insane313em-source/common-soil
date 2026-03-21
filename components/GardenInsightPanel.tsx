type GardenInsightPanelProps = {
    relationshipWeather?: string | null;
    sharedTheme?: string | null;
    symbolicSuggestion?: string | null;
    gentleAction?: string | null;
  };
  
  export default function GardenInsightPanel({
    relationshipWeather,
    sharedTheme,
    symbolicSuggestion,
    gentleAction,
  }: GardenInsightPanelProps) {
    const blocks = [
      {
        title: "关系气候",
        value: relationshipWeather ?? "今天还没有生成关系气候。",
      },
      {
        title: "共振主题",
        value: sharedTheme ?? "今天还没有生成共振主题。",
      },
      {
        title: "隐喻建议",
        value: symbolicSuggestion ?? "今天还没有生成隐喻建议。",
      },
      {
        title: "轻动作建议",
        value: gentleAction ?? "今天还没有生成轻动作建议。",
      },
    ];
  
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {blocks.map((block) => (
          <div key={block.title} className="garden-mini-card">
            <p className="garden-label">{block.title}</p>
            <p className="mt-3 text-sm leading-8 text-zinc-200">{block.value}</p>
          </div>
        ))}
      </div>
    );
  }