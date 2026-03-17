import FadeInBlock from "@/components/FadeInBlock";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import StatusPill from "@/components/StatusPill";

export default function AboutPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <FadeInBlock>
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
            <StatusPill>About Common Soil</StatusPill>
            <SectionTitle
              title="共土想做的，不是替关系下判断。"
              description="它更像一个缓慢、克制、抽象的关系容器。两个人分别写下每天的状态，系统只在幕后提炼出关系层面的天气、光线、土壤和生命变化。"
            />
          </SurfaceCard>
        </FadeInBlock>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <FadeInBlock delayMs={80}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                产品出发点
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                很多关系产品要么过度直接，要么过度功能化。共土希望留出一点距离，不把双方原文直接摊开，也不急着给关系贴标签，而是让变化先以更柔和的方式被看见。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={140}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                为什么叫共土
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                因为一段关系未必总是开花，也未必总是明亮；但很多时候，它仍然是一片可以一起承受、一起蓄水、一起慢慢变化的土壤。共土比“结果”更在意“长期共养”。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={200}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                克制的表达方式
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                共土不会用很强烈的语言评判谁对谁错，也不会用直白的方式把你们彼此摊开。它更倾向于提供观察、隐喻和轻动作建议，让关系自己慢慢显形。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={260}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                适合谁
              </p>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                适合那些不想被高强度沟通工具追着走、但仍想认真对待彼此日常变化的人。它不是替代交流，而是提供一种更安静、更有层次的补充。
              </p>
            </SurfaceCard>
          </FadeInBlock>
        </div>
      </div>
    </PageContainer>
  );
}