const steps = [
    {
      title: "进入同一片共土",
      text: "一方创建，另一方加入。两个人进入同一片地方，但并不直接彼此摊开。",
    },
    {
      title: "分别写下每天状态",
      text: "每天各自写下情绪、近况与关键词。系统记录你们在这片地方留下了什么。",
    },
    {
      title: "系统进行每日结算",
      text: "AI 把当天留下的影响转译成关系气候、共振主题与更轻的行动提示。",
    },
    {
      title: "让一片地方慢慢显形",
      text: "随着记录和结算累积，你们共同塑造的，不再只是聊天记录，而是一片地方。",
    },
  ];
  
  export default function HomeProcessShowcaseScreen() {
    return (
      <section data-fullpage-section className="fullpage-screen fullpage-stage">
        <div className="fullpage-grid-bg" />
        <div className="fullpage-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="screen-panel-rich p-8 sm:p-10">
              <p className="screen-kicker">How It Works</p>
              <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                从输入关系，
                <br />
                到生成环境。
              </h2>
              <p className="mt-6 screen-subcopy">
                共土的流程并不复杂，但它的转换方式很特别：人写下的是状态，系统给出的却不是结论，而是一片环境的变化。
              </p>
  
              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="screen-metric">
                  <p className="screen-metric-label">Step 1</p>
                  <p className="screen-metric-value">记录</p>
                </div>
                <div className="screen-metric">
                  <p className="screen-metric-label">Step 2</p>
                  <p className="screen-metric-value">转化</p>
                </div>
                <div className="screen-metric">
                  <p className="screen-metric-label">Step 3</p>
                  <p className="screen-metric-value">生长</p>
                </div>
              </div>
            </div>
  
            <div className="screen-panel-rich relative p-8 sm:p-10">
              <div className="process-line" />
  
              <div className="space-y-8">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-5">
                    <div className="process-dot" />
                    <div>
                      <p className="showcase-index">{String(index + 1).padStart(2, "0")}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-3 text-sm leading-8 text-zinc-300">
                        {step.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }