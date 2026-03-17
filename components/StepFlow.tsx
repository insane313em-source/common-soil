import SurfaceCard from "@/components/SurfaceCard";

const steps = [
  {
    num: "01",
    title: "创建或加入共土",
    text: "两个人进入同一片共土，建立一块只属于彼此的缓慢空间。",
  },
  {
    num: "02",
    title: "分别记录每天状态",
    text: "每天写下情绪、近况、关键词与没说出口的话，对方不会直接看到原文。",
  },
  {
    num: "03",
    title: "系统进行每日结算",
    text: "AI 以更抽象、更关系化的方式理解当天的变化，给出结算结果。",
  },
  {
    num: "04",
    title: "共土持续生长",
    text: "光、雾、花、叶、萤火与土壤状态会在长期积累中逐渐改变。",
  },
];

export default function StepFlow() {
  return (
    <div className="grid gap-4 lg:grid-cols-4">
      {steps.map((step) => (
        <SurfaceCard key={step.num} className="p-5">
          <p className="text-xs uppercase tracking-[0.28em] text-zinc-600">
            {step.num}
          </p>
          <h3 className="mt-3 text-lg font-medium text-white">{step.title}</h3>
          <p className="mt-3 text-sm leading-7 text-zinc-400">{step.text}</p>
        </SurfaceCard>
      ))}
    </div>
  );
}