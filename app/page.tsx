import PageContainer from "@/components/PageContainer";

export default function Home() {
  return (
    <PageContainer className="flex items-center">
      <div className="mx-auto flex min-h-[80vh] max-w-5xl flex-col items-center justify-center text-center">
        <p className="mb-3 text-sm uppercase tracking-[0.3em] text-zinc-500">
          COMMON SOIL
        </p>

        <h1 className="mb-6 text-5xl font-semibold tracking-tight">
          共土
        </h1>

        <p className="mb-10 max-w-2xl text-base leading-7 text-zinc-400">
          彼此不可见，但共同影响一片缓慢生长的共土。
          两个人每天分别记录情绪、近况与心事，系统会在每日结算后，
          将这些内容转译成土壤、天气、光线与生命变化。
        </p>

        <div className="flex flex-col gap-4 sm:flex-row">
          <a
            href="/create"
            className="rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            创建共土
          </a>
          <a
            href="/join"
            className="rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-white transition hover:bg-zinc-900"
          >
            加入共土
          </a>
        </div>
      </div>
    </PageContainer>
  );
}