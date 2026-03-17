import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://insanetgbot.xyz"),
  title: {
    default: "共土",
    template: "%s · 共土",
  },
  description: "彼此不可见，但共同影响一片缓慢生长的共土。",
  applicationName: "共土",
  keywords: ["共土", "Common Soil", "关系记录", "双人记录", "情感产品"],
  authors: [{ name: "Common Soil" }],
  openGraph: {
    title: "共土",
    description: "彼此不可见，但共同影响一片缓慢生长的共土。",
    url: "https://insanetgbot.xyz",
    siteName: "共土",
    locale: "zh_CN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "共土",
    description: "彼此不可见，但共同影响一片缓慢生长的共土。",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="text-white antialiased">
        <NavBar />
        {children}
        <Footer />
      </body>
    </html>
  );
}