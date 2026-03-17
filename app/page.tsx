import PageContainer from "@/components/PageContainer";
import FeatureGrid from "@/components/FeatureGrid";
import SectionTitle from "@/components/SectionTitle";
import SoilScene from "@/components/SoilScene";
import StatusPill from "@/components/StatusPill";
import StepFlow from "@/components/StepFlow";
import SurfaceCard from "@/components/SurfaceCard";
import { createClient } from "@/lib/supabase-server";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <PageContainer className="flex items-center">
      <div className="mx-auto w-full max-w-6xl">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <SurfaceCard className="soft-grid rounded-[32px] p-8 sm:p-10 lg:p-12">
            <StatusPill>COMMON SOIL</StatusPill>

            <SectionTitle
              title="让关系在一片缓慢生长的共土里，被温柔地看见。"
              description="共土不是聊天框，也不是打分器。它让两个人每天分别记录情绪、近况与没说出口的话，再由系统在幕后把这些内容转译成土壤、天气、光线与生命变化。"
            />

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={user ? "/home" : "/create"}
                className="primary-button rounded-full px-6 py-3 text-sm font-medium"
              >
                {user ? "进入我的共土" : "创建共土"}
              </a>
              <a
                href={user ? "/garden" : "/join"}
                className="secondary-button rounded-full px-6 py-3 text-sm"
              >
                {user ? "查看当前共土" : "加入共土"}
              </a>
              {!user ? (
                <a
                  href="/login"
                  className="secondary-button rounded-full px-6 py-3 text-sm"
                >
                  登录
                </a>
              ) : null}
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  不直接暴露原文
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  系统只给出关系层面的观察与变化，不把双方记录直接摊开。
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  幕后温和结算
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  每天生成共振主题、关系气候、隐喻建议和轻动作提示。
                </p>
              </div>

              <div className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.22em] text-zinc-500">
                  长期共同养成
                </p>
                <p className="mt-3 text-sm leading-6 text-zinc-400">
                  不是一次性结论，而是长期积累出的一个地方与一段轨迹。
                </p>
              </div>
            </div>
          </SurfaceCard>

          <SurfaceCard className="rounded-[32px] p-6 sm:p-8">
            <SoilScene
              leafCount={8}
              flowerCount={4}
              lightLevel={4}
              mistLevel={2}
              fireflyCount={6}
              waterGlow
              relationshipWeather="夜色温缓，风停了一些。"
              soilState="湿润"
              lightState="微亮"
              vitalityState="缓慢生长"
              connectionState="仍在连接"
              title="夜色温缓，风停了一些。"
              subtitle="COMMON SOIL PREVIEW"
            />
          </SurfaceCard>
        </div>

        <div className="mt-10">
          <SectionTitle
            eyebrow="Core Features"
            title="一套更克制的关系产品语言"
            description="它不追求喧闹地解决问题，而是让双方在不被直接暴露的前提下，看见关系如何被日常慢慢塑形。"
          />
          <div className="mt-6">
            <FeatureGrid />
          </div>
        </div>

        <div className="mt-12">
          <SectionTitle
            eyebrow="How It Works"
            title="从进入共土，到共同塑造一片地方"
            description="体验流程很轻，但留下的痕迹会越来越深。"
          />
          <div className="mt-6">
            <StepFlow />
          </div>
        </div>

        <div className="mt-12">
          <SurfaceCard className="rounded-[32px] p-8 sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <StatusPill>Start Now</StatusPill>
                <h2 className="mt-3 text-3xl font-semibold tracking-tight text-white">
                  现在就开始养一片属于你们的共土。
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-zinc-400">
                  建立一片只属于两个人的缓慢空间，让每天的状态不再只停留在聊天记录里，而是沉淀成一个地方。
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href={user ? "/home" : "/signup"}
                  className="primary-button rounded-full px-6 py-3 text-sm font-medium"
                >
                  {user ? "进入总览" : "注册开始"}
                </a>
                <a
                  href={user ? "/garden" : "/login"}
                  className="secondary-button rounded-full px-6 py-3 text-sm"
                >
                  {user ? "查看共土" : "已有账号，去登录"}
                </a>
              </div>
            </div>
          </SurfaceCard>
        </div>
      </div>
    </PageContainer>
  );
}