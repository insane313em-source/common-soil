"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import NoticeCard from "@/components/NoticeCard";
import Reveal from "@/components/Reveal";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw new Error(error.message);
      }

      router.push("/home");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "登录失败");
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
              eyebrow="Login"
              title="登录"
              description="登录你的共土账号，回到你正在共同养成的那片地方。"
            />
          </SurfaceCard>
        </Reveal>

        <Reveal delayMs={80}>
          <SurfaceCard className="mt-8 p-6 sm:p-8">
            <form onSubmit={handleLogin}>
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
                <a
                  href="/forgot-password"
                  className="text-sm text-zinc-400 transition hover:text-white"
                >
                  忘记密码？
                </a>

                <a
                  href="/signup"
                  className="text-sm text-zinc-400 transition hover:text-white"
                >
                  还没有账号？
                </a>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="primary-button mt-6 rounded-full px-6 py-3 text-sm font-medium disabled:opacity-60"
              >
                {loading ? "登录中..." : "登录"}
              </button>
            </form>
          </SurfaceCard>
        </Reveal>

        {errorMessage ? (
          <NoticeCard tone="error" className="mt-6">
            {errorMessage}
          </NoticeCard>
        ) : null}
      </div>
    </PageContainer>
  );
}