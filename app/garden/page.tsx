import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import StatusPill from "@/components/StatusPill";
import SoilScene from "@/components/SoilScene";
import Reveal from "@/components/Reveal";
import GardenStatusMatrix from "@/components/GardenStatusMatrix";
import GardenInsightPanel from "@/components/GardenInsightPanel";
import GardenTrendPanel from "@/components/GardenTrendPanel";
import { buildGardenVisualState } from "@/lib/garden-visual";
import { getCurrentGardenOrThrow } from "@/lib/garden-server";

type DailySummaryRecord = {
  id: string;
  summary_date: string;
  garden_change_type: string | null;
  garden_change_text: string | null;
  ai_observation_text: string | null;
  soil_state: string | null;
  light_state: string | null;
  vitality_state: string | null;
  connection_state: string | null;
  symbolic_suggestion: string | null;
  relationship_weather: string | null;
  shared_theme: string | null;
  gentle_action: string | null;
};

export default async function GardenPage() {
  try {
    const { supabase, garden } = await getCurrentGardenOrThrow();

    const { data: latestData } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("garden_id", garden.id)
      .order("summary_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    const latestSummary = latestData as DailySummaryRecord | null;

    const { data: recentData } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("garden_id", garden.id)
      .order("summary_date", { ascending: false })
      .limit(7);

    const recentSummaries = (recentData ?? []) as DailySummaryRecord[];
    const visualState = buildGardenVisualState(recentSummaries);

    return (
      <PageContainer>
        <div className="mx-auto max-w-7xl garden-shell">
          <Reveal>
            <section className="garden-hero-panel p-8 sm:p-10 lg:p-12">
              <div className="garden-orb garden-orb-a" />
              <div className="garden-orb garden-orb-b" />
              <div className="garden-orb garden-orb-c" />

              <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
                <div>
                  <StatusPill>Common Soil Scene</StatusPill>
                  <div className="mt-4">
                    <SectionTitle
                      title={garden.name ?? "共土"}
                      description={
                        latestSummary?.garden_change_text ??
                        "今天还没有完成结算，这片共土暂时维持安静。"
                      }
                    />
                  </div>

                  <p className="mt-5 max-w-3xl garden-copy">
                    {latestSummary?.ai_observation_text ??
                      "当双方都写下今日记录并完成结算后，这里会开始出现属于这片共土的观察、温度与生长变化。"}
                  </p>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <a
                      href="/write"
                      className="secondary-button rounded-full px-5 py-3 text-sm"
                    >
                      去写今日记录
                    </a>
                    <a
                      href="/settle"
                      className="primary-button rounded-full px-5 py-3 text-sm font-medium"
                    >
                      去执行结算
                    </a>
                    <a
                      href="/timeline"
                      className="secondary-button rounded-full px-5 py-3 text-sm"
                    >
                      查看成长时间线
                    </a>
                  </div>

                  <div className="mt-8 grid gap-4 sm:grid-cols-3">
                    <div className="garden-mini-card">
                      <p className="garden-label">今日状态</p>
                      <p className="garden-value">
                        {latestSummary?.garden_change_type ?? "waiting"}
                      </p>
                    </div>

                    <div className="garden-mini-card">
                      <p className="garden-label">最近结算日</p>
                      <p className="garden-value">
                        {latestSummary?.summary_date ?? "暂无"}
                      </p>
                    </div>

                    <div className="garden-mini-card">
                      <p className="garden-label">本周记录数</p>
                      <p className="garden-value">{recentSummaries.length}</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[30px] border border-cyan-400/10 bg-[linear-gradient(to_bottom,rgba(10,18,31,0.70),rgba(5,9,16,0.90))] p-4">
                  <SoilScene
                    leafCount={visualState.leafCount}
                    flowerCount={visualState.flowerCount}
                    lightLevel={visualState.lightLevel}
                    mistLevel={visualState.mistLevel}
                    fireflyCount={visualState.fireflyCount}
                    waterGlow={visualState.waterGlow}
                    title={
                      latestSummary?.garden_change_text ?? "等待今日结算后生成共土变化"
                    }
                    subtitle={latestSummary?.garden_change_type ?? "soil_waiting"}
                  />
                </div>
              </div>
            </section>
          </Reveal>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <Reveal delayMs={80}>
                <section className="garden-hero-panel p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="garden-label">Environmental Matrix</p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        当前环境状态
                      </h2>
                    </div>

                    <div className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-xs tracking-[0.18em] text-cyan-200/80 uppercase">
                      Live State
                    </div>
                  </div>

                  <div className="mt-6">
                    <GardenStatusMatrix
                      soilState={latestSummary?.soil_state}
                      lightState={latestSummary?.light_state}
                      vitalityState={latestSummary?.vitality_state}
                      connectionState={latestSummary?.connection_state}
                    />
                  </div>
                </section>
              </Reveal>

              <Reveal delayMs={140}>
                <section className="garden-hero-panel p-6 sm:p-8">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="garden-label">Interpretation Layer</p>
                      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                        今日关系观察
                      </h2>
                    </div>
                  </div>

                  <div className="mt-6">
                    <GardenInsightPanel
                      relationshipWeather={latestSummary?.relationship_weather}
                      sharedTheme={latestSummary?.shared_theme}
                      symbolicSuggestion={latestSummary?.symbolic_suggestion}
                      gentleAction={latestSummary?.gentle_action}
                    />
                  </div>
                </section>
              </Reveal>
            </div>

            <div className="space-y-6">
              <Reveal delayMs={100}>
                <section className="garden-hero-panel p-6 sm:p-8">
                  <p className="garden-label">Growth Reading</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    生长信号
                  </h2>
                  <p className="mt-4 garden-copy">
                    这部分不是给关系打分，而是把最近几天累积下来的视觉倾向读出来。它们决定这片共土看起来更明亮、更潮湿、更有生机，还是更安静、更慢、更克制。
                  </p>

                  <div className="mt-6">
                    <GardenTrendPanel
                      leafCount={visualState.leafCount}
                      flowerCount={visualState.flowerCount}
                      lightLevel={visualState.lightLevel}
                      mistLevel={visualState.mistLevel}
                      fireflyCount={visualState.fireflyCount}
                      waterGlow={visualState.waterGlow}
                    />
                  </div>
                </section>
              </Reveal>

              <Reveal delayMs={180}>
                <section className="garden-hero-panel p-6 sm:p-8">
                  <p className="garden-label">Scene Direction</p>
                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                    接下来它该变得更真实
                  </h2>
                  <p className="mt-4 garden-copy">
                    你现在看到的是共土的第一代主场景结构：状态、观察、趋势与视觉已经被组织起来。下一步就可以把这套结构替换成真正的分层庭院素材，让环境变化不只停留在描述里，而是直接被看见。
                  </p>

                  <div className="mt-6 grid gap-4 sm:grid-cols-2">
                    <div className="garden-mini-card">
                      <p className="garden-label">当前阶段</p>
                      <p className="garden-value">Structured Scene UI</p>
                    </div>
                    <div className="garden-mini-card">
                      <p className="garden-label">下一阶段</p>
                      <p className="garden-value">Layered Visual Garden</p>
                    </div>
                  </div>

                  <div className="mt-8 garden-soft-line" />

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="/timeline"
                      className="secondary-button rounded-full px-5 py-3 text-sm"
                    >
                      查看时间线
                    </a>
                    <a
                      href="/settings"
                      className="secondary-button rounded-full px-5 py-3 text-sm"
                    >
                      共土设置
                    </a>
                  </div>
                </section>
              </Reveal>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "暂时无法读取共土信息";

    const isLoginError = message.includes("请先登录");
    const isNoGardenError = message.includes("你还没有加入任何庭院");

    return (
      <PageContainer>
        <EmptyStateCard
          title={
            isLoginError
              ? "你还没有登录"
              : isNoGardenError
              ? "你还没有加入任何共土"
              : "共土暂不可用"
          }
          description={
            isLoginError
              ? "登录后，你才能查看自己所属的共土状态、每日变化与累积生长。"
              : isNoGardenError
              ? "你已经登录，但还没有进入任何共土。先创建一片新的共土，或者输入邀请码加入已有共土。"
              : message
          }
          primaryHref={isLoginError ? "/login" : "/create"}
          primaryLabel={isLoginError ? "去登录" : "创建共土"}
          secondaryHref={isLoginError ? "/signup" : "/join"}
          secondaryLabel={isLoginError ? "去注册" : "加入共土"}
        />
      </PageContainer>
    );
  }
}