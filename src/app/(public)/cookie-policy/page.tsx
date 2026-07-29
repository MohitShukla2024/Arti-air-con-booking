import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { COOKIE_POLICY } from "@/lib/legal-content";
import { createLegalMetadata } from "@/lib/legal-metadata";

export const metadata: Metadata = createLegalMetadata({
  title: "Cookie Policy | Arti Air Con",
  description:
    "Understand how Arti Air Con uses cookies for authentication, sessions, preferences, and future analytics on our AC booking website.",
  path: "/cookie-policy",
});

export default function CookiePolicyPage() {
  return <LegalPageLayout content={COOKIE_POLICY} />;
}
