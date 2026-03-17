"use client";

import { FormEvent, useState } from "react";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import { createClient } from "@/lib/supabase-browser";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      setLoading(true);

      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage("重置密码邮件已发送，请检查邮箱。");
      setEmail("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "发送失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
          <SectionTitle
            eyebrow="Forgot Password"
            title="忘记密码"
            description="输入你的账号邮箱，我们会向你发送一封用于重置密码的邮件。"
          />
        </SurfaceCard>

        <SurfaceCard className="mt-8 p-6 sm:p-8">
          <form onSubmit={handleSubmit}>
            <label className="mb-2 block text-sm text-zinc-300">邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-shell w-full rounded-2xl px-4 py-3"
            />

            <button
              type="submit"
              disabled={loading}
              className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
            >
              {loading ? "发送中..." : "发送重置邮件"}
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