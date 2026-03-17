"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import { createClient } from "@/lib/supabase-browser";

export default function ResetPasswordPage() {
  const supabase = createClient();
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("密码已重置成功，即将跳转到登录页。");
      setPassword("");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "重置失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
          <SectionTitle
            eyebrow="Reset Password"
            title="重置密码"
            description="输入你的新密码，更新后即可重新登录账号。"
          />
        </SurfaceCard>

        <SurfaceCard className="mt-8 p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm text-zinc-300">新密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-shell w-full rounded-2xl px-4 py-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? "保存中..." : "保存新密码"}
            </button>
          </form>
        </SurfaceCard>

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-900/60 bg-emerald-950/30 p-5 text-emerald-200">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-900/60 bg-red-950/40 p-5 text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}