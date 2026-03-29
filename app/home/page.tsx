export const dynamic = "force-dynamic";

import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import InviteCodeCard from "@/components/InviteCodeCard";
import SectionTitle from "@/components/SectionTitle";
import StatusPill from "@/components/StatusPill";
import SurfaceCard from "@/components/SurfaceCard";
import Reveal from "@/components/Reveal";
import { getCurrentGardenOrThrow, getCurrentUserOrThrow } from "@/lib/garden-server";

type MembershipRecord = {
  id: string;
  garden_id: string;
  user_id: string;
  role: string;
};

type DailyEntryRecord = {
  id: string;
  entry_date: string;
  mood: string;
};

type DailySummaryRecord = {
  id: string;
  summary_date: string;
  garden_change_text: string | null;
};

type DeliveryRecord = {
  translated_message: string;
  delivery_mode?: "ai" | "direct";
};

export default async function HomePage() {
  try {
    const { supabase, user, membership, garden } = await getCurrentGardenOrThrow();
    const today = new Date().toISOString().slice(0, 10);

    const { data: todayEntry } = await supabase
      .from("daily_entries")
      .select("*")
      .eq("garden_id", garden.id)
      .eq("user_id", user.id)
      .eq("entry_date", today)
      .maybeSingle();

    const { data: todaySummary } = await supabase
      .from("daily_summaries")
      .select("*")
      .eq("garden_id", garden.id)
      .eq("summary_date", today)
      .maybeSingle();

    const { data: membersData } = await supabase
      .from("garden_members")
      .select("*")
      .eq("garden_id", garden.id);

    const members = (membersData ?? []) as MembershipRecord[];
    const memberCount = members.length;
    const partner = members.find((item) => item.user_id !== user.id);

    let partnerDelivery: DeliveryRecord | null = null;
    let myTodayDelivery: DeliveryRecord | null = null;

    if (partner) {
      const { data: partnerTodayDelivery } = await supabase
        .from("daily_deliveries")
        .select("translated_message, delivery_mode")
        .eq("garden_id", garden.id)
        .eq("user_id", partner.user_id)
        .eq("delivery_date", today)
        .eq("is_shared", true)
        .maybeSingle();

      if (partnerTodayDelivery) {
        partnerDelivery = partnerTodayDelivery as DeliveryRecord;
      }
    }

    const { data: myDelivery } = await supabase
      .from("daily_deliveries")
      .select("translated_message, delivery_mode")
      .eq("garden_id", garden.id)
      .eq("user_id", user.id)
      .eq("delivery_date", today)
      .eq("is_shared", true)
      .maybeSingle();

    if (myDelivery) {
      myTodayDelivery = myDelivery as DeliveryRecord;
    }

    const entry = todayEntry as DailyEntryRecord | null;
    const summary = todaySummary as DailySummaryRecord | null;

    return (
      <PageContainer>
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10" hover={false}>
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <StatusPill>Common Soil Home</StatusPill>
                  <SectionTitle
                    title="我的共土"
                    description="这里会显示当前共土状态、今日记录状态，以及双方今天公开的转递内容。"
                  />
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 px-5 py-4 text-sm text-zinc-300">
                  当前账号：{user.email ?? "已登录用户"}
                </div>
              </div>
            </SurfaceCard>
          </Reveal>

          {partnerDelivery ? (
            <Reveal delayMs={60}>
              <SurfaceCard className="mt-6 rounded-[30px] border border-cyan-900/40 bg-cyan-950/15 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-cyan-300/70">
                  Today Delivery From Partner
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  对方今天转递给你的一句话
                </h2>
                <p className="mt-5 text-[16px] leading-9 text-cyan-50">
                  {partnerDelivery.translated_message}
                </p>
              </SurfaceCard>
            </Reveal>
          ) : null}

          {myTodayDelivery ? (
            <Reveal delayMs={80}>
              <SurfaceCard className="mt-6 rounded-[30px] border border-emerald-900/40 bg-emerald-950/15 p-6">
                <p className="text-xs uppercase tracking-[0.22em] text-emerald-300/70">
                  My Delivery Today
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  我今天公开给对方的一句话
                </h2>
                <p className="mt-5 text-[16px] leading-9 text-emerald-50">
                  {myTodayDelivery.translated_message}
                </p>
              </SurfaceCard>
            </Reveal>
          ) : null}

          <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-6">
              <Reveal delayMs={100}>
                <SurfaceCard className="p-6">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    当前共土
                  </p>
                  <h2 className="mt-3 text-3xl font-semibold text-white">
                    {garden.name ?? "共土"}
                  </h2>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        角色
                      </p>
                      <p className="mt-3 text-sm text-zinc-300">
                        {membership.role === "owner" ? "创建者" : "成员"}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        成员数
                      </p>
                      <p className="mt-3 text-sm text-zinc-300">
                        {memberCount} / 2
                      </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                        今日状态
                      </p>
                      <p className="mt-3 text-sm text-zinc-300">
                        {entry && summary
                          ? "记录完成，结算完成"
                          : entry
                          ? "已记录，待结算"
                          : "等待记录"}
                      </p>
                    </div>
                  </div>
                </SurfaceCard>
              </Reveal>

              <Reveal delayMs={120}>
                <InviteCodeCard inviteCode={garden.invite_code ?? "暂无"} />
              </Reveal>

              <div className="grid gap-6 md:grid-cols-2">
                <Reveal delayMs={160}>
                  <SurfaceCard className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      今日记录状态
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      {entry ? "已完成" : "未完成"}
                    </h3>
                    <p className="mt-4 leading-7 text-zinc-400">
                      {entry
                        ? `你今天已经写下了一条记录，当前情绪是「${entry.mood}」。`
                        : "你今天还没有写记录。"}
                    </p>
                    <a
                      href="/write"
                      className="secondary-button mt-6 inline-flex rounded-full px-5 py-3 text-sm"
                    >
                      {entry ? "查看记录页" : "去写今日记录"}
                    </a>
                  </SurfaceCard>
                </Reveal>

                <Reveal delayMs={200}>
                  <SurfaceCard className="p-6">
                    <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                      今日结算状态
                    </p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      {summary ? "已完成" : "未完成"}
                    </h3>
                    <p className="mt-4 leading-7 text-zinc-400">
                      {summary
                        ? `今天已经完成结算：${summary.garden_change_text ?? "已生成今日变化"}`
                        : "今天还没有完成结算。"}
                    </p>
                    <a
                      href="/settle"
                      className="secondary-button mt-6 inline-flex rounded-full px-5 py-3 text-sm"
                    >
                      {summary ? "查看结算页" : "去执行结算"}
                    </a>
                  </SurfaceCard>
                </Reveal>
              </div>

              <Reveal delayMs={240}>
                <SurfaceCard className="p-6">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    快捷入口
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a href="/garden" className="primary-button rounded-full px-5 py-3 text-sm font-medium">
                      查看共土
                    </a>
                    <a href="/timeline" className="secondary-button rounded-full px-5 py-3 text-sm">
                      查看时间线
                    </a>
                    <a href="/write" className="secondary-button rounded-full px-5 py-3 text-sm">
                      写记录 / 今日转递
                    </a>
                    <a href="/my-entries" className="secondary-button rounded-full px-5 py-3 text-sm">
                      我的记录
                    </a>
                    <a href="/settle" className="secondary-button rounded-full px-5 py-3 text-sm">
                      去结算
                    </a>
                  </div>
                </SurfaceCard>
              </Reveal>
            </div>

            <div className="space-y-4">
              <Reveal delayMs={120}>
                <SurfaceCard className="p-5">
                  <p className="text-sm text-zinc-500">当前账号</p>
                  <p className="mt-3 break-all text-sm leading-6 text-zinc-300">
                    {user.email ?? "未知邮箱"}
                  </p>
                </SurfaceCard>
              </Reveal>

              <Reveal delayMs={160}>
                <SurfaceCard className="p-5">
                  <p className="text-sm text-zinc-500">今日日期</p>
                  <p className="mt-3 text-sm text-zinc-300">{today}</p>
                </SurfaceCard>
              </Reveal>

              <Reveal delayMs={200}>
                <SurfaceCard className="p-5">
                  <p className="text-sm text-zinc-500">当前进度</p>
                  <div className="mt-3 space-y-2 text-sm text-zinc-300">
                    <p>加入共土：已完成</p>
                    <p>今日记录：{entry ? "已完成" : "未完成"}</p>
                    <p>今日结算：{summary ? "已完成" : "未完成"}</p>
                    <p>我今日转递：{myTodayDelivery ? "已公开" : "暂无"}</p>
                    <p>收到对方转递：{partnerDelivery ? "已收到" : "暂无"}</p>
                  </div>
                </SurfaceCard>
              </Reveal>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "暂时无法读取你的共土信息";

    const isLoginError = message.includes("请先登录");
    const isNoGardenError = message.includes("你还没有加入任何庭院");

    if (isNoGardenError) {
      try {
        const { user } = await getCurrentUserOrThrow();

        return (
          <PageContainer>
            <EmptyStateCard
              title="你还没有加入任何共土"
              description={`当前账号 ${user.email ?? ""} 已登录，但还没有进入任何共土。先创建一片新的共土，或者输入邀请码加入已有共土。`}
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
              description="登录后，你才能查看自己的共土总览状态。"
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
          title={isLoginError ? "你还没有登录" : "总览页暂不可用"}
          description={
            isLoginError
              ? "登录后，你才能查看自己的共土总览状态。"
              : message
          }
          primaryHref={isLoginError ? "/login" : "/"}
          primaryLabel={isLoginError ? "去登录" : "返回首页"}
          secondaryHref={isLoginError ? "/signup" : "/garden"}
          secondaryLabel={isLoginError ? "去注册" : "查看共土"}
        />
      </PageContainer>
    );
  }
}