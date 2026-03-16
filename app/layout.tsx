import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "共土",
  description: "彼此不可见，但共同影响一片缓慢生长的共土。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="bg-zinc-950 text-white">
        <NavBar />
        {children}
      </body>
    </html>
  );
}