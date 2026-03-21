export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative z-10 mt-16 border-t border-zinc-800/80 bg-zinc-950/55 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold tracking-[0.28em] text-white">
            COMMON SOIL
          </p>
          <p className="mt-4 max-w-md text-sm leading-7 text-zinc-400">
            共土是一种更克制的关系产品语言。它不急着替关系下结论，而是让变化以土壤、天气、光线与生命的方式缓慢显形。
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Navigation
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
            <a href="/" className="transition hover:text-white">
              首页
            </a>
            <a href="/home" className="transition hover:text-white">
              总览
            </a>
            <a href="/garden" className="transition hover:text-white">
              共土
            </a>
            <a href="/timeline" className="transition hover:text-white">
              时间线
            </a>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-500">
            Info
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-zinc-400">
            <a href="/about" className="transition hover:text-white">
              关于
            </a>
            <a href="/guide" className="transition hover:text-white">
              使用说明
            </a>
            <a href="/privacy" className="transition hover:text-white">
              隐私说明
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-5 text-xs text-zinc-500 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <p>© {year} Common Soil. All rights reserved.</p>
          <p>Built for quiet, slow, relational growth.</p>
        </div>
      </div>
    </footer>
  );
}