import { ReactNode } from "react";

type SurfaceCardProps = {
  children: ReactNode;
  className?: string;
  hover?: boolean;
};

export default function SurfaceCard({
  children,
  className = "",
  hover = true,
}: SurfaceCardProps) {
  return (
    <div
      className={`glass-panel rounded-3xl ${hover ? "card-hover" : ""} ${className}`}
    >
      {children}
    </div>
  );
}