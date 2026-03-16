"use client";

import { FormEvent, useState } from "react";
import PageContainer from "@/components/PageContainer";
import { createClient } from "@/lib/supabase-browser";

type JoinResult = {
  gardenId: string;
  gardenName: string;
  inviteCode: string;
};

export default function JoinPage() {
  const supabase = createClient();

  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<JoinResult | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");
    setResult(null);

    const finalCode = inviteCode.trim().toUpperCase();

    if (!finalCode) {
      setErrorMessage("请输入邀请码");
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
        throw new Error("请先登录后再加入庭院");
      }

      // 1. 先检查当前用户是否已经加入过任意庭院
      const { data: existingMembership, error: membershipError } = await supabase
        .from("garden_members")
        .select("*")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      if (membershipError) {
        throw new Error(membershipError.message);
      }

      if (existingMembership) {
        throw new Error("你已经属于一座庭院，暂时不能重复加入");
      }

      // 2. 根据邀请码查找庭院
      const { data: garden, error: gardenError } = await supabase
        .from("gardens")
        .select("*")
        .eq("invite_code", finalCode)
        .maybeSingle();

      if (gardenError) {
        throw new Error(gardenError.message);
      }

      if (!garden) {
        throw new Error("没有找到对应的邀请码");
      }

      // 3. 查询这个庭院已有多少成员
      const { data: existingMembers, error: memberQueryError } = await supabase
        .from("garden_members")
        .select("*")
        .eq("garden_id", garden.id);

      if (memberQueryError) {
        throw new Error(memberQueryError.message);
      }

      if (existingMembers.length >= 2) {
        throw new Error("这座庭院已经有两位成员，无法再加入");
      }

      // 4. 如果当前用户就是创建者，也不允许用 join 重复加入
      const alreadyInThisGarden = existingMembers.some(
        (member) => member.user_id === user.id
      );

      if (alreadyInThisGarden) {
        throw new Error("你已经在这座庭院里了");
      }

      // 5. 插入第二位成员
      const { error: insertError } = await supabase.from("garden_members").insert({
        garden_id: garden.id,
        user_id: user.id,
        role: "partner",
      });

      if (insertError) {
        throw new Error(insertError.message);
      }

      setResult({
        gardenId: garden.id,
        gardenName: garden.name,
        inviteCode: garden.invite_code,
      });

      setInviteCode("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "加入庭院时发生未知错误";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
        <h1 className="mt-6 text-3xl font-semibold">加入庭院</h1>
        <p className="mt-3 text-zinc-400">
          输入对方分享的邀请码，进入同一座共同生长的庭院。
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <label className="mb-2 block text-sm text-zinc-300">邀请码</label>
          <input
            type="text"
            value={inviteCode}
            onChange={(e) => setInviteCode(e.target.value)}
            placeholder="输入邀请码"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 uppercase text-white outline-none placeholder:text-zinc-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "加入中..." : "加入这座庭院"}
          </button>
        </form>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950/40 p-5 text-red-200">
            <p className="text-sm">加入失败：{errorMessage}</p>
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-6 text-emerald-100">
            <h2 className="text-lg font-medium">加入成功</h2>
            <p className="mt-3 text-sm text-emerald-200/90">
              你已成功加入庭院{" "}
              <span className="font-semibold">{result.gardenName}</span>。
            </p>

            <div className="mt-4 rounded-xl border border-emerald-800/70 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                当前邀请码
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[0.2em] text-white">
                {result.inviteCode}
              </p>
            </div>

            <p className="mt-4 text-sm text-emerald-200/80">
              现在这座庭院已经拥有两位成员，可以继续进行每日记录了。
            </p>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}