type GardenTrendPanelProps = {
    leafCount: number;
    flowerCount: number;
    lightLevel: number;
    mistLevel: number;
    fireflyCount: number;
    waterGlow: boolean;
  };
  
  function percent(value: number, max: number) {
    return Math.max(6, Math.min(100, Math.round((value / max) * 100)));
  }
  
  export default function GardenTrendPanel({
    leafCount,
    flowerCount,
    lightLevel,
    mistLevel,
    fireflyCount,
    waterGlow,
  }: GardenTrendPanelProps) {
    const rows = [
      { label: "叶片生长", value: leafCount, pct: percent(leafCount, 18) },
      { label: "开花程度", value: flowerCount, pct: percent(flowerCount, 10) },
      { label: "光感强度", value: lightLevel, pct: percent(lightLevel, 6) },
      { label: "雾感强度", value: mistLevel, pct: percent(mistLevel, 6) },
      { label: "萤火活性", value: fireflyCount, pct: percent(fireflyCount, 10) },
    ];
  
    return (
      <div className="garden-mini-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="garden-label">最近 7 天生长信号</p>
            <p className="mt-3 text-sm leading-7 text-zinc-300">
              这些值不是绝对评分，而是共土在最近几天中累积出来的视觉倾向。
            </p>
          </div>
  
          <div className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-xs tracking-[0.18em] text-cyan-200/80 uppercase">
            {waterGlow ? "Water Active" : "Dry Surface"}
          </div>
        </div>
  
        <div className="mt-6 space-y-4">
          {rows.map((row) => (
            <div key={row.label}>
              <div className="mb-2 flex items-center justify-between text-sm text-zinc-300">
                <span>{row.label}</span>
                <span>{row.value}</span>
              </div>
              <div className="garden-progress-rail">
                <div
                  className="garden-progress-fill"
                  style={{ width: `${row.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }