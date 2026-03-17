"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type UserInfo = {
  id: string;
  email?: string;
};

export default function AuthStatus() {
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!mounted) return;

      if (user) {
        setUser({
          id: user.id,
          email: user.email,
        });
      } else {
        setUser(null);
      }

      setLoading(false);
    }

    loadUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user;
      if (nextUser) {
        setUser({
          id: nextUser.id,
          email: nextUser.email,
        });
      } else {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  if (loading) {
    return <div className="text-sm text-zinc-500">读取中...</div>;
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <a
          href="/login"
          className="text-sm text-zinc-400 transition hover:text-white"
        >
          登录
        </a>
        <a
          href="/signup"
          className="secondary-button rounded-full px-4 py-2 text-sm"
        >
          注册
        </a>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="hidden max-w-[220px] truncate text-sm text-zinc-400 md:block">
        {user.email ?? "已登录用户"}
      </div>
      <button
        onClick={handleLogout}
        className="secondary-button rounded-full px-4 py-2 text-sm"
      >
        退出登录
      </button>
    </div>
  );
}