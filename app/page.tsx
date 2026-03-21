import PageContainer from "@/components/PageContainer";
import FullPageScroll from "@/components/FullPageScroll";
import HomeHeroScreenClient from "@/components/HomeHeroScreenClient";
import HomeFeatureShowcaseScreen from "@/components/HomeFeatureShowcaseScreen";
import HomeProcessShowcaseScreen from "@/components/HomeProcessShowcaseScreen";
import HomeAtmosphereScreen from "@/components/HomeAtmosphereScreen";
import HomeCtaScreenClient from "@/components/HomeCtaScreenClient";

export default function Home() {
  return (
    <PageContainer className="p-0">
      <FullPageScroll>
        <HomeHeroScreenClient />
        <HomeFeatureShowcaseScreen />
        <HomeProcessShowcaseScreen />
        <HomeAtmosphereScreen />
        <HomeCtaScreenClient />
      </FullPageScroll>
    </PageContainer>
  );
}