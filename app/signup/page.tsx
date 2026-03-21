"use client";

import { FormEvent, useState } from "react";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import NoticeCard from "@/components/NoticeCard";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase-browser";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    setErrorMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      setMessage(
        "注册成功，请检查邮箱确认链接；如果你的项目关闭了邮箱确认，也可能已经可以直接登录。"
      );
      setEmail("");
      setPassword("");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-xl">
        <Reveal>
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10" hover={false}>
            <SectionTitle
              eyebrow="Sign Up"
              title="注册"
              description="创建一个属于你的共土账号，开始进入这片共同缓慢生长的地方。"
            />
          </SurfaceCard>
        </Reveal>

        <Reveal delayMs={80}>
          <SurfaceCard className="mt-8 p-6 sm:p-8">
            <form onSubmit={handleSignup}>
              <label className="mb-2 block text-sm text-zinc-300">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-shell w-full rounded-2xl px-4 py-3"
              />

              <label className="mt-6 mb-2 block text-sm text-zinc-300">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-shell w-full rounded-2xl px-4 py-3"
              />

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="text-sm text-zinc-500">
                  建议使用你常用的邮箱
                </span>
                <a
                  href="/login"
                  className="text-sm text-zinc-400 transition hover:text-white"
                >
                  已有账号？
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
              >
                {loading ? "注册中..." : "注册"}
              </button>
            </form>
          </SurfaceCard>
        </Reveal>

        {message ? (
          <NoticeCard tone="success" className="mt-6">
            {message}
          </NoticeCard>
        ) : null}

        {errorMessage ? (
          <NoticeCard tone="error" className="mt-6">
            {errorMessage}
          </NoticeCard>
        ) : null}
      </div>
    </PageContainer>
  );
}