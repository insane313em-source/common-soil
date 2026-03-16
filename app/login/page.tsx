"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import PageContainer from "@/components/PageContainer";
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

      router.push("/auth-test");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold">登录</h1>
        <p className="mt-3 text-zinc-400">登录你的共土账号。</p>

        <form
          onSubmit={handleLogin}
          className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6"
        >
          <label className="mb-2 block text-sm text-zinc-300">邮箱</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
          />

          <label className="mt-5 mb-2 block text-sm text-zinc-300">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-full bg-white px-6 py-3 text-sm font-medium text-black hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "登录中..." : "登录"}
          </button>
        </form>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950/40 p-5 text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}