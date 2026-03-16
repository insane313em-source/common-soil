"use client";

import { FormEvent, useState } from "react";
import PageContainer from "@/components/PageContainer";
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

      setMessage("注册成功，请检查邮箱确认链接；如果你的项目关闭了邮箱确认，也可能已经可直接登录。");
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
      <div className="mx-auto max-w-md">
        <h1 className="text-3xl font-semibold">注册</h1>
        <p className="mt-3 text-zinc-400">创建一个共土账号。</p>

        <form
          onSubmit={handleSignup}
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
            {loading ? "注册中..." : "注册"}
          </button>
        </form>

        {message ? (
          <div className="mt-6 rounded-2xl border border-emerald-800 bg-emerald-950/30 p-5 text-emerald-200">
            {message}
          </div>
        ) : null}

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-800 bg-red-950/40 p-5 text-red-200">
            {errorMessage}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}