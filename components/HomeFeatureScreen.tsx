const items = [
    {
      index: "L",
      title: "彼此不可见",
      text: "双方原文不会被直接展示，系统只提炼关系层面的变化与气候，让亲密感保留必要的距离。",
    },
    {
      index: "X",
      title: "幕后 AI 结算",
      text: "每天的情绪、近况与没说出口的话，会被转译成土壤、天气、光线与生命变化。",
    },
    {
      index: "J",
      title: "长期共养",
      text: "它不是一次播报，而是一片会慢慢积累、慢慢显形、慢慢留下痕迹的地方。",
    },
    {
      index: "I LOVE U",
      title: "克制的引导",
      text: "不说教，不判定，不急着解决，而是用观察、隐喻和轻动作去陪伴关系。",
    },
  ];
  
  export default function HomeFeatureScreen() {
    return (
      <section data-fullpage-section className="fullpage-screen">
        <div className="fullpage-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="screen-kicker">Core Features</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
              一套更克制的关系产品语言
            </h2>
            <p className="mt-6 screen-subcopy">
              它不追求喧闹地解决问题，而是让双方在不被直接暴露的前提下，看见关系如何被日常慢慢塑形。
            </p>
          </div>
  
          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.index} className="screen-panel p-6">
                <p className="screen-index">{item.index}</p>
                <h3 className="mt-5 text-2xl font-semibold tracking-tight text-white">
                  {item.title}
                </h3>
                <p className="mt-5 text-sm leading-8 text-zinc-300">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }