"use client";

import { FormEvent, useState } from "react";
import PageContainer from "@/components/PageContainer";
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
        throw new Error("请先登录后再创建庭院");
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
        error instanceof Error ? error.message : "创建庭院时发生未知错误";
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-2xl">
      <h1 className="mt-6 text-3xl font-semibold">创建共土</h1>
<p className="mt-3 text-zinc-400">
  创建一片只属于两个人的共土，并生成邀请码邀请对方加入。
</p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <label className="mb-2 block text-sm text-zinc-300">庭院名称</label>
          <input
            type="text"
            value={gardenName}
            onChange={(e) => setGardenName(e.target.value)}
            placeholder="例如：第二花园"
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none placeholder:text-zinc-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "创建中..." : "创建我的共土"}
          </button>
        </form>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950/40 p-5 text-red-200">
            <p className="text-sm">创建失败：{errorMessage}</p>
          </div>
        ) : null}

        {result ? (
          <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-6 text-emerald-100">
            <h2 className="text-lg font-medium">共土创建成功</h2>
<p className="mt-3 text-sm text-emerald-200/90">
  你的共土 <span className="font-semibold">{result.gardenName}</span> 已创建完成。
</p>

            <div className="mt-4 rounded-xl border border-emerald-800/70 bg-zinc-950 p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-400">
                邀请码
              </p>
              <p className="mt-2 text-2xl font-semibold tracking-[0.2em] text-white">
                {result.inviteCode}
              </p>
            </div>

            <p className="mt-4 text-sm text-emerald-200/80">
              你可以把这个邀请码发给对方，让 TA 在“加入庭院”页面输入。
            </p>
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}