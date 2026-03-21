"use client";

import { useEffect, useState } from "react";
import SoilScene from "@/components/SoilScene";
import { createClient } from "@/lib/supabase-browser";

export default function HomeHeroScreenClient() {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function checkUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setLoggedIn(!!user);
    }

    checkUser();
  }, []);

  return (
    <section data-fullpage-section className="fullpage-screen">
      <div className="fullpage-inner mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <div>
            <p className="screen-kicker">Common Soil</p>

            <h1 className="screen-display mt-6 text-white">
              让关系不只停留在对话里，
              <br />
              而是在一片地方里慢慢显形。
            </h1>

            <p className="screen-subcopy mt-8">
              共土不是聊天框，也不是打分器。它让两个人分别写下每天的情绪、近况与没说出口的话，再由系统在幕后把这些内容转译成土壤、天气、光线与生命变化。
            </p>

            <div className="mt-10 flex flex-wrap gap-3">
              <a
                href={loggedIn ? "/home" : "/create"}
                className="primary-button rounded-full px-6 py-3 text-sm font-medium"
              >
                {loggedIn ? "进入我的共土" : "创建共土"}
              </a>

              <a
                href={loggedIn ? "/garden" : "/join"}
                className="secondary-button rounded-full px-6 py-3 text-sm"
              >
                {loggedIn ? "查看当前共土" : "加入共土"}
              </a>

              {!loggedIn ? (
                <a
                  href="/login"
                  className="secondary-button rounded-full px-6 py-3 text-sm"
                >
                  登录
                </a>
              ) : null}
            </div>
          </div>

          <div className="screen-panel p-5 sm:p-6">
            <SoilScene
              leafCount={8}
              flowerCount={4}
              lightLevel={4}
              mistLevel={2}
              fireflyCount={6}
              waterGlow
              title="夜色温缓，风停了一些。"
              subtitle="COMMON SOIL PREVIEW"
            />
          </div>
        </div>
      </div>
    </section>
  );
}