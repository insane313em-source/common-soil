"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import ScreenDots from "@/components/ScreenDots";

type FullPageScrollProps = {
  children: ReactNode;
};

export default function FullPageScroll({ children }: FullPageScrollProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isLockedRef = useRef(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    function handleResize() {
      setIsDesktop(window.innerWidth >= 1024);
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const maybeContainer = containerRef.current;
    if (!maybeContainer) return;

    const container: HTMLDivElement = maybeContainer;

    container.scrollTo({ top: 0, behavior: "auto" });

    if (!isDesktop) {
      return;
    }

    const sections = Array.from(
      container.querySelectorAll<HTMLElement>("[data-fullpage-section]")
    );

    function getClosestSectionIndex() {
      const top = container.scrollTop;
      const vh = container.clientHeight;
      return Math.round(top / vh);
    }

    function scrollToIndex(index: number) {
      const clamped = Math.max(0, Math.min(index, sections.length - 1));
      sections[clamped]?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
      setCurrentIndex(clamped);
    }

    function handleWheel(e: WheelEvent) {
      if (isLockedRef.current) {
        e.preventDefault();
        return;
      }

      const delta = e.deltaY;
      if (Math.abs(delta) < 20) return;

      e.preventDefault();

      const index = getClosestSectionIndex();
      isLockedRef.current = true;

      if (delta > 0) {
        scrollToIndex(index + 1);
      } else {
        scrollToIndex(index - 1);
      }

      window.setTimeout(() => {
        isLockedRef.current = false;
      }, 850);
    }

    function handleScroll() {
      setCurrentIndex(getClosestSectionIndex());
    }

    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("scroll", handleScroll);
    };
  }, [isDesktop]);

  const count = Array.isArray(children) ? children.length : 1;

  return (
    <>
      {isDesktop ? (
        <ScreenDots
          total={count}
          current={currentIndex}
          onJump={(index) => {
            const container = containerRef.current;
            if (!container) return;

            const sections = Array.from(
              container.querySelectorAll<HTMLElement>("[data-fullpage-section]")
            );
            sections[index]?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
            setCurrentIndex(index);
          }}
        />
      ) : null}

      <div
        ref={containerRef}
        className={isDesktop ? "fullpage-shell" : "fullpage-shell-mobile"}
      >
        {children}
      </div>
    </>
  );
}