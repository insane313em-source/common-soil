"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function HomeCtaScreenClient() {
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
    <section data-fullpage-section className="fullpage-screen fullpage-stage">
      <div className="fullpage-grid-bg" />
      <div className="fullpage-inner mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="screen-panel-rich screen-frame relative overflow-hidden p-8 sm:p-10 lg:p-12">
          <div className="screen-orb screen-orb-a" />
          <div className="screen-orb screen-orb-b" />

          <div className="max-w-3xl">
            <p className="screen-kicker">Start Now</p>
            <h2 className="mt-4 text-5xl font-semibold tracking-tight text-white">
              建立一片只属于你们的共土。
            </h2>
            <p className="mt-6 screen-subcopy">
              让每天的状态不再只停留在聊天记录里，而是被沉淀成可以长期观看、长期积累、长期回望的一片地方。
            </p>
          </div>

          <div className="mt-10 flex flex-wrap gap-3">
            <a
              href={loggedIn ? "/home" : "/signup"}
              className="primary-button rounded-full px-6 py-3 text-sm font-medium"
            >
              {loggedIn ? "进入总览" : "注册开始"}
            </a>

            <a
              href={loggedIn ? "/garden" : "/login"}
              className="secondary-button rounded-full px-6 py-3 text-sm"
            >
              {loggedIn ? "查看共土" : "已有账号，去登录"}
            </a>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="screen-metric">
              <p className="screen-metric-label">Record</p>
              <p className="screen-metric-value">Input Daily State</p>
            </div>
            <div className="screen-metric">
              <p className="screen-metric-label">Settle</p>
              <p className="screen-metric-value">Translate Emotion</p>
            </div>
            <div className="screen-metric">
              <p className="screen-metric-label">Grow</p>
              <p className="screen-metric-value">Build A Place</p>
            </div>
          </div>

          <div className="mt-10 screen-side-line" />
        </div>
      </div>
    </section>
  );
}