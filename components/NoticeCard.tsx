type NoticeCardProps = {
    tone?: "success" | "warning" | "error" | "info";
    children: React.ReactNode;
    className?: string;
  };
  
  export default function NoticeCard({
    tone = "info",
    children,
    className = "",
  }: NoticeCardProps) {
    const toneMap = {
      success:
        "border-emerald-900/60 bg-emerald-950/30 text-emerald-200",
      warning:
        "border-yellow-900/60 bg-yellow-950/30 text-yellow-200",
      error:
        "border-red-900/60 bg-red-950/40 text-red-200",
      info:
        "border-zinc-800 bg-zinc-950/80 text-zinc-300",
    };
  
    return (
      <div
        className={`rounded-2xl border p-4 text-sm leading-6 fade-up-soft ${toneMap[tone]} ${className}`}
      >
        {children}
      </div>
    );
  }