"use client";

import { useState } from "react";
import SurfaceCard from "@/components/SurfaceCard";

type InviteCodeCardProps = {
  inviteCode: string;
};

export default function InviteCodeCard({ inviteCode }: InviteCodeCardProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(inviteCode);
      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch {
      setCopied(false);
    }
  }

  return (
    <SurfaceCard className="p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
        邀请码
      </p>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/90 px-5 py-4 tech-ring">
          <p className="text-2xl font-semibold tracking-[0.28em] text-white">
            {inviteCode}
          </p>
        </div>

        <button
          onClick={handleCopy}
          className="secondary-button rounded-full px-5 py-3 text-sm"
        >
          {copied ? "已复制" : "复制邀请码"}
        </button>
      </div>

      <p className="mt-5 max-w-2xl text-sm leading-6 text-zinc-400">
        把邀请码发给对方，对方在“加入共土”页面输入后，就能进入同一片共土。
      </p>
    </SurfaceCard>
  );
}