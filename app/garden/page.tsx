import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
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
        <div className="mt-6 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.25em] text-zinc-500">
              Common Soil Status
            </p>
            <h1 className="mt-2 text-3xl font-semibold">
              {garden.name ?? "共土"}
            </h1>
            <p className="mt-3 max-w-2xl text-zinc-300">
              {latestSummary?.garden_change_text ?? "今天还没有完成结算，共土暂时保持安静。"}
            </p>
            <p className="mt-2 max-w-2xl text-sm text-zinc-500">
              {latestSummary?.ai_observation_text ?? "等双方都写下今日记录后，这里会出现每日观察。"}
            </p>
          </div>

          <div className="flex gap-3">
            <a
              href="/write"
              className="rounded-full border border-zinc-700 px-5 py-3 text-sm hover:bg-zinc-900"
            >
              去写今日记录
            </a>
            <a
              href="/settle"
              className="rounded-full border border-zinc-700 px-5 py-3 text-sm hover:bg-zinc-900"
            >
              去执行结算
            </a>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-gradient-to-b from-zinc-900 to-zinc-950 p-8">
              <div className="flex min-h-[420px] items-end justify-center rounded-2xl border border-zinc-800 bg-[radial-gradient(circle_at_top,rgba(120,160,120,0.15),transparent_45%),linear-gradient(to_bottom,rgba(30,41,59,0.35),rgba(10,10,10,0.9))] p-8">
                <div className="text-center">
                  <div className="relative mx-auto h-56 w-56 overflow-hidden rounded-full border border-zinc-700 bg-zinc-900/70">
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-emerald-950/60 to-transparent" />

                    {visualState.mistLevel > 0 ? (
                      <div className="absolute inset-6 rounded-full bg-zinc-300/5 blur-xl" />
                    ) : null}

                    {visualState.waterGlow ? (
                      <div className="absolute bottom-8 left-1/2 h-10 w-24 -translate-x-1/2 rounded-full bg-cyan-300/10 blur-md" />
                    ) : null}

                    {Array.from({ length: visualState.leafCount }).map((_, index) => (
                      <div
                        key={`leaf-${index}`}
                        className="absolute h-4 w-4 rounded-full bg-emerald-500/40 blur-sm"
                        style={{
                          left: `${20 + ((index * 13) % 60)}%`,
                          top: `${18 + ((index * 9) % 40)}%`,
                        }}
                      />
                    ))}

                    {Array.from({ length: visualState.flowerCount }).map((_, index) => (
                      <div
                        key={`flower-${index}`}
                        className="absolute h-3 w-3 rounded-full bg-pink-300/50 blur-sm"
                        style={{
                          left: `${25 + ((index * 11) % 50)}%`,
                          top: `${42 + ((index * 7) % 25)}%`,
                        }}
                      />
                    ))}

                    {Array.from({ length: visualState.fireflyCount }).map((_, index) => (
                      <div
                        key={`firefly-${index}`}
                        className="absolute h-2 w-2 rounded-full bg-amber-200/70 blur-[2px]"
                        style={{
                          left: `${15 + ((index * 17) % 70)}%`,
                          top: `${15 + ((index * 11) % 55)}%`,
                        }}
                      />
                    ))}

                    {visualState.lightLevel > 0 ? (
                      <div
                        className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full bg-amber-300/20 blur-2xl"
                        style={{
                          width: `${80 + visualState.lightLevel * 12}px`,
                          height: `${80 + visualState.lightLevel * 12}px`,
                        }}
                      />
                    ) : null}

                    <div className="absolute left-1/2 bottom-8 h-20 w-3 -translate-x-1/2 rounded-full bg-zinc-700/80" />
                    <div className="absolute left-1/2 bottom-20 h-16 w-20 -translate-x-1/2 rounded-full border border-zinc-700/40 bg-zinc-800/20" />
                  </div>

                  <p className="mt-6 text-sm text-zinc-500">
                    {latestSummary?.garden_change_text ?? "等待今日结算后生成共土变化"}
                  </p>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-600">
                    {latestSummary?.garden_change_type ?? "soil_waiting"}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm text-zinc-500">今日关系气候</p>
                <p className="mt-3 leading-7 text-zinc-200">
                  {latestSummary?.relationship_weather ?? "还没有生成今日关系气候。"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm text-zinc-500">今日共振主题</p>
                <p className="mt-3 leading-7 text-zinc-200">
                  {latestSummary?.shared_theme ?? "还没有生成今日共振主题。"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm text-zinc-500">隐喻建议</p>
                <p className="mt-3 leading-7 text-zinc-200">
                  {latestSummary?.symbolic_suggestion ?? "今天还没有收到来自共土的轻声提醒。"}
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
                <p className="text-sm text-zinc-500">轻动作建议</p>
                <p className="mt-3 leading-7 text-zinc-200">
                  {latestSummary?.gentle_action ?? "今天还没有生成轻动作建议。"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-500">土壤</p>
              <p className="mt-2 text-lg">{latestSummary?.soil_state ?? "未知"}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-500">光照</p>
              <p className="mt-2 text-lg">{latestSummary?.light_state ?? "未知"}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-500">生机</p>
              <p className="mt-2 text-lg">{latestSummary?.vitality_state ?? "未知"}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-500">连结</p>
              <p className="mt-2 text-lg">{latestSummary?.connection_state ?? "未知"}</p>
            </div>

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-5">
              <p className="text-sm text-zinc-500">最近7天生长</p>
              <div className="mt-3 space-y-2 text-sm text-zinc-300">
                <p>叶片：{visualState.leafCount}</p>
                <p>花朵：{visualState.flowerCount}</p>
                <p>光感：{visualState.lightLevel}</p>
                <p>雾感：{visualState.mistLevel}</p>
                <p>萤火：{visualState.fireflyCount}</p>
              </div>
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