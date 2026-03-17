import { ReactNode } from "react";

type FadeInBlockProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

export default function FadeInBlock({
  children,
  className = "",
  delayMs = 0,
}: FadeInBlockProps) {
  return (
    <div
      className={`fade-up opacity-0 ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}