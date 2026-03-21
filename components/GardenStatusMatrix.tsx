type GardenStatusMatrixProps = {
    soilState?: string | null;
    lightState?: string | null;
    vitalityState?: string | null;
    connectionState?: string | null;
  };
  
  export default function GardenStatusMatrix({
    soilState,
    lightState,
    vitalityState,
    connectionState,
  }: GardenStatusMatrixProps) {
    const items = [
      { label: "土壤", value: soilState ?? "未知" },
      { label: "光照", value: lightState ?? "未知" },
      { label: "生机", value: vitalityState ?? "未知" },
      { label: "连结", value: connectionState ?? "未知" },
    ];
  
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="garden-mini-card">
            <p className="garden-label">{item.label}</p>
            <p className="garden-value">{item.value}</p>
          </div>
        ))}
      </div>
    );
  }