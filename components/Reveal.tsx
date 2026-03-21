import { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delayMs?: number;
  className?: string;
};

export default function Reveal({
  children,
  delayMs = 0,
  className = "",
}: RevealProps) {
  return (
    <div
      className={`fade-up-soft opacity-0 ${className}`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      {children}
    </div>
  );
}