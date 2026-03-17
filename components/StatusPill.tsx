type StatusPillProps = {
    children: React.ReactNode;
  };
  
  export default function StatusPill({ children }: StatusPillProps) {
    return (
      <span className="inline-flex items-center rounded-full border border-zinc-800 bg-zinc-950/80 px-3 py-1 text-xs tracking-[0.18em] text-zinc-400 uppercase">
        {children}
      </span>
    );
  }