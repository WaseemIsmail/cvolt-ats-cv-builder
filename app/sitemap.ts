import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://cvolt-ats-cv.netlify.app";
  return [
    { url: base, changeFrequency: "weekly", priority: 1 },
    { url: base + "/builder", changeFrequency: "monthly", priority: 0.8 },
  ];
}