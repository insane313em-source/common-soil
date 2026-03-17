"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import { createClient } from "@/lib/supabase-browser";

type MemberRecord = {
  id: string;
  user_id: string;
  role: string;
};

type AccessState =
  | { status: "loading" }
  | { status: "not_logged_in" }
  | { status: "no_garden" }
  | {
      status: "ready";
      currentUserId: string;
      currentUserEmail: string;
      gardenId: string;
      gardenName: string;
      inviteCode: string;
      role: string;
      members: MemberRecord[];
    };

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [accessState, setAccessState] = useState<AccessState>({ status: "loading" });
  const [gardenName, setGardenName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    async function loadData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAccessState({ status: "not_logged_in" });
        return;
      }

      const { data: membership } = await supabase
        .from("garden_members")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (!membership) {
        setAccessState({ status: "no_garden" });
        return;
      }

      const { data: garden } = await supabase
        .from("gardens")
        .select("*")
        .eq("id", membership.garden_id)
        .maybeSingle();

      if (!garden) {
        setAccessState({ status: "no_garden" });
        return;
      }

      const { data: members } = await supabase
        .from("garden_members")
        .select("*")
        .eq("garden_id", garden.id);

      const finalMembers = (members ?? []) as MemberRecord[];

      setGardenName(garden.name ?? "");

      setAccessState({
        status: "ready",
        currentUserId: user.id,
        currentUserEmail: user.email ?? "",
        gardenId: garden.id,
        gardenName: garden.name ?? "共土",
        inviteCode: garden.invite_code ?? "",
        role: membership.role ?? "member",
        members: finalMembers,
      });
    }

    loadData();
  }, [supabase]);

  async function handleRename(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMessage("");
    setErrorMessage("");

    if (accessState.status !== "ready") return;

    const finalName = gardenName.trim();

    if (!finalName) {
      setErrorMessage("共土名称不能为空");
      return;
    }

    if (accessState.role !== "owner") {
      setErrorMessage("只有创建者可以修改共土名称");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("gardens")
        .update({ name: finalName })
        .eq("id", accessState.gardenId);

      if (error) {
        throw new Error(error.message);
      }

      setMessage("共土名称已更新");
      setAccessState({
        ...accessState,
        gardenName: finalName,
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "修改失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleLeave() {
    if (accessState.status !== "ready") return;

    setMessage("");
    setErrorMessage("");

    if (accessState.role === "owner") {
      setErrorMessage("创建者不能直接退出，请使用“解散共土”");
      return;
    }

    try {
      setLoading(true);

      const { error } = await supabase
        .from("garden_members")
        .delete()
        .eq("user_id", accessState.currentUserId)
        .eq("garden_id", accessState.gardenId);

      if (error) {
        throw new Error(error.message);
      }

      router.push("/home");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "退出失败");
    } finally {
      setLoading(false);
    }
  }

  async function handleDissolve() {
    if (accessState.status !== "ready") return;

    setMessage("");
    setErrorMessage("");

    if (accessState.role !== "owner") {
      setErrorMessage("只有创建者可以解散共土");
      return;
    }

    const confirmed = window.confirm(
      "解散后，这片共土的成员关系、记录和结算都会被删除。确认继续吗？"
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const gardenId = accessState.gardenId;

      const { error: summariesError } = await supabase
        .from("daily_summaries")
        .delete()
        .eq("garden_id", gardenId);

      if (summariesError) {
        throw new Error(summariesError.message);
      }

      const { error: entriesError } = await supabase
        .from("daily_entries")
        .delete()
        .eq("garden_id", gardenId);

      if (entriesError) {
        throw new Error(entriesError.message);
      }

      const { error: membersError } = await supabase
        .from("garden_members")
        .delete()
        .eq("garden_id", gardenId);

      if (membersError) {
        throw new Error(membersError.message);
      }

      const { error: gardenError } = await supabase
        .from("gardens")
        .delete()
        .eq("id", gardenId);

      if (gardenError) {
        throw new Error(gardenError.message);
      }

      router.push("/home");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "解散失败");
    } finally {
      setLoading(false);
    }
  }

  if (accessState.status === "loading") {
    return (
      <PageContainer>
        <EmptyStateCard
          title="正在读取共土设置"
          description="我们正在确认你的登录状态和当前共土信息。"
        />
      </PageContainer>
    );
  }

  if (accessState.status === "not_logged_in") {
    return (
      <PageContainer>
        <EmptyStateCard
          title="你还没有登录"
          description="登录后，你才能查看和修改共土设置。"
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
          description="先创建一片共土，或者输入邀请码加入已有共土，之后才能管理设置。"
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
      <div className="mx-auto max-w-6xl">
        <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
          <SectionTitle
            eyebrow="Common Soil Settings"
            title="共土设置"
            description="你可以在这里查看当前共土信息、管理成员状态，并处理账号安全相关入口。"
          />
        </SurfaceCard>

        <div className="mt-8 grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                基本信息
              </p>

              <div className="mt-5 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    当前名称
                  </p>
                  <p className="mt-3 text-sm text-zinc-300">
                    {accessState.gardenName}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    邀请码
                  </p>
                  <p className="mt-3 text-sm tracking-[0.2em] text-zinc-300">
                    {accessState.inviteCode}
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    当前角色
                  </p>
                  <p className="mt-3 text-sm text-zinc-300">
                    {accessState.role === "owner" ? "创建者" : "成员"}
                  </p>
                </div>
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                成员列表
              </p>

              <div className="mt-5 space-y-3">
                {accessState.members.map((member, index) => {
                  const isSelf = member.user_id === accessState.currentUserId;
                  const isOwner = member.role === "owner";

                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-4"
                    >
                      <div>
                        <p className="text-sm text-zinc-300">
                          成员 {index + 1}
                          {isSelf ? " · 你" : ""}
                        </p>
                        <p className="mt-1 text-xs uppercase tracking-[0.2em] text-zinc-500">
                          {isOwner ? "owner" : "partner"}
                        </p>
                      </div>

                      <div className="text-sm text-zinc-400">
                        {isOwner ? "创建者" : "成员"}
                      </div>
                    </div>
                  );
                })}
              </div>
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                修改共土名称
              </p>

              <form onSubmit={handleRename} className="mt-5">
                <label className="mb-2 block text-sm text-zinc-300">共土名称</label>
                <input
                  type="text"
                  value={gardenName}
                  onChange={(e) => setGardenName(e.target.value)}
                  className="input-shell w-full rounded-2xl px-4 py-3"
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="primary-button mt-5 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
                >
                  {loading ? "保存中..." : "保存名称"}
                </button>
              </form>

              {accessState.role !== "owner" ? (
                <p className="mt-4 text-sm leading-6 text-zinc-500">
                  当前账号不是创建者，所以只能查看，不能修改共土名称。
                </p>
              ) : null}
            </SurfaceCard>

            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                成员操作
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={handleLeave}
                  disabled={loading}
                  className="secondary-button rounded-full px-5 py-3 text-sm disabled:opacity-60"
                >
                  退出共土
                </button>

                <button
                  onClick={handleDissolve}
                  disabled={loading}
                  className="rounded-full border border-red-900/60 bg-red-950/30 px-5 py-3 text-sm text-red-200 transition hover:bg-red-950/45 disabled:opacity-60"
                >
                  解散共土
                </button>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-500">
                成员可退出当前共土；创建者不能直接退出，但可以解散整片共土。
              </p>
            </SurfaceCard>
          </div>

          <div className="space-y-4">
            <SurfaceCard className="p-5">
              <p className="text-sm text-zinc-500">当前账号</p>
              <p className="mt-3 break-all text-sm text-zinc-300">
                {accessState.currentUserEmail || "未知邮箱"}
              </p>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <p className="text-sm text-zinc-500">账号安全</p>
              <p className="mt-3 text-sm leading-7 text-zinc-400">
                如果你需要修改密码，可以使用邮件重置入口。重置邮件会发送到当前账号邮箱。
              </p>
              <a
                href="/forgot-password"
                className="secondary-button mt-4 inline-flex rounded-full px-5 py-3 text-sm"
              >
                去重置密码
              </a>
            </SurfaceCard>

            <SurfaceCard className="p-5">
              <p className="text-sm text-zinc-500">快捷入口</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <a
                  href="/home"
                  className="secondary-button rounded-full px-5 py-3 text-sm"
                >
                  返回总览
                </a>
                <a
                  href="/garden"
                  className="secondary-button rounded-full px-5 py-3 text-sm"
                >
                  查看共土
                </a>
              </div>
            </SurfaceCard>

            {message ? (
              <div className="rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-4 text-sm text-emerald-200">
                {message}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="rounded-2xl border border-red-900/60 bg-red-950/40 p-4 text-sm text-red-200">
                {errorMessage}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}