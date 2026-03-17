"use client";

import { useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import { createClient } from "@/lib/supabase-browser";

type SettleResult = {
  summaryDate: string;
  gardenChangeText: string;
  aiObservationText: string;
  symbolicSuggestion: string;
  relationshipWeather: string;
  sharedTheme: string;
  gentleAction: string;
};

type AccessState =
  | { status: "loading" }
  | { status: "not_logged_in" }
  | { status: "no_garden" }
  | { status: "ready" };

export default function SettlePage() {
  const supabase = createClient();

  const [accessState, setAccessState] = useState<AccessState>({ status: "loading" });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<SettleResult | null>(null);

  useEffect(() => {
    async function checkAccess() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAccessState({ status: "not_logged_in" });
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
        return;
      }

      setAccessState({ status: "ready" });
    }

    checkAccess();
  }, [supabase]);

  async function handleSettle() {
    setLoading(true);
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/settle-ai", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "结算失败");
      }

      setResult({
        summaryDate: data.summary.summary_date,
        gardenChangeText: data.summary.garden_change_text,
        aiObservationText: data.summary.ai_observation_text,
        symbolicSuggestion: data.summary.symbolic_suggestion,
        relationshipWeather: data.summary.relationship_weather,
        sharedTheme: data.summary.shared_theme,
        gentleAction: data.summary.gentle_action,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "执行结算时发生未知错误";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  if (accessState.status === "loading") {
    return (
      <PageContainer>
        <EmptyStateCard
          title="正在确认你的状态"
          description="我们正在检查你是否已经登录，以及是否已经加入某片共土。"
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
      <div className="mx-auto max-w-4xl">
        <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
          <SectionTitle
            eyebrow="Daily Settlement"
            title="每日结算"
            description="这里只会对当前登录用户所属共土执行当天结算。"
          />
        </SurfaceCard>

        <SurfaceCard className="mt-8 p-6">
          <button
            onClick={handleSettle}
            disabled={loading}
            className="primary-button rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
          >
            {loading ? "结算中..." : "执行今日 AI 结算"}
          </button>
        </SurfaceCard>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-5 text-red-200">
            结算失败：{errorMessage}
          </div>
        ) : null}

        {result ? (
          <SurfaceCard className="mt-6 p-6">
            <h2 className="text-lg font-medium text-white">AI 结算成功</h2>

            <div className="mt-5 space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-sm">
                <span className="text-zinc-500">日期：</span> {result.summaryDate}
              </p>
              <p className="text-sm">
                <span className="text-zinc-500">共土变化：</span> {result.gardenChangeText}
              </p>
              <p className="text-sm">
                <span className="text-zinc-500">观察短句：</span> {result.aiObservationText}
              </p>
              <p className="text-sm">
                <span className="text-zinc-500">关系气候：</span> {result.relationshipWeather}
              </p>
              <p className="text-sm">
                <span className="text-zinc-500">共振主题：</span> {result.sharedTheme}
              </p>
              <p className="text-sm">
                <span className="text-zinc-500">隐喻建议：</span> {result.symbolicSuggestion}
              </p>
              <p className="text-sm">
                <span className="text-zinc-500">轻动作建议：</span> {result.gentleAction}
              </p>
            </div>
          </SurfaceCard>
        ) : null}
      </div>
    </PageContainer>
  );
}