import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { REFUND_POLICY } from "@/lib/legal-content";
import { createLegalMetadata } from "@/lib/legal-metadata";

export const metadata: Metadata = createLegalMetadata({
  title: "Refund & Cancellation Policy | Arti Air Con",
  description:
    "Review Arti Air Con booking cancellation, refund eligibility, admin cancellations, and current no-online-payment policy for AC services.",
  path: "/refund-policy",
});

export default function RefundPolicyPage() {
  return <LegalPageLayout content={REFUND_POLICY} />;
}
