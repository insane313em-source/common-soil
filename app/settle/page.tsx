"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import NoticeCard from "@/components/NoticeCard";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase-browser";

type SettleResult = {
  source: "ai" | "fallback";
  aiErrorMessage: string | null;
  summaryDate: string;
  gardenChangeText: string;
  aiObservationText: string;
  symbolicSuggestion: string;
  relationshipWeather: string;
  sharedTheme: string;
  gentleAction: string;
  reflectionForA: string;
  reflectionForB: string;
  dailyLetter: string;
  regenerateCount: number;
};

type AccessState =
  | { status: "loading" }
  | { status: "not_logged_in" }
  | { status: "no_garden" }
  | { status: "ready"; gardenId: string };

function ReadableLabel({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">{label}</p>
      <p className="mt-3 text-sm leading-7 text-zinc-200">{value}</p>
    </div>
  );
}

function ReflectionCard({
  title,
  reflection,
}: {
  title: string;
  reflection: string;
}) {
  return (
    <div className="rounded-[28px] border border-zinc-800 bg-zinc-950/85 p-5">
      <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">{title}</p>
      <p className="mt-4 text-sm leading-8 text-zinc-200">{reflection}</p>
    </div>
  );
}

export default function SettlePage() {
  const supabase = createClient();

  const [accessState, setAccessState] = useState<AccessState>({ status: "loading" });
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<SettleResult | null>(null);

  function mapResult(data: any): SettleResult {
    const summary = data.summary ?? data;

    return {
      source: data.source ?? "ai",
      aiErrorMessage: data.aiErrorMessage ?? null,
      summaryDate: summary.summary_date,
      gardenChangeText: summary.garden_change_text ?? "",
      aiObservationText: summary.ai_observation_text ?? "",
      symbolicSuggestion: summary.symbolic_suggestion ?? "",
      relationshipWeather: summary.relationship_weather ?? "",
      sharedTheme: summary.shared_theme ?? "",
      gentleAction: summary.gentle_action ?? "",
      reflectionForA:
        summary.reflection_for_a ?? "你今天更像是在收着状态，并不是不在意。",
      reflectionForB:
        summary.reflection_for_b ?? "你今天的表达偏克制，但并没有真正抽离。",
      dailyLetter:
        summary.daily_letter ??
        "今天的共土没有剧烈变化，它更像是在安静地保存两个人还没说完的部分。",
      regenerateCount: Number(summary.regenerate_count ?? 0),
    };
  }

  useEffect(() => {
    async function checkAccessAndLoadTodaySummary() {
      setInitialLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAccessState({ status: "not_logged_in" });
        setInitialLoading(false);
        return;
      }

      const { data: memberRecord, error } = await supabase
        .from("garden_members")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (error || !memberRecord) {
        setAccessState({ status: "no_garden" });
        setInitialLoading(false);
        return;
      }

      const gardenId = memberRecord.garden_id;
      setAccessState({ status: "ready", gardenId });

      const today = new Date().toISOString().slice(0, 10);

      const { data: existingSummary, error: summaryError } = await supabase
        .from("daily_summaries")
        .select("*")
        .eq("garden_id", gardenId)
        .eq("summary_date", today)
        .maybeSingle();

      if (!summaryError && existingSummary) {
        setResult(
          mapResult({
            source: "ai",
            aiErrorMessage: null,
            summary: existingSummary,
          })
        );
      }

      setInitialLoading(false);
    }

    checkAccessAndLoadTodaySummary();
  }, [supabase]);

  async function handleSettle(forceRegenerate = false) {
    setLoading(true);
    setErrorMessage("");
    setMessage("");

    try {
      const response = await fetch("/api/settle-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ forceRegenerate }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "结算失败");
      }

      setResult(mapResult(data));
      setMessage(forceRegenerate ? "已重新生成今天的结算。" : "今日结算已生成。");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "执行结算时发生未知错误";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  const remainingRegenerations =
    result ? Math.max(0, 2 - result.regenerateCount) : 0;

  if (accessState.status === "loading" || initialLoading) {
    return (
      <PageContainer>
        <EmptyStateCard
          title="正在读取今日结算"
          description="我们正在检查登录状态，并尝试读取今天已经生成过的结算内容。"
        />
      </PageContainer>
    );
  }

  if (accessState.status === "not_logged_in") {
    return (
      <PageContainer>
        <EmptyStateCard
          title="你还没有登录"
          description="登录后，你才能对自己所属的共土执行每日结算。"
          primaryHref="/login"
          primaryLabel="去登录"
          secondaryHref="/signup"
          secondaryLabel="去注册"
        />
      </PageContainer>
    );
  }

  if (accessState.status === "no_garden") {
    return (
      <PageContainer>
        <EmptyStateCard
          title="你还没有加入任何共土"
          description="先创建一片共土，或者输入邀请码加入已有共土，之后才能开始每日结算。"
          primaryHref="/create"
          primaryLabel="创建共土"
          secondaryHref="/join"
          secondaryLabel="加入共土"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <Reveal>
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10" hover={false}>
            <SectionTitle
              eyebrow="Daily Settlement"
              title="今日结算"
              description="把今天留下的状态，整理成一份可以被慢慢读完的共土小结。"
            />
          </SurfaceCard>
        </Reveal>

        <Reveal delayMs={80}>
          <SurfaceCard className="mt-8 p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Settlement Action
                </p>
                <h2 className="mt-2 text-2xl font-medium text-white">
                  {result ? "查看或重新生成今天的结算" : "执行今天的结算"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                  {result
                    ? "今天的结算已经存在。你可以直接回看，也可以在限制次数内重新生成。"
                    : "当双方都写完今日记录后，这里会生成今天的共土变化、个体观察与一段写给今天的小文章。"}
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                {!result ? (
                  <button
                    onClick={() => handleSettle(false)}
                    disabled={loading}
                    className="primary-button rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
                  >
                    {loading ? "处理中..." : "执行今日结算"}
                  </button>
                ) : (
                  <button
                    onClick={() => handleSettle(true)}
                    disabled={loading || remainingRegenerations <= 0}
                    className="secondary-button rounded-full px-6 py-3 text-sm disabled:opacity-60"
                  >
                    重新生成（剩余 {remainingRegenerations} 次）
                  </button>
                )}
              </div>
            </div>
          </SurfaceCard>
        </Reveal>

        {message ? (
          <NoticeCard tone="success" className="mt-6">
            {message}
          </NoticeCard>
        ) : null}

        {errorMessage ? (
          <NoticeCard tone="error" className="mt-6">
            结算失败：{errorMessage}
          </NoticeCard>
        ) : null}

        {result ? (
          <>
            <Reveal delayMs={140}>
              <SurfaceCard className="mt-6 rounded-[32px] p-6 sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Today&apos;s Letter
                    </p>
                    <h2 className="mt-2 text-3xl font-semibold tracking-tight text-white">
                      今天的共土小结
                    </h2>
                    <p className="mt-3 text-sm text-zinc-500">
                      结算日期：{result.summaryDate} · 已重生成 {result.regenerateCount} / 2 次
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-cyan-400/15 bg-cyan-400/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-cyan-200/80">
                      {result.sharedTheme}
                    </span>
                    <span className="rounded-full border border-zinc-700 bg-zinc-900/80 px-3 py-1 text-xs uppercase tracking-[0.18em] text-zinc-300">
                      {result.source === "ai" ? "AI" : "Fallback"}
                    </span>
                  </div>
                </div>

                {result.source === "fallback" && result.aiErrorMessage ? (
                  <NoticeCard tone="warning" className="mt-5">
                    AI 未成功生成，本次使用了本地模板。原因：{result.aiErrorMessage}
                  </NoticeCard>
                ) : null}

                <div className="mt-6 rounded-[28px] border border-zinc-800 bg-[linear-gradient(to_bottom,rgba(16,20,30,0.82),rgba(8,10,16,0.92))] p-6 sm:p-8">
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Daily Letter
                  </p>
                  <p className="mt-5 text-[16px] leading-9 text-zinc-100 sm:text-[17px]">
                    {result.dailyLetter}
                  </p>
                </div>
              </SurfaceCard>
            </Reveal>

            <Reveal delayMs={180}>
              <SurfaceCard className="mt-6 p-6 sm:p-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Garden Reading
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                      今天的环境变化
                    </h3>
                  </div>

                  <div className="rounded-full border border-zinc-800 bg-zinc-950/80 px-4 py-2 text-sm text-zinc-300">
                    {result.gardenChangeText}
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <ReadableLabel label="关系气候" value={result.relationshipWeather} />
                  <ReadableLabel label="观察短句" value={result.aiObservationText} />
                  <ReadableLabel label="隐喻建议" value={result.symbolicSuggestion} />
                  <ReadableLabel label="轻动作建议" value={result.gentleAction} />
                </div>
              </SurfaceCard>
            </Reveal>

            <Reveal delayMs={220}>
              <SurfaceCard className="mt-6 p-6 sm:p-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Individual Reflection
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    给双方的今日观察
                  </h3>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <ReflectionCard title="给 A" reflection={result.reflectionForA} />
                  <ReflectionCard title="给 B" reflection={result.reflectionForB} />
                </div>
              </SurfaceCard>
            </Reveal>

            <Reveal delayMs={260}>
              <SurfaceCard className="mt-6 p-6 sm:p-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Structured Output
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                    结构化结算结果
                  </h3>
                </div>

                <div className="mt-6 space-y-3 rounded-[28px] border border-zinc-800 bg-zinc-950/90 p-5 sm:p-6">
                  <p className="text-sm leading-7 text-zinc-200">
                    <span className="text-zinc-500">日期：</span> {result.summaryDate}
                  </p>
                  <p className="text-sm leading-7 text-zinc-200">
                    <span className="text-zinc-500">共土变化：</span> {result.gardenChangeText}
                  </p>
                  <p className="text-sm leading-7 text-zinc-200">
                    <span className="text-zinc-500">观察短句：</span> {result.aiObservationText}
                  </p>
                  <p className="text-sm leading-7 text-zinc-200">
                    <span className="text-zinc-500">关系气候：</span> {result.relationshipWeather}
                  </p>
                  <p className="text-sm leading-7 text-zinc-200">
                    <span className="text-zinc-500">共振主题：</span> {result.sharedTheme}
                  </p>
                  <p className="text-sm leading-7 text-zinc-200">
                    <span className="text-zinc-500">隐喻建议：</span> {result.symbolicSuggestion}
                  </p>
                  <p className="text-sm leading-7 text-zinc-200">
                    <span className="text-zinc-500">轻动作建议：</span> {result.gentleAction}
                  </p>
                </div>
              </SurfaceCard>
            </Reveal>
          </>
        ) : null}
      </div>
    </PageContainer>
  );
}