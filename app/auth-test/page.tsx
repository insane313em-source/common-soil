import PageContainer from "@/components/PageContainer";
import { createClient } from "@/lib/supabase-server";

export default async function AuthTestPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">登录状态测试</h1>
        <p className="mt-3 text-zinc-400">
          这里用于检查当前是否已经成功登录。
        </p>

        <div className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
          <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm text-zinc-300">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </div>
    </PageContainer>
  );
}