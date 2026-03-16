"use client";

import { FormEvent, useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import { createClient } from "@/lib/supabase-browser";
import { joinKeywords } from "@/lib/helpers";

type SubmitResult = {
  gardenId: string;
  mood: string;
  content: string;
  keywords: string[];
  entryDate: string;
};

const moodOptions = [
  "平静",
  "疲惫",
  "开心",
  "焦虑",
  "想念",
  "混乱",
  "委屈",
  "期待",
];

type AccessState =
  | { status: "loading" }
  | { status: "not_logged_in" }
  | { status: "no_garden" }
  | { status: "ready" };

export default function WritePage() {
  const supabase = createClient();

  const [accessState, setAccessState] = useState<AccessState>({ status: "loading" });

  const [mood, setMood] = useState("平静");
  const [content, setContent] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<SubmitResult | null>(null);

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

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");
    setResult(null);

    const finalContent = content.trim();
    const finalKeywords = joinKeywords(keywordsInput);
    const today = new Date().toISOString().slice(0, 10);

    if (!finalContent) {
      setErrorMessage("今日记录不能为空");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(userError.message);
      }

      if (!user) {
        throw new Error("请先登录后再写记录");
      }

      const { data: memberRecord, error: memberError } = await supabase
        .from("garden_members")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (memberError) {
        throw new Error(memberError.message);
      }

      if (!memberRecord) {
        throw new Error("你还没有加入任何共土");
      }

      const gardenId = memberRecord.garden_id;

      const { data: existingEntry, error: existingError } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("garden_id", gardenId)
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (existingEntry) {
        throw new Error("你今天已经提交过记录了");
      }

      const { data: insertedEntry, error: insertError } = await supabase
        .from("daily_entries")
        .insert({
          garden_id: gardenId,
          user_id: user.id,
          entry_date: today,
          mood,
          content: finalContent,
          keywords: finalKeywords,
        })
        .select()
        .single();

      if (insertError) {
        throw new Error(insertError.message);
      }

      setResult({
        gardenId: insertedEntry.garden_id,
        mood: insertedEntry.mood,
        content: insertedEntry.content,
        keywords: insertedEntry.keywords ?? [],
        entryDate: insertedEntry.entry_date,
      });

      setMood("平静");
      setContent("");
      setKeywordsInput("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "提交记录时发生未知错误";
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
          description="登录后，你才能写下今天的情绪、近况和没有说出口的话。"
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
          description="先创建一片共土，或者输入邀请码加入已有共土，之后才能开始每日记录。"
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
      <div className="mx-auto max-w-3xl">
        <h1 className="mt-6 text-3xl font-semibold">今日记录</h1>
        <p className="mt-3 text-zinc-400">
          写下一点今天的情绪、近况和没有说出口的话。对方不会直接看见原文。
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <label className="mb-2 block text-sm text-zinc-300">今日情绪</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
          >
            {moodOptions.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <label className="mt-6 mb-2 block text-sm text-zinc-300">今日记录</label>
          <textarea
            rows={8}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="写下一点今天的近况、心情或对某件事的看法……"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          />

          <label className="mt-6 mb-2 block text-sm text-zinc-300">今日关键词</label>
          <input
            type="text"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="例如：工作, 雨天, 惦记"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "提交中..." : "提交今天的记录"}
          </button>
        </form>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950/40 p-5 text-red-200">
            <p className="text-sm">提交失败：{errorMessage}</p>
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-6 text-emerald-100">
            <h2 className="text-lg font-medium">记录提交成功</h2>
            <p className="mt-3 text-sm text-emerald-200/90">
              今天的记录已经写入共土。
            </p>

            <div className="mt-4 space-y-3 rounded-xl border border-emerald-800/70 bg-zinc-950 p-4">
              <p className="text-sm">
                <span className="text-emerald-400">日期：</span> {result.entryDate}
              </p>
              <p className="text-sm">
                <span className="text-emerald-400">情绪：</span> {result.mood}
              </p>
              <p className="text-sm">
                <span className="text-emerald-400">关键词：</span>{" "}
                {result.keywords.length > 0 ? result.keywords.join(", ") : "无"}
              </p>
              <p className="text-sm whitespace-pre-wrap leading-7 text-zinc-200">
                <span className="text-emerald-400">内容：</span> {result.content}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}