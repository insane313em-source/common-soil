"use client";

type SoilSceneProps = {
  leafCount: number;
  flowerCount: number;
  lightLevel: number;
  mistLevel: number;
  fireflyCount: number;
  waterGlow: boolean;
  title?: string;
  subtitle?: string;
  relationshipWeather?: string | null;
  soilState?: string | null;
  lightState?: string | null;
  vitalityState?: string | null;
  connectionState?: string | null;
};

function pickSceneTheme(input: {
  relationshipWeather?: string | null;
  soilState?: string | null;
  lightState?: string | null;
  vitalityState?: string | null;
  connectionState?: string | null;
}) {
  const weather = input.relationshipWeather ?? "";
  const soil = input.soilState ?? "";
  const light = input.lightState ?? "";
  const vitality = input.vitalityState ?? "";
  const connection = input.connectionState ?? "";

  const text = `${weather} ${soil} ${light} ${vitality} ${connection}`;

  const isNight =
    text.includes("夜") || text.includes("薄雾") || text.includes("微亮");
  const isWarm =
    text.includes("微暖") ||
    text.includes("回暖") ||
    text.includes("柔和") ||
    text.includes("晴");
  const isMist = text.includes("雾") || text.includes("偏湿") || text.includes("湿润");
  const isDry = text.includes("偏干");
  const isGrowing =
    text.includes("发芽") ||
    text.includes("缓慢生长") ||
    text.includes("安静流动") ||
    text.includes("轻微回暖");

  let skyTop = "rgba(110, 170, 130, 0.14)";
  let skyGlow = "rgba(255, 220, 170, 0.12)";
  let ground = "rgba(16, 72, 40, 0.72)";
  let fogOpacity = 0.08;
  let starOpacity = 0;
  let waterOpacity = 0.12;

  if (isNight) {
    skyTop = "rgba(80, 110, 170, 0.14)";
    skyGlow = "rgba(255, 214, 140, 0.1)";
    starOpacity = 0.26;
  }

  if (isWarm) {
    skyGlow = "rgba(255, 220, 170, 0.18)";
  }

  if (isMist) {
    fogOpacity = 0.15;
    waterOpacity = 0.18;
  }

  if (isDry) {
    ground = "rgba(76, 56, 28, 0.56)";
    waterOpacity = 0.04;
  }

  if (isGrowing) {
    ground = "rgba(20, 92, 48, 0.82)";
  }

  return {
    skyTop,
    skyGlow,
    ground,
    fogOpacity,
    starOpacity,
    waterOpacity,
    isNight,
  };
}

