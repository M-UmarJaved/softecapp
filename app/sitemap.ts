import type { MetadataRoute } from "next";

const SITE_URL =
  (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

const PUBLIC_ROUTES = [
  {
    path: "",
    changeFrequency: "daily",
    priority: 1,
  },
  {
    path: "/waitlist",
    changeFrequency: "daily",
    priority: 0.9,
  },
  {
    path: "/login",
    changeFrequency: "monthly",
    priority: 0.6,
  },
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return PUBLIC_ROUTES.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}