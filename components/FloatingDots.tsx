"use client";

type FloatingDotsProps = {
  count?: number;
};

export default function FloatingDots({ count = 10 }: FloatingDotsProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <span
          key={index}
          className="pointer-events-none absolute rounded-full bg-white/30 blur-[1px]"
          style={{
            width: `${4 + (index % 3)}px`,
            height: `${4 + (index % 3)}px`,
            left: `${8 + ((index * 11) % 82)}%`,
            top: `${10 + ((index * 9) % 70)}%`,
            animation: `floatDot ${4.8 + (index % 4) * 0.8}s ease-in-out infinite`,
            animationDelay: `${index * 0.22}s`,
            opacity: 0.18 + (index % 4) * 0.08,
          }}
        />
      ))}
    </>
  );
}