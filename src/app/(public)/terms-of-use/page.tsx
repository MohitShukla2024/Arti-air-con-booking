import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { TERMS_OF_USE } from "@/lib/legal-content";
import { createLegalMetadata } from "@/lib/legal-metadata";

export const metadata: Metadata = createLegalMetadata({
  title: "Terms of Use | Arti Air Con",
  description:
    "Read the Terms of Use for Arti Air Con AC repair and service booking platform, including booking rules, pricing, cancellation, and customer responsibilities.",
  path: "/terms-of-use",
});

export default function TermsOfUsePage() {
  return <LegalPageLayout content={TERMS_OF_USE} />;
}
