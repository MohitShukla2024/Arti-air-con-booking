import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { DISCLAIMER } from "@/lib/legal-content";
import { createLegalMetadata } from "@/lib/legal-metadata";

export const metadata: Metadata = createLegalMetadata({
  title: "Disclaimer | Arti Air Con",
  description:
    "Important disclaimer about Arti Air Con AC service availability, pricing variations, repair inspection costs, and emergency service limitations.",
  path: "/disclaimer",
});

export default function DisclaimerPage() {
  return <LegalPageLayout content={DISCLAIMER} />;
}
