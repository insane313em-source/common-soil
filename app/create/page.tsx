"use client";

import { FormEvent, useState } from "react";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import { createClient } from "@/lib/supabase-browser";
import { generateInviteCode } from "@/lib/helpers";

type CreateResult = {
  gardenId: string;
  gardenName: string;
  inviteCode: string;
};

export default function CreatePage() {
  const supabase = createClient();

  const [gardenName, setGardenName] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<CreateResult | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setErrorMessage("");
    setResult(null);

    const finalName = gardenName.trim() || "共土";
    const inviteCode = generateInviteCode();

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
        throw new Error("请先登录后再创建共土");
      }

      const { data: gardenData, error: gardenError } = await supabase
        .from("gardens")
        .insert({
          name: finalName,
          invite_code: inviteCode,
          created_by: user.id,
        })
        .select()
        .single();

      if (gardenError) {
        throw new Error(gardenError.message);
      }

      const { error: memberError } = await supabase.from("garden_members").insert({
        garden_id: gardenData.id,
        user_id: user.id,
        role: "owner",
      });

      if (memberError) {
        throw new Error(memberError.message);
      }

      setResult({
        gardenId: gardenData.id,
        gardenName: gardenData.name,
        inviteCode: gardenData.invite_code,
      });

      setGardenName("");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "创建共土时发生未知错误";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
          <SectionTitle
            eyebrow="Create Common Soil"
            title="创建共土"
            description="创建一片只属于两个人的共土，并生成邀请码邀请对方加入。"
          />
        </SurfaceCard>

        <SurfaceCard className="mt-8 p-6">
          <form onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm text-zinc-300">共土名称</label>
            <input
              type="text"
              value={gardenName}
              onChange={(e) => setGardenName(e.target.value)}
              placeholder="例如：晚风土壤"
              className="input-shell w-full rounded-2xl px-4 py-3 placeholder:text-zinc-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? "创建中..." : "创建我的共土"}
            </button>
          </form>
        </SurfaceCard>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-5 text-red-200">
            创建失败：{errorMessage}
          </div>
        ) : null}

        {result ? (
          <SurfaceCard className="mt-6 p-6">
            <h2 className="text-lg font-medium text-white">共土创建成功</h2>
            <p className="mt-3 text-sm text-zinc-300">
              你的共土 <span className="font-semibold">{result.gardenName}</span>{" "}
              已创建完成。
            </p>

            <div className="mt-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
                邀请码
              </p>
              <p className="mt-3 text-2xl font-semibold tracking-[0.24em] text-white">
                {result.inviteCode}
              </p>
            </div>
          </SurfaceCard>
        ) : null}
      </div>
    </PageContainer>
  );
}