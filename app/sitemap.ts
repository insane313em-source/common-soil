import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://insanetgbot.xyz";

  const routes = [
    "",
    "/about",
    "/guide",
    "/privacy",
    "/login",
    "/signup",
    "/forgot-password",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.7,
  }));
}