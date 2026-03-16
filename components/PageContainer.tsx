import { ReactNode } from "react";

type PageContainerProps = {
  children: ReactNode;
  className?: string;
};

export default function PageContainer({
  children,
  className = "",
}: PageContainerProps) {
  return (
    <main className={`min-h-screen bg-zinc-950 text-white ${className}`}>
      <div className="mx-auto max-w-6xl px-6 py-12">{children}</div>
    </main>
  );
}