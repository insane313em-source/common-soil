"use client";

type AnimatedGlowProps = {
  className?: string;
};

export default function AnimatedGlow({ className = "" }: AnimatedGlowProps) {
  return (
    <div
      className={`pointer-events-none absolute rounded-full blur-3xl opacity-70 ${className}`}
      style={{
        animation: "glowPulse 5.2s ease-in-out infinite",
      }}
    />
  );
}