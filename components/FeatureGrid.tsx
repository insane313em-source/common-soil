import SurfaceCard from "@/components/SurfaceCard";

const features = [
  {
    title: "彼此不可见",
    text: "双方原文不会直接互相展示，系统只提炼关系层面的变化与状态。",
  },
  {
    title: "幕后 AI 结算",
    text: "每天的情绪、近况与心事会被转译成土壤、天气、光线与生命变化。",
  },
  {
    title: "长期共养",
    text: "每一天不是一次播报，而是在一起塑造一个逐渐成形的地方。",
  },
  {
    title: "克制的引导",
    text: "不说教、不评判，而是以隐喻、观察和轻动作建议陪伴关系变化。",
  },
];

export default function FeatureGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {features.map((item) => (
        <SurfaceCard key={item.title} className="p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
            Feature
          </p>
          <h3 className="mt-3 text-lg font-medium text-white">{item.title}</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{item.text}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}