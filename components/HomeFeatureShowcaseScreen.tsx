const items = [
    {
      index: "L",
      title: "彼此不可见",
      text: "双方原文不会被直接摊开，系统只提炼关系层面的变化与气候。",
    },
    {
      index: "X",
      title: "幕后AI结算",
      text: "情绪、近况与关键词被转译成土壤、天气、光线与生命变化。",
    },
    {
      index: "J",
      title: "长期共养",
      text: "不是一次播报，而是一片会慢慢留下痕迹、慢慢生长的地方。",
    },
    {
      index: "I LOVE U",
      title: "克制引导",
      text: "不说教，不判定，用观察、隐喻和轻动作陪伴关系。",
    },
  ];
  
  export default function HomeFeatureShowcaseScreen() {
    return (
      <section data-fullpage-section className="fullpage-screen fullpage-stage">
        <div className="fullpage-grid-bg" />
        <div className="fullpage-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="screen-shell">
            <div className="screen-orb screen-orb-a" />
            <div className="screen-orb screen-orb-b" />
  
            <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
              <div>
                <p className="screen-kicker">Core Features</p>
                <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                  它不是功能堆叠，
                  <br />
                  而是一种关系界面语言。
                </h2>
                <p className="mt-6 screen-subcopy">
                  共土最重要的不是“能做多少事”，而是它如何把关系重新组织成一种更克制、更有空间感、更适合长期停留的体验。
                </p>
  
                <div className="mt-8 flex flex-wrap gap-3">
                  <span className="screen-chip">Invisible Input</span>
                  <span className="screen-chip">AI Translation</span>
                  <span className="screen-chip">Slow Growth</span>
                </div>
  
                <div className="mt-10 grid gap-4 sm:grid-cols-2">
                  <div className="screen-metric">
                    <p className="screen-metric-label">Input Form</p>
                    <p className="screen-metric-value">日常记录</p>
                  </div>
                  <div className="screen-metric">
                    <p className="screen-metric-label">Output Form</p>
                    <p className="screen-metric-value">环境改变</p>
                  </div>
                </div>
              </div>
  
              <div className="grid gap-4 sm:grid-cols-2">
                {items.map((item) => (
                  <div key={item.index} className="showcase-card">
                    <p className="showcase-index">{item.index}</p>
                    <h3 className="mt-4 text-2xl font-semibold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-sm leading-8 text-zinc-300">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }