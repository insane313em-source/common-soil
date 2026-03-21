export default function HomeAtmosphereScreen() {
    return (
      <section data-fullpage-section className="fullpage-screen fullpage-stage">
        <div className="fullpage-grid-bg" />
        <div className="fullpage-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="screen-panel-rich relative overflow-hidden p-8 sm:p-10 lg:p-12">
            <div className="screen-orb screen-orb-a" />
            <div className="screen-orb screen-orb-b" />
            <div className="screen-orb screen-orb-c" />
  
            <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div>
                <p className="screen-kicker">Atmosphere</p>
                <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
                  共土不是页面，
                  <br />
                  它应该像一座正在运行的生态舱。
                </h2>
                <p className="mt-6 screen-subcopy">
                  关系不只存在于语言里，它也应该存在于空间、光感、天气、温度和被时间轻轻改变的细节里。共土最终想成为的，不只是网站，而是一种可以停留的环境。
                </p>
  
                <div className="mt-10 flex flex-wrap gap-3">
                  <span className="screen-chip">Light</span>
                  <span className="screen-chip">Mist</span>
                  <span className="screen-chip">Soil</span>
                  <span className="screen-chip">Signals</span>
                </div>
              </div>
  
              <div className="screen-panel relative h-[420px] overflow-hidden p-4">
                <div className="atmosphere-layer bg-[linear-gradient(180deg,rgba(9,20,36,0.88),rgba(5,10,18,0.94))]" />
  
                <div className="atmosphere-layer">
                  <div className="absolute left-[10%] top-[10%] h-40 w-40 rounded-full bg-cyan-300/10 blur-3xl" />
                  <div className="absolute right-[10%] top-[18%] h-32 w-32 rounded-full bg-teal-300/10 blur-3xl" />
                  <div className="absolute left-1/2 bottom-[10%] h-36 w-56 -translate-x-1/2 rounded-full bg-emerald-300/8 blur-3xl" />
                </div>
  
                <div className="atmosphere-layer">
                  <div className="atmosphere-ring left-[18%] top-[18%] h-32 w-32" />
                  <div className="atmosphere-ring left-[28%] top-[24%] h-52 w-52" />
                  <div className="atmosphere-ring left-[16%] top-[12%] h-72 w-72" />
                </div>
  
                <div className="absolute inset-x-8 bottom-8 grid gap-4 sm:grid-cols-2">
                  <div className="screen-metric">
                    <p className="screen-metric-label">Current Output</p>
                    <p className="screen-metric-value">庭院意义</p>
                  </div>
                  <div className="screen-metric">
                    <p className="screen-metric-label">Long-term Goal</p>
                    <p className="screen-metric-value">变幻的场景</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }