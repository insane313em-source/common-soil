export const dynamic = "force-dynamic";

import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import Reveal from "@/components/Reveal";
import { getCurrentGardenOrThrow, getCurrentUserOrThrow } from "@/lib/garden-server";

type EntryRecord = {
  id: string;
  entry_date: string;
  mood: string;
  content: string;
  keywords: string[] | null;
};

type SummaryRecord = {
  summary_date: string;
  garden_change_text: string | null;
};

type DeliveryRecord = {
  id: string;
  delivery_date: string;
  raw_message: string;
  translated_message: string;
  delivery_mode?: "ai" | "direct";
};

export default async function MyEntriesPage() {
  try {
    const { supabase, user, garden } = await getCurrentGardenOrThrow();

    const { data: entriesData, error: entriesError } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("garden_id", garden.id)
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false });

    if (entriesError) {
      throw new Error(entriesError.message);
    }

    const entries = (entriesData ?? []) as EntryRecord[];

    const { data: summariesData } = await supabase
      .from("daily_summaries")
      .select("summary_date, garden_change_text")
      .eq("garden_id", garden.id);

    const summaries = (summariesData ?? []) as SummaryRecord[];
    const summaryMap = new Map(
      summaries.map((item) => [item.summary_date, item.garden_change_text])
    );

    const { data: deliveriesData, error: deliveriesError } = await supabase
      .from("daily_deliveries")
      .select("id, delivery_date, raw_message, translated_message, delivery_mode")
      .eq("garden_id", garden.id)
      .eq("user_id", user.id)
      .order("delivery_date", { ascending: false });

    if (deliveriesError) {
      throw new Error(deliveriesError.message);
    }

    const deliveries = (deliveriesData ?? []) as DeliveryRecord[];

    return (
      <PageContainer>
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10" hover={false}>
              <SectionTitle
                eyebrow="My Entries"
                title="我的记录"
                description="这里可以回看你过去写下的记录，以及你曾公开给对方的历史转递。"
              />
            </SurfaceCard>
          </Reveal>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="space-y-4">
              <Reveal>
                <SurfaceCard className="p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    My Daily Entries
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    历史记录
                  </h2>
                </SurfaceCard>
              </Reveal>

              {entries.length > 0 ? (
                entries.map((entry, index) => {
                  const settlementText = summaryMap.get(entry.entry_date);

                  return (
                    <Reveal key={entry.id} delayMs={index * 40}>
                      <SurfaceCard className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-sm text-zinc-500">{entry.entry_date}</p>
                            <h3 className="mt-2 text-lg font-medium text-white">
                              今日情绪：{entry.mood}
                            </h3>
                          </div>

                          <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-300">
                            {settlementText ? "已结算" : "未结算"}
                          </span>
                        </div>

                        <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                            关键词
                          </p>
                          <p className="mt-3 text-sm leading-7 text-zinc-200">
                            {entry.keywords && entry.keywords.length > 0
                              ? entry.keywords.join("，")
                              : "无"}
                          </p>
                        </div>

                        <details className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                          <summary className="cursor-pointer text-sm text-zinc-300">
                            展开查看原文
                          </summary>
                          <p className="mt-4 whitespace-pre-wrap text-sm leading-8 text-zinc-200">
                            {entry.content}
                          </p>
                        </details>

                        {settlementText ? (
                          <div className="mt-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                              当天共土变化
                            </p>
                            <p className="mt-3 text-sm leading-8 text-emerald-50">
                              {settlementText}
                            </p>
                          </div>
                        ) : null}
                      </SurfaceCard>
                    </Reveal>
                  );
                })
              ) : (
                <Reveal>
                  <SurfaceCard className="p-6 text-zinc-400">
                    你还没有写过任何历史记录。
                  </SurfaceCard>
                </Reveal>
              )}
            </div>

            <div className="space-y-4">
              <Reveal>
                <SurfaceCard className="p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    My Daily Deliveries
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    历史转递
                  </h2>
                </SurfaceCard>
              </Reveal>

              {deliveries.length > 0 ? (
                deliveries.map((delivery, index) => (
                  <Reveal key={delivery.id} delayMs={index * 40}>
                    <SurfaceCard className="p-6">
                      <p className="text-sm text-zinc-500">{delivery.delivery_date}</p>

                      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                          我当时写下的原话
                        </p>
                        <p className="mt-3 text-sm leading-8 text-zinc-200">
                          {delivery.raw_message}
                        </p>
                      </div>

                      <div className="mt-4 rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-4">
                        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                          {delivery.delivery_mode === "direct"
                            ? "对方看到的原话"
                            : "对方看到的转译版本"}
                        </p>
                        <p className="mt-3 text-sm leading-8 text-cyan-50">
                          {delivery.translated_message}
                        </p>
                      </div>
                    </SurfaceCard>
                  </Reveal>
                ))
              ) : (
                <Reveal>
                  <SurfaceCard className="p-6 text-zinc-400">
                    你还没有公开过任何历史转递。
                  </SurfaceCard>
                </Reveal>
              )}
            </div>
          </div>
        </div>
      </PageContainer>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "暂时无法读取你的记录";

    const isLoginError = message.includes("请先登录");
    const isNoGardenError = message.includes("你还没有加入任何庭院");

    if (isNoGardenError) {
      try {
        await getCurrentUserOrThrow();

        return (
          <PageContainer>
            <EmptyStateCard
              title="你还没有加入任何共土"
              description="先创建一片共土，或者输入邀请码加入已有共土，之后才能查看自己的历史记录。"
              primaryHref="/create"
              primaryLabel="创建共土"
              secondaryHref="/join"
              secondaryLabel="加入共土"
            />
          </PageContainer>
        );
      } catch {
        return (
          <PageContainer>
            <EmptyStateCard
              title="你还没有登录"
              description="登录后，你才能查看自己写下过的每日记录。"
              primaryHref="/login"
              primaryLabel="去登录"
              secondaryHref="/signup"
              secondaryLabel="去注册"
            />
          </PageContainer>
        );
      }
    }

    return (
      <PageContainer>
        <EmptyStateCard
          title={isLoginError ? "你还没有登录" : "我的记录暂不可用"}
          description={
            isLoginError
              ? "登录后，你才能查看自己写下过的每日记录。"
              : message
          }
          primaryHref={isLoginError ? "/login" : "/home"}
          primaryLabel={isLoginError ? "去登录" : "返回总览"}
          secondaryHref={isLoginError ? "/signup" : "/write"}
          secondaryLabel={isLoginError ? "去注册" : "去写记录"}
        />
      </PageContainer>
    );
  }
}