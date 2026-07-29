import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { PRIVACY_POLICY } from "@/lib/legal-content";
import { createLegalMetadata } from "@/lib/legal-metadata";

export const metadata: Metadata = createLegalMetadata({
  title: "Privacy Policy | Arti Air Con",
  description:
    "Learn how Arti Air Con collects, uses, and protects your personal information on our AC service booking platform, including phone, booking, and notification data.",
  path: "/privacy-policy",
});

export default function PrivacyPolicyPage() {
  return <LegalPageLayout content={PRIVACY_POLICY} />;
}
