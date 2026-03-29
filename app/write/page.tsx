"use client";

import { FormEvent, useEffect, useState } from "react";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import NoticeCard from "@/components/NoticeCard";
import Reveal from "@/components/Reveal";
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

type DeliveryRecord = {
  id: string;
  garden_id: string;
  user_id: string;
  delivery_date: string;
  raw_message: string;
  translated_message: string;
  is_shared: boolean;
  delivery_mode: "ai" | "direct";
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

  const [deliveryRawMessage, setDeliveryRawMessage] = useState("");
  const [deliveryTranslatedMessage, setDeliveryTranslatedMessage] = useState("");
  const [savedDelivery, setSavedDelivery] = useState<DeliveryRecord | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<"ai" | "direct">("ai");

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [savingDelivery, setSavingDelivery] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAccessAndLoadData() {
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

      const { data: deliveryData } = await supabase
        .from("daily_deliveries")
        .select("*")
        .eq("garden_id", gardenId)
        .eq("user_id", user.id)
        .eq("delivery_date", today)
        .maybeSingle();

      if (deliveryData) {
        const delivery = deliveryData as DeliveryRecord;
        setSavedDelivery(delivery);
        setDeliveryRawMessage(delivery.raw_message);
        setDeliveryTranslatedMessage(delivery.translated_message);
        setDeliveryMode(delivery.delivery_mode === "direct" ? "direct" : "ai");
      }
    }

    checkAccessAndLoadData();
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

  async function handleTranslateDelivery() {
    setErrorMessage("");
    setMessage("");

    if (!deliveryRawMessage.trim()) {
      setErrorMessage("想让对方看到的话不能为空");
      return;
    }

    try {
      setTranslating(true);

      const response = await fetch("/api/translate-message", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          rawMessage: deliveryRawMessage,
          mood,
          entryContent: content,
        }),
      });

      const rawText = await response.text();

      let data: any;
      try {
        data = JSON.parse(rawText);
      } catch {
        throw new Error(
          `转译接口没有返回 JSON。状态码：${response.status}。返回内容前 120 字：${rawText.slice(0, 120)}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || "转译失败");
      }

      setDeliveryTranslatedMessage(data.translatedMessage);
      setDeliveryMode("ai");
      setMessage("已生成一版更柔和的转递内容。");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "转译时发生未知错误"
      );
    } finally {
      setTranslating(false);
    }
  }

  async function handleSaveDelivery() {
    if (accessState.status !== "ready") {
      setErrorMessage("当前无法保存今日转递");
      return;
    }

    if (!deliveryRawMessage.trim()) {
      setErrorMessage("想让对方看到的话不能为空");
      return;
    }

    if (deliveryMode === "ai" && !deliveryTranslatedMessage.trim()) {
      setErrorMessage("当前选择的是 AI 转译模式，请先生成转译后的内容");
      return;
    }

    setErrorMessage("");
    setMessage("");

    try {
      setSavingDelivery(true);

      const today = new Date().toISOString().slice(0, 10);

      const payload = {
        garden_id: accessState.gardenId,
        user_id: accessState.userId,
        delivery_date: today,
        raw_message: deliveryRawMessage.trim(),
        translated_message:
          deliveryMode === "ai"
            ? deliveryTranslatedMessage.trim()
            : deliveryRawMessage.trim(),
        delivery_mode: deliveryMode,
        is_shared: true,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("daily_deliveries")
        .upsert(payload, {
          onConflict: "garden_id,user_id,delivery_date",
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      setSavedDelivery(data as DeliveryRecord);
      setMessage(
        deliveryMode === "ai"
          ? "今日转递已保存，对方会看到转译后的版本。"
          : "今日转递已保存，对方会直接看到你的原话。"
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "保存今日转递时发生未知错误"
      );
    } finally {
      setSavingDelivery(false);
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
        <Reveal>
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10" hover={false}>
            <SectionTitle
              eyebrow="Daily Entry"
              title="今日记录"
              description="记录和今日转递已经拆开；没写转递也不影响记录和结算。"
            />
          </SurfaceCard>
        </Reveal>

        {!todayEntry ? (
          <Reveal delayMs={80}>
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
          </Reveal>
        ) : (
          <>
            <Reveal delayMs={80}>
              <SurfaceCard className="mt-8 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                      Today&apos;s Entry
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
            </Reveal>

            {!editing ? (
              <Reveal delayMs={120}>
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
              </Reveal>
            ) : (
              <Reveal delayMs={120}>
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
              </Reveal>
            )}
          </>
        )}

        <Reveal delayMs={160}>
          <SurfaceCard className="mt-6 p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  Today Delivery
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-tight text-white">
                  今日转递
                </h3>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-400">
                  这是独立于记录之外的一段话。你可以选择直接把原话给对方看，或者先交给 AI 转成更柔和的表达。
                </p>
              </div>
            </div>

            <div className="mt-6">
              <label className="mb-2 block text-sm text-zinc-300">你想让对方看到的话</label>
              <textarea
                rows={5}
                value={deliveryRawMessage}
                onChange={(e) => setDeliveryRawMessage(e.target.value)}
                placeholder="例如：今天其实有点想被你多问一句，只是我没有主动说出来……"
                className="input-shell w-full rounded-2xl px-4 py-3 placeholder:text-zinc-500"
              />

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryMode("direct")}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    deliveryMode === "direct"
                      ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-200"
                      : "border border-zinc-700 bg-zinc-900/70 text-zinc-300"
                  }`}
                >
                  直接给对方看原话
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryMode("ai")}
                  className={`rounded-full px-4 py-2 text-sm transition ${
                    deliveryMode === "ai"
                      ? "border border-cyan-400/40 bg-cyan-400/10 text-cyan-200"
                      : "border border-zinc-700 bg-zinc-900/70 text-zinc-300"
                  }`}
                >
                  先用 AI 转译
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleTranslateDelivery}
                  disabled={translating}
                  className="secondary-button rounded-full px-5 py-3 text-sm disabled:opacity-60"
                >
                  {translating ? "转译中..." : "AI 转译"}
                </button>

                <button
                  type="button"
                  onClick={handleSaveDelivery}
                  disabled={
                    savingDelivery ||
                    !deliveryRawMessage.trim() ||
                    (deliveryMode === "ai" && !deliveryTranslatedMessage.trim())
                  }
                  className="primary-button rounded-full px-5 py-3 text-sm font-medium disabled:opacity-60"
                >
                  {savingDelivery ? "保存中..." : "保存并公开给对方"}
                </button>
              </div>
            </div>

            {deliveryMode === "direct" ? (
              <div className="mt-6 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                  对方将看到你的原话
                </p>
                <p className="mt-3 text-sm leading-8 text-emerald-50">
                  {deliveryRawMessage || "你当前还没有填写内容。"}
                </p>
              </div>
            ) : null}

            {deliveryTranslatedMessage ? (
              <div className="mt-6 rounded-2xl border border-cyan-900/40 bg-cyan-950/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/70">
                  对方会看到的 AI 转译版本
                </p>
                <p className="mt-3 text-sm leading-8 text-cyan-50">
                  {deliveryTranslatedMessage}
                </p>
              </div>
            ) : null}

            {savedDelivery ? (
              <div className="mt-4 rounded-2xl border border-emerald-900/40 bg-emerald-950/20 p-5">
                <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/70">
                  已公开
                </p>
                <p className="mt-3 text-sm leading-8 text-emerald-50">
                  {savedDelivery.delivery_mode === "ai"
                    ? "这条今日转递已经保存，对方看到的是 AI 转译后的版本。"
                    : "这条今日转递已经保存，对方看到的是你的原话。"}
                </p>
              </div>
            ) : null}
          </SurfaceCard>
        </Reveal>

        <div className="mt-6">
          <a
            href="/my-entries"
            className="secondary-button inline-flex rounded-full px-5 py-3 text-sm"
          >
            查看我的记录与历史转递
          </a>
        </div>

        {errorMessage ? (
          <NoticeCard tone="error" className="mt-6">
            {errorMessage}
          </NoticeCard>
        ) : null}

        {message ? (
          <NoticeCard tone="success" className="mt-6">
            {message}
          </NoticeCard>
        ) : null}
      </div>
    </PageContainer>
  );
}