import { MetadataRoute } from "next";

/**
 *
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: "https://carbon-assistant.vercel.app",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
  ];
}
