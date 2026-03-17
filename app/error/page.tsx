"use client";

import PageContainer from "@/components/PageContainer";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <div className="glass-panel rounded-[32px] p-8 sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-500">
            Application Error
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
            页面暂时出了点问题
          </h1>
          <p className="mt-5 text-base leading-7 text-zinc-400">
            这通常是一次临时错误。你可以重新尝试，或者先返回首页继续使用。
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              onClick={reset}
              className="primary-button rounded-full px-6 py-3 text-sm font-medium"
            >
              重试
            </button>
            <a
              href="/"
              className="secondary-button rounded-full px-6 py-3 text-sm"
            >
              返回首页
            </a>
          </div>

          <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4 text-sm text-zinc-500">
            {error.message}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}