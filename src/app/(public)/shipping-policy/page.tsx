import type { Metadata } from "next";
import { LegalPageLayout } from "@/components/shared/legal-page-layout";
import { SHIPPING_POLICY } from "@/lib/legal-content";
import { createLegalMetadata } from "@/lib/legal-metadata";

export const metadata: Metadata = createLegalMetadata({
  title: "Shipping Policy | Arti Air Con",
  description:
    "Arti Air Con does not ship physical goods. Read our shipping policy explaining on-site AC service delivery and future policy updates.",
  path: "/shipping-policy",
});

export default function ShippingPolicyPage() {
  return <LegalPageLayout content={SHIPPING_POLICY} />;
}
