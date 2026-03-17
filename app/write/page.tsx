"use client";

import { FormEvent, useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import { createClient } from "@/lib/supabase-browser";
import { joinKeywords } from "@/lib/helpers";

type EntryRecord = {
  id: string;
  garden_id: string;
  user_id: string;
  entry_date: string;
  mood: string;
  content: string;
  keywords: string[] | null;
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
  | { status: "ready"; gardenId: string; userId: string };

export default function WritePage() {
  const supabase = createClient();

  const [accessState, setAccessState] = useState<AccessState>({ status: "loading" });

  const [mood, setMood] = useState("平静");
  const [content, setContent] = useState("");
  const [keywordsInput, setKeywordsInput] = useState("");
  const [todayEntry, setTodayEntry] = useState<EntryRecord | null>(null);
  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAccessAndLoadEntry() {
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

      const gardenId = memberRecord.garden_id;
      setAccessState({ status: "ready", gardenId, userId: user.id });

      const today = new Date().toISOString().slice(0, 10);

      const { data: existingEntry } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("garden_id", gardenId)
        .eq("user_id", user.id)
        .eq("entry_date", today)
        .maybeSingle();

      const entry = (existingEntry as EntryRecord | null) ?? null;
      setTodayEntry(entry);

      if (entry) {
        setMood(entry.mood);
        setContent(entry.content);
        setKeywordsInput(entry.keywords?.join(", ") ?? "");
      }
    }

    checkAccessAndLoadEntry();
  }, [supabase]);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (accessState.status !== "ready") return;

    setErrorMessage("");
    setMessage("");

    const finalContent = content.trim();
    const finalKeywords = joinKeywords(keywordsInput);
    const today = new Date().toISOString().slice(0, 10);

    if (!finalContent) {
      setErrorMessage("今日记录不能为空");
      return;
    }

    try {
      setLoading(true);

      const { data: insertedEntry, error: insertError } = await supabase
        .from("daily_entries")
        .insert({
          garden_id: accessState.gardenId,
          user_id: accessState.userId,
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

      const entry = insertedEntry as EntryRecord;
      setTodayEntry(entry);
      setMood(entry.mood);
      setContent(entry.content);
      setKeywordsInput(entry.keywords?.join(", ") ?? "");
      setEditing(false);
      setMessage("今天的记录已经写入共土。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "提交记录时发生未知错误"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!todayEntry) return;

    setErrorMessage("");
    setMessage("");

    const finalContent = content.trim();
    const finalKeywords = joinKeywords(keywordsInput);

    if (!finalContent) {
      setErrorMessage("今日记录不能为空");
      return;
    }

    try {
      setLoading(true);

      const { data: updatedEntry, error: updateError } = await supabase
        .from("daily_entries")
        .update({
          mood,
          content: finalContent,
          keywords: finalKeywords,
        })
        .eq("id", todayEntry.id)
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      const entry = updatedEntry as EntryRecord;
      setTodayEntry(entry);
      setMood(entry.mood);
      setContent(entry.content);
      setKeywordsInput(entry.keywords?.join(", ") ?? "");
      setEditing(false);
      setMessage("今天的记录已更新。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "更新记录时发生未知错误"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!todayEntry) return;

    const confirmed = window.confirm("删除后，今天的记录会消失，并且你可以重新填写。确认删除吗？");
    if (!confirmed) return;

    setErrorMessage("");
    setMessage("");

    try {
      setDeleting(true);

      const { error } = await supabase
        .from("daily_entries")
        .delete()
        .eq("id", todayEntry.id);

      if (error) {
        throw new Error(error.message);
      }

      setTodayEntry(null);
      setMood("平静");
      setContent("");
      setKeywordsInput("");
      setEditing(false);
      setMessage("今天的记录已删除，现在可以重新填写。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "删除记录时发生未知错误"
      );
    } finally {
      setDeleting(false);
    }
  }

  function startEdit() {
    if (!todayEntry) return;
    setMood(todayEntry.mood);
    setContent(todayEntry.content);
    setKeywordsInput(todayEntry.keywords?.join(", ") ?? "");
    setEditing(true);
    setMessage("");
    setErrorMessage("");
  }

  function cancelEdit() {
    if (!todayEntry) return;
    setMood(todayEntry.mood);
    setContent(todayEntry.content);
    setKeywordsInput(todayEntry.keywords?.join(", ") ?? "");
    setEditing(false);
    setMessage("");
    setErrorMessage("");
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
      <div className="mx-auto max-w-4xl">
        <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
          <SectionTitle
            eyebrow="Daily Entry"
            title="今日记录"
            description="写下一点今天的情绪、近况和没有说出口的话。对方不会直接看见原文。"
          />
        </SurfaceCard>

        {!todayEntry ? (
          <SurfaceCard className="mt-8 p-6">
            <form onSubmit={handleCreate}>
              <label className="mb-2 block text-sm text-zinc-300">今日情绪</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="input-shell w-full rounded-2xl px-4 py-3"
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
                className="input-shell w-full rounded-2xl px-4 py-3 placeholder:text-zinc-500"
              />

              <label className="mt-6 mb-2 block text-sm text-zinc-300">今日关键词</label>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="例如：工作, 雨天, 惦记"
                className="input-shell w-full rounded-2xl px-4 py-3 placeholder:text-zinc-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
              >
                {loading ? "提交中..." : "提交今天的记录"}
              </button>
            </form>
          </SurfaceCard>
        ) : (
          <>
            <SurfaceCard className="mt-8 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                    Today's Entry
                  </p>
                  <h2 className="mt-2 text-xl font-medium text-white">
                    你今天已经写过记录了
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-zinc-400">
                    你可以查看、修改或删除今天的记录。
                  </p>
                </div>

                <div className="flex flex-wrap gap-3">
                  {!editing ? (
                    <button
                      onClick={startEdit}
                      className="secondary-button rounded-full px-5 py-3 text-sm"
                    >
                      编辑记录
                    </button>
                  ) : (
                    <button
                      onClick={cancelEdit}
                      className="secondary-button rounded-full px-5 py-3 text-sm"
                    >
                      取消编辑
                    </button>
                  )}

                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="rounded-full border border-red-900/60 bg-red-950/30 px-5 py-3 text-sm text-red-200 transition hover:bg-red-950/45 disabled:opacity-60"
                  >
                    {deleting ? "删除中..." : "删除记录"}
                  </button>
                </div>
              </div>
            </SurfaceCard>

            {!editing ? (
              <SurfaceCard className="mt-6 p-6">
                <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                  <p className="text-sm">
                    <span className="text-zinc-500">日期：</span> {todayEntry.entry_date}
                  </p>
                  <p className="text-sm">
                    <span className="text-zinc-500">情绪：</span> {todayEntry.mood}
                  </p>
                  <p className="text-sm">
                    <span className="text-zinc-500">关键词：</span>{" "}
                    {todayEntry.keywords && todayEntry.keywords.length > 0
                      ? todayEntry.keywords.join(", ")
                      : "无"}
                  </p>
                  <p className="text-sm whitespace-pre-wrap leading-7 text-zinc-200">
                    <span className="text-zinc-500">内容：</span> {todayEntry.content}
                  </p>
                </div>
              </SurfaceCard>
            ) : (
              <SurfaceCard className="mt-6 p-6">
                <form onSubmit={handleUpdate}>
                  <label className="mb-2 block text-sm text-zinc-300">今日情绪</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="input-shell w-full rounded-2xl px-4 py-3"
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
                    className="input-shell w-full rounded-2xl px-4 py-3"
                  />

                  <label className="mt-6 mb-2 block text-sm text-zinc-300">今日关键词</label>
                  <input
                    type="text"
                    value={keywordsInput}
                    onChange={(e) => setKeywordsInput(e.target.value)}
                    className="input-shell w-full rounded-2xl px-4 py-3"
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
                  >
                    {loading ? "保存中..." : "保存修改"}
                  </button>
                </form>
              </SurfaceCard>
            )}
          </>
        )}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-5 text-red-200">
            {errorMessage}
          </div>
        ) : null}

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-5 text-emerald-200">
            {message}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}