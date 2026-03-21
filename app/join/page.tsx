"use client";

import { FormEvent, useState } from "react";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import NoticeCard from "@/components/NoticeCard";
import Reveal from "@/components/Reveal";
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
        throw new Error("请先登录后再加入共土");
      }

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
        throw new Error("你已经属于一片共土，暂时不能重复加入");
      }

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

      const { data: existingMembers, error: memberQueryError } = await supabase
        .from("garden_members")
        .select("*")
        .eq("garden_id", garden.id);

      if (memberQueryError) {
        throw new Error(memberQueryError.message);
      }

      if (existingMembers.length >= 2) {
        throw new Error("这片共土已经有两位成员，无法再加入");
      }

      const alreadyInThisGarden = existingMembers.some(
        (member) => member.user_id === user.id
      );

      if (alreadyInThisGarden) {
        throw new Error("你已经在这片共土里了");
      }

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
        error instanceof Error ? error.message : "加入共土时发生未知错误";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <Reveal>
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10" hover={false}>
            <SectionTitle
              eyebrow="Join Common Soil"
              title="加入共土"
              description="输入对方分享的邀请码，进入同一片共同生长的共土。"
            />
          </SurfaceCard>
        </Reveal>

        <Reveal delayMs={80}>
          <SurfaceCard className="mt-8 p-6">
            <form onSubmit={handleSubmit}>
              <label className="mb-2 block text-sm text-zinc-300">邀请码</label>
              <input
                type="text"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="输入邀请码"
                className="input-shell w-full rounded-2xl px-4 py-3 uppercase placeholder:text-zinc-500"
              />

              <button
                type="submit"
                disabled={loading}
                className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
              >
                {loading ? "加入中..." : "加入这片共土"}
              </button>
            </form>
          </SurfaceCard>
        </Reveal>

        {errorMessage ? (
          <NoticeCard tone="error" className="mt-6">
            加入失败：{errorMessage}
          </NoticeCard>
        ) : null}

        {result ? (
          <Reveal delayMs={140}>
            <SurfaceCard className="mt-6 p-6">
              <h2 className="text-lg font-medium text-white">加入成功</h2>
              <p className="mt-3 text-sm leading-7 text-zinc-300">
                你已成功加入共土{" "}
                <span className="font-semibold">{result.gardenName}</span>。
              </p>

              <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                  当前邀请码
                </p>
                <p className="mt-3 text-2xl font-semibold tracking-[0.24em] text-white">
                  {result.inviteCode}
                </p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <a
                  href="/home"
                  className="primary-button rounded-full px-5 py-3 text-sm font-medium"
                >
                  返回总览
                </a>
                <a
                  href="/garden"
                  className="secondary-button rounded-full px-5 py-3 text-sm"
                >
                  进入共土
                </a>
              </div>
            </SurfaceCard>
          </Reveal>
        ) : null}
      </div>
    </PageContainer>
  );
}