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
    <main className={`relative min-h-screen ${className}`}>
      <div className="site-ambient" />
      <div className="relative z-10 mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  );
}