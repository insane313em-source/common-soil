import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import StatusPill from "@/components/StatusPill";
import SurfaceCard from "@/components/SurfaceCard";
import SoilScene from "@/components/SoilScene";
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
        <div className="mx-auto max-w-6xl">
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <StatusPill>Common Soil Status</StatusPill>
                <SectionTitle
                  title={garden.name ?? "共土"}
                  description={
                    latestSummary?.garden_change_text ??
                    "今天还没有完成结算，共土暂时保持安静。"
                  }
                />
                <p className="mt-2 max-w-2xl text-sm text-zinc-500">
                  {latestSummary?.ai_observation_text ??
                    "等双方都写下今日记录后，这里会出现每日观察。"}
                </p>
              </div>

              <div className="flex gap-3">
                <a
                  href="/write"
                  className="secondary-button rounded-full px-5 py-3 text-sm"
                >
                  去写今日记录
                </a>
                <a
                  href="/settle"
                  className="secondary-button rounded-full px-5 py-3 text-sm"
                >
                  去执行结算
                </a>
              </div>
            </div>
          </SurfaceCard>

          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <SurfaceCard className="p-6">
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
              </SurfaceCard>

              <div className="grid gap-4 md:grid-cols-2">
                <SurfaceCard className="p-5">
                  <p className="text-sm text-zinc-500">今日关系气候</p>
                  <p className="mt-3 leading-7 text-zinc-200">
                    {latestSummary?.relationship_weather ?? "还没有生成今日关系气候。"}
                  </p>
                </SurfaceCard>

                <SurfaceCard className="p-5">
                  <p className="text-sm text-zinc-500">今日共振主题</p>
                  <p className="mt-3 leading-7 text-zinc-200">
                    {latestSummary?.shared_theme ?? "还没有生成今日共振主题。"}
                  </p>
                </SurfaceCard>

                <SurfaceCard className="p-5">
                  <p className="text-sm text-zinc-500">隐喻建议</p>
                  <p className="mt-3 leading-7 text-zinc-200">
                    {latestSummary?.symbolic_suggestion ?? "今天还没有收到来自共土的轻声提醒。"}
                  </p>
                </SurfaceCard>

                <SurfaceCard className="p-5">
                  <p className="text-sm text-zinc-500">轻动作建议</p>
                  <p className="mt-3 leading-7 text-zinc-200">
                    {latestSummary?.gentle_action ?? "今天还没有生成轻动作建议。"}
                  </p>
                </SurfaceCard>
              </div>
            </div>

            <div className="space-y-4">
              <SurfaceCard className="p-5">
                <p className="text-sm text-zinc-500">土壤</p>
                <p className="mt-3 text-lg text-zinc-200">
                  {latestSummary?.soil_state ?? "未知"}
                </p>
              </SurfaceCard>

              <SurfaceCard className="p-5">
                <p className="text-sm text-zinc-500">光照</p>
                <p className="mt-3 text-lg text-zinc-200">
                  {latestSummary?.light_state ?? "未知"}
                </p>
              </SurfaceCard>

              <SurfaceCard className="p-5">
                <p className="text-sm text-zinc-500">生机</p>
                <p className="mt-3 text-lg text-zinc-200">
                  {latestSummary?.vitality_state ?? "未知"}
                </p>
              </SurfaceCard>

              <SurfaceCard className="p-5">
                <p className="text-sm text-zinc-500">连结</p>
                <p className="mt-3 text-lg text-zinc-200">
                  {latestSummary?.connection_state ?? "未知"}
                </p>
              </SurfaceCard>

              <SurfaceCard className="p-5">
                <p className="text-sm text-zinc-500">最近7天生长</p>
                <div className="mt-3 space-y-2 text-sm text-zinc-300">
                  <p>叶片：{visualState.leafCount}</p>
                  <p>花朵：{visualState.flowerCount}</p>
                  <p>光感：{visualState.lightLevel}</p>
                  <p>雾感：{visualState.mistLevel}</p>
                  <p>萤火：{visualState.fireflyCount}</p>
                </div>
              </SurfaceCard>
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