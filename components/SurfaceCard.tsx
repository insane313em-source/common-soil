import { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
};

export default function SurfaceCard({
  children,
  className = "",
}: SurfaceCardProps) {
  return (
    <div
      className={`glass-panel rounded-3xl transition duration-200 hover:-translate-y-[1px] hover:border-zinc-700 ${className}`}
    >
      {children}
    </div>
  );
}