import AuthStatus from "@/components/AuthStatus";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/create", label: "创建庭院" },
  { href: "/join", label: "加入庭院" },
  { href: "/write", label: "今日记录" },
  { href: "/garden", label: "庭院" },
  { href: "/timeline", label: "时间线" },
  { href: "/settle", label: "结算" },
];

export default function NavBar() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <a href="/" className="text-sm font-semibold tracking-[0.2em] text-white">
        COMMON SOIL
        </a>

        <div className="flex items-center gap-6">
          <nav className="hidden gap-5 md:flex">
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