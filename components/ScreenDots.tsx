"use client";

type ScreenDotsProps = {
  total: number;
  current: number;
  onJump: (index: number) => void;
};

export default function ScreenDots({
  total,
  current,
  onJump,
}: ScreenDotsProps) {
  return (
    <div className="screen-dots">
      {Array.from({ length: total }).map((_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`跳转到第 ${index + 1} 屏`}
          onClick={() => onJump(index)}
          className={`screen-dot ${current === index ? "active" : ""}`}
        />
      ))}
    </div>
  );
}