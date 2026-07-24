import { HeaderNavbar } from "@/components/shared/header-navbar";
import { Footer } from "@/components/shared/footer";
import { MobileBottomNav } from "@/components/shared/mobile-bottom-nav";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] pb-24 md:pb-0">
      <HeaderNavbar variant="customer" />
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 py-8">{children}</main>
      <Footer />
      <MobileBottomNav />
    </div>
  );
}