export default function SoilScene({
  leafCount,
  flowerCount,
  lightLevel,
  mistLevel,
  fireflyCount,
  waterGlow,
  title,
  subtitle,
  relationshipWeather,
  soilState,
  lightState,
  vitalityState,
  connectionState,
}: SoilSceneProps) {
  const theme = pickSceneTheme({
    relationshipWeather,
    soilState,
    lightState,
    vitalityState,
    connectionState,
  });

  const actualMist = Math.max(mistLevel, theme.fogOpacity > 0.12 ? 2 : 0);
  const actualFireflies =
    theme.isNight || lightLevel >= 3 ? Math.max(fireflyCount, 4) : fireflyCount;

  return (
    <div className="relative overflow-hidden rounded-[30px] border border-zinc-800 bg-zinc-950 p-5">
      <style
        dangerouslySetInnerHTML={{
          __html: `
            @keyframes soilGlow {
              0%, 100% { transform: scale(1); opacity: 0.45; }
              50% { transform: scale(1.06); opacity: 0.72; }
            }
            @keyframes soilFloat {
              0%, 100% { transform: translateY(0px); }
              50% { transform: translateY(-6px); }
            }
            @keyframes soilMist {
              0%, 100% { transform: translateX(0px); opacity: 0.18; }
              50% { transform: translateX(10px); opacity: 0.28; }
            }
            @keyframes soilFirefly {
              0%, 100% { opacity: 0.18; transform: scale(1); }
              50% { opacity: 1; transform: scale(1.25); }
            }
            @keyframes soilWater {
              0%, 100% { transform: translateX(-50%) scaleX(1); opacity: 0.3; }
              50% { transform: translateX(-50%) scaleX(1.06); opacity: 0.46; }
            }
          `,
        }}
      />

      <div
        className="relative h-[460px] overflow-hidden rounded-[26px] border border-zinc-800"
        style={{
          background: `radial-gradient(circle at top, ${theme.skyTop}, transparent 36%), linear-gradient(to bottom, rgba(18,24,38,0.96), rgba(9,9,11,0.98))`,
        }}
      >
        <div className="absolute inset-0 soft-grid opacity-10" />

        <div
          className="absolute left-1/2 top-8 -translate-x-1/2 rounded-full blur-3xl"
          style={{
            width: `${140 + lightLevel * 20}px`,
            height: `${140 + lightLevel * 20}px`,
            background: theme.skyGlow,
            animation: "soilGlow 5s ease-in-out infinite",
          }}
        />

        {theme.starOpacity > 0 &&
          Array.from({ length: 12 }).map((_, i) => (
            <span
              key={`star-${i}`}
              className="absolute rounded-full bg-white"
              style={{
                width: `${2 + (i % 2)}px`,
                height: `${2 + (i % 2)}px`,
                left: `${8 + ((i * 9) % 84)}%`,
                top: `${8 + ((i * 7) % 24)}%`,
                opacity: theme.starOpacity,
              }}
            />
          ))}

        <div
          className="absolute inset-x-0 bottom-0 h-44"
          style={{
            background: `linear-gradient(to top, ${theme.ground}, rgba(20,92,48,0.22), transparent)`,
          }}
        />
        <div className="absolute inset-x-0 bottom-0 h-20 bg-zinc-950/45" />

        {Array.from({ length: actualMist > 0 ? 3 : 0 }).map((_, i) => (
          <div
            key={`mist-${i}`}
            className="absolute rounded-full blur-3xl"
            style={{
              left: `${10 + i * 24}%`,
              top: `${22 + (i % 2) * 12}%`,
              width: `${150 + i * 30}px`,
              height: `${72 + i * 10}px`,
              background: `rgba(240,244,255,${theme.fogOpacity})`,
              animation: `soilMist ${7 + i}s ease-in-out infinite`,
            }}
          />
        ))}

        {waterGlow && (
          <>
            <div
              className="absolute bottom-10 left-1/2 h-10 w-40 -translate-x-1/2 rounded-full blur-md"
              style={{
                background: `rgba(120,220,255,${theme.waterOpacity})`,
                animation: "soilWater 5.2s ease-in-out infinite",
              }}
            />
            <div className="absolute bottom-[52px] left-1/2 h-[2px] w-32 -translate-x-1/2 rounded-full bg-cyan-200/25" />
          </>
        )}

        <div className="absolute bottom-14 left-1/2 h-26 w-[6px] -translate-x-1/2 rounded-full bg-zinc-600/95" />
        <div className="absolute bottom-40 left-1/2 h-24 w-28 -translate-x-1/2 rounded-[999px] border border-zinc-700/40 bg-zinc-800/24" />

        <div className="absolute bottom-12 left-[12%] h-20 w-40 rounded-full bg-emerald-950/30 blur-2xl" />
        <div className="absolute bottom-12 right-[12%] h-20 w-40 rounded-full bg-emerald-950/28 blur-2xl" />

        {Array.from({ length: leafCount }).map((_, index) => (
          <div
            key={`leaf-${index}`}
            className="absolute rounded-full bg-emerald-400/46 blur-sm"
            style={{
              width: `${10 + (index % 3) * 3}px`,
              height: `${10 + (index % 3) * 3}px`,
              left: `${16 + ((index * 10) % 68)}%`,
              top: `${18 + ((index * 8) % 42)}%`,
              animation: `soilFloat ${4.8 + (index % 3)}s ease-in-out infinite`,
              animationDelay: `${index * 0.16}s`,
            }}
          />
        ))}

        {Array.from({ length: flowerCount }).map((_, index) => (
          <div
            key={`flower-${index}`}
            className="absolute rounded-full bg-pink-300/65 blur-sm"
            style={{
              width: `${8 + (index % 2) * 3}px`,
              height: `${8 + (index % 2) * 3}px`,
              left: `${22 + ((index * 12) % 60)}%`,
              top: `${46 + ((index * 7) % 22)}%`,
              animation: `soilFloat ${4.4 + (index % 2)}s ease-in-out infinite`,
              animationDelay: `${index * 0.14}s`,
            }}
          />
        ))}

        {Array.from({ length: actualFireflies }).map((_, index) => (
          <div
            key={`firefly-${index}`}
            className="absolute rounded-full bg-amber-200/85 blur-[2px]"
            style={{
              width: "6px",
              height: "6px",
              left: `${12 + ((index * 15) % 76)}%`,
              top: `${14 + ((index * 11) % 56)}%`,
              animation: `soilFirefly ${2.2 + (index % 4) * 0.6}s ease-in-out infinite`,
              animationDelay: `${index * 0.22}s`,
            }}
          />
        ))}
      </div>

      {(title || subtitle) && (
        <div className="mt-5 text-center">
          {title ? <p className="text-sm text-zinc-300">{title}</p> : null}
          {subtitle ? (
            <p className="mt-2 text-xs uppercase tracking-[0.2em] text-zinc-600">
              {subtitle}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
}