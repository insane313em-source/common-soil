import FadeInBlock from "@/components/FadeInBlock";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import StatusPill from "@/components/StatusPill";

export default function GuidePage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <FadeInBlock>
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
            <StatusPill>Guide</StatusPill>
            <SectionTitle
              title="第一次使用共土，可以这样开始。"
              description="共土的使用流程很轻，但为了让体验更稳定，你们最好先按完整流程跑通一次。"
            />
          </SurfaceCard>
        </FadeInBlock>

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <FadeInBlock delayMs={80}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">01</p>
              <h2 className="mt-3 text-lg font-medium text-white">创建共土</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                先由其中一方注册并登录，然后创建一片新的共土。创建后系统会生成邀请码。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={140}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">02</p>
              <h2 className="mt-3 text-lg font-medium text-white">邀请对方加入</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                把邀请码发给对方，对方在“加入共土”页面输入邀请码后，就能进入同一片共土。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={200}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">03</p>
              <h2 className="mt-3 text-lg font-medium text-white">分别写下今日记录</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                双方每天分别写下自己的情绪、近况和关键词。原文不会直接展示给彼此。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={260}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">04</p>
              <h2 className="mt-3 text-lg font-medium text-white">执行每日结算</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                当双方当天都完成记录后，就可以执行结算。系统会生成当天的共土变化、关系气候与建议。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={320}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">05</p>
              <h2 className="mt-3 text-lg font-medium text-white">查看共土与时间线</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                共土页会显示当前状态与可视变化；时间线会记录一路以来的每日变化痕迹。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={380}>
            <SurfaceCard className="p-6">
              <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">06</p>
              <h2 className="mt-3 text-lg font-medium text-white">从总览页进入会更方便</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                登录后优先进入“总览”页，你可以更快知道今天是否已写记录、是否已结算，以及当前邀请码与入口位置。
              </p>
            </SurfaceCard>
          </FadeInBlock>
        </div>
      </div>
    </PageContainer>
  );
}