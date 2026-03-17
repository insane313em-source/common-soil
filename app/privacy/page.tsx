import FadeInBlock from "@/components/FadeInBlock";
import PageContainer from "@/components/PageContainer";
import SectionTitle from "@/components/SectionTitle";
import SurfaceCard from "@/components/SurfaceCard";
import StatusPill from "@/components/StatusPill";

export default function PrivacyPage() {
  return (
    <PageContainer>
      <div className="mx-auto max-w-5xl">
        <FadeInBlock>
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10">
            <StatusPill>Privacy</StatusPill>
            <SectionTitle
              title="隐私优先，是共土的基础。"
              description="共土的核心前提之一，是双方原文不会被直接互相展示。系统输出的是经过抽象和转译后的关系层结果，而不是直接转发彼此记录。"
            />
          </SurfaceCard>
        </FadeInBlock>

        <div className="mt-8 space-y-6">
          <FadeInBlock delayMs={80}>
            <SurfaceCard className="p-6">
              <h2 className="text-lg font-medium text-white">1. 不直接展示对方原文</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                你在共土中写下的每日记录，不会以原文形式直接展示给对方。系统只会在每日结算后输出经过抽象处理的结果，例如关系气候、共振主题、隐喻建议和共土变化。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={140}>
            <SurfaceCard className="p-6">
              <h2 className="text-lg font-medium text-white">2. 系统只使用必要数据</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                当前版本主要使用邮箱、成员关系、每日记录、每日结算与共土基础信息来支撑产品功能。不会在产品界面中公开展示不必要的个人资料。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={200}>
            <SurfaceCard className="p-6">
              <h2 className="text-lg font-medium text-white">3. 结算结果是抽象输出</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                每日结算产生的文案是关系层面的抽象表达，并不构成对任何一方的完整描述、评价或定性。它更像是一种低强度的观察与转译。
              </p>
            </SurfaceCard>
          </FadeInBlock>

          <FadeInBlock delayMs={260}>
            <SurfaceCard className="p-6">
              <h2 className="text-lg font-medium text-white">4. 共土管理权限</h2>
              <p className="mt-4 text-sm leading-7 text-zinc-400">
                创建者可以修改共土名称并解散共土；成员可以退出共土。解散共土后，相关记录和结算也会一并删除，请谨慎操作。
              </p>
            </SurfaceCard>
          </FadeInBlock>
        </div>
      </div>
    </PageContainer>
  );
}