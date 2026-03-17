import PageContainer from "@/components/PageContainer";
import EmptyStateCard from "@/components/EmptyStateCard";

export default function NotFoundPage() {
  return (
    <PageContainer>
      <EmptyStateCard
        title="这个页面不存在"
        description="你访问的页面可能已经被移动，或者这个地址本来就不存在。回到首页，或者进入你的共土总览继续。"
        primaryHref="/"
        primaryLabel="返回首页"
        secondaryHref="/home"
        secondaryLabel="进入总览"
      />
    </PageContainer>
  );
}