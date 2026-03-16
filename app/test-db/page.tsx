import PageContainer from "@/components/PageContainer";
import { supabase } from "@/lib/supabase";

export default async function TestDbPage() {
  const { data: gardens, error: gardensError } = await supabase
    .from("gardens")
    .select("*");

  const { data: members, error: membersError } = await supabase
    .from("garden_members")
    .select("*");

  const { data: entries, error: entriesError } = await supabase
    .from("daily_entries")
    .select("*");

  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-semibold">数据库测试页面</h1>
        <p className="mt-3 text-zinc-400">
          用于查看当前庭院、成员与每日记录的测试数据。
        </p>

        <div className="mt-8 grid gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-medium">gardens 表</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm text-zinc-300">
              {JSON.stringify({ gardens, gardensError }, null, 2)}
            </pre>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-medium">garden_members 表</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm text-zinc-300">
              {JSON.stringify({ members, membersError }, null, 2)}
            </pre>
          </div>

          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/50 p-6">
            <h2 className="text-lg font-medium">daily_entries 表</h2>
            <pre className="mt-4 overflow-x-auto rounded-xl bg-zinc-950 p-4 text-sm text-zinc-300">
              {JSON.stringify({ entries, entriesError }, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}