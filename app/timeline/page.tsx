import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import { getCurrentGardenOrThrow } from "@/lib/garden-server";

type DailySummaryRecord = {
  id: string;
  summary_date: string;
  garden_change_type: string | null;
  garden_change_text: string | null;
  ai_observation_text: string | null;
  symbolic_suggestion: string | null;
  relationship_weather: string | null;
  shared_theme: string | null;
  gentle_action: string | null;
};

type SearchParams = Promise<{
  month?: string;
  type?: string;
}>;

export default async function TimelinePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  try {
    const params = await searchParams;
    const selectedMonth = params.month ?? "";
    const selectedType = params.type ?? "";

    const { supabase, garden } = await getCurrentGardenOrThrow();

    let query = supabase
      .from("daily_summaries")
      .select("*")
      .eq("garden_id", garden.id)
      .order("summary_date", { ascending: false });

    if (selectedMonth) {
      query = query.gte("summary_date", `${selectedMonth}-01`);
      query = query.lt("summary_date", `${selectedMonth}-32`);
    }

    if (selectedType) {
      query = query.eq("garden_change_type", selectedType);
    }

    const { data } = await query;

    const summaries = (data ?? []) as DailySummaryRecord[];

    const { data: allData } = await supabase
      .from("daily_summaries")
      .select("summary_date, garden_change_type")
      .eq("garden_id", garden.id)
      .order("summary_date", { ascending: false });

    const months = Array.from(
      new Set((allData ?? []).map((item) => item.summary_date.slice(0, 7)))
    );

    const types = Array.from(
      new Set(
        (allData ?? [])
          .map((item) => item.garden_change_type)
          .filter(Boolean)
      )
    ) as string[];

    return (
      <PageContainer>
        <div className="mx-auto max-w-5xl">
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
            <SectionTitle
              eyebrow="Growth Timeline"
              title="成长时间线"
              description="这里只记录当前共土发生过的变化，不展示双方原文。"
            />
          </SurfaceCard>

          <SurfaceCard className="mt-8 p-6">
            <form className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm text-zinc-300">按月份筛选</label>
                <select
                  name="month"
                  defaultValue={selectedMonth}
                  className="input-shell w-full rounded-2xl px-4 py-3"
                >
                  <option value="">全部月份</option>
                  {months.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-zinc-300">按变化类型筛选</label>
                <select
                  name="type"
                  defaultValue={selectedType}
                  className="input-shell w-full rounded-2xl px-4 py-3"
                >
                  <option value="">全部类型</option>
                  {types.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-end gap-3">
                <button
                  type="submit"
                  className="primary-button rounded-full px-6 py-3 text-sm font-medium"
                >
                  应用筛选
                </button>
                <a
                  href="/timeline"
                  className="secondary-button rounded-full px-6 py-3 text-sm"
                >
                  清空
                </a>
              </div>
            </form>
          </SurfaceCard>

          <div className="mt-8 space-y-4">
            {summaries.length > 0 ? (
              summaries.map((item) => (
                <SurfaceCard key={item.id} className="p-6">
                  <p className="text-sm text-zinc-500">{item.summary_date}</p>
                  <h2 className="mt-3 text-xl font-medium text-white">
                    {item.garden_change_text}
                  </h2>
                  <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-600">
                    {item.garden_change_type ?? "unknown_change"}
                  </p>
                  <p className="mt-4 leading-7 text-zinc-400">
                    {item.ai_observation_text}
                  </p>

                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        关系气候
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {item.relationship_weather ?? "暂无"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        共振主题
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {item.shared_theme ?? "暂无"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        隐喻建议
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {item.symbolic_suggestion ?? "暂无"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        轻动作建议
                      </p>
                      <p className="mt-2 text-sm leading-6 text-zinc-300">
                        {item.gentle_action ?? "暂无"}
                      </p>
                    </div>
                  </div>
                </SurfaceCard>
              ))
            ) : (
              <SurfaceCard className="p-6 text-zinc-400">
                当前筛选条件下还没有结算记录。
              </SurfaceCard>
            )}
          </div>
        </div>
      </PageContainer>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "暂时无法读取时间线";

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
              : "时间线暂不可用"
          }
          description={
            isLoginError
              ? "登录后，你才能查看自己所属共土的成长时间线。"
              : isNoGardenError
              ? "你已经登录，但还没有进入任何共土。先创建或加入一片共土，这里才会开始积累共同的时间痕迹。"
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