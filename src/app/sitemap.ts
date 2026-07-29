import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://artiair.com";
  const now = new Date();

  const legalPages = [
    "/terms-of-use",
    "/privacy-policy",
    "/cookie-policy",
    "/disclaimer",
    "/refund-policy",
    "/shipping-policy",
  ];

  return [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/book`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...legalPages.map((path) => ({
      url: `${baseUrl}${path}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];
}
