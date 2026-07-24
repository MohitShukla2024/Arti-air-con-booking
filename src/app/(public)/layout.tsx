import { HeaderNavbar } from "@/components/shared/header-navbar";
import { Footer } from "@/components/shared/footer";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";
import { LanguageModal } from "@/components/shared/language-modal";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#f7f9fb] pb-24 md:pb-0">
      <LanguageModal />
      <HeaderNavbar variant="public" />
      <main className="flex-1">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
