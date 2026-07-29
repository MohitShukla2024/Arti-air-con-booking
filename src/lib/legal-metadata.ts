import type { Metadata } from "next";

const BASE_URL = "https://artiair.com";

export function createLegalMetadata({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${BASE_URL}${path}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      siteName: "Arti Air Con",
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export const LEGAL_PAGES = [
  { href: "/terms-of-use", label: "Terms of Use" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/cookie-policy", label: "Cookie Policy" },
  { href: "/disclaimer", label: "Disclaimer" },
  { href: "/refund-policy", label: "Refund & Cancellation Policy" },
  { href: "/shipping-policy", label: "Shipping Policy" },
] as const;
