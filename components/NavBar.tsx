import AuthStatus from "@/components/AuthStatus";

const navItems = [
  { href: "/home", label: "总览" },
  { href: "/", label: "首页" },
  { href: "/create", label: "创建共土" },
  { href: "/join", label: "加入共土" },
  { href: "/write", label: "今日记录" },
  { href: "/garden", label: "共土" },
  { href: "/timeline", label: "时间线" },
  { href: "/settle", label: "结算" },
  { href: "/settings", label: "设置" },
  { href: "/about", label: "关于" },
  { href: "/guide", label: "使用说明" },
];

export default function NavBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-zinc-950/75 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <a href="/" className="text-sm font-semibold tracking-[0.28em] text-white">
          COMMON SOIL
        </a>

        <div className="flex items-center gap-6">
          <nav className="hidden gap-5 xl:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm text-zinc-400 transition hover:text-white"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <AuthStatus />
        </div>
      </div>
    </header>
  );
}