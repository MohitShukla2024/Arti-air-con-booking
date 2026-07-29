import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";
import { AuthHydrator } from "@/components/shared/auth-hydrator";
import { SettingsHydrator } from "@/components/shared/settings-hydrator";
import { NotificationPermissionModal } from "@/components/notifications/notification-permission-modal";
import { NotificationListener } from "@/components/notifications/notification-listener";
import { PwaInstallPrompt } from "@/components/pwa/pwa-install-prompt";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0066ff",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://artiair.com"),
  title: "Arti Air Con | Professional AC Services",
  description: "Get expert care for your air conditioner today. From routine maintenance to complex repairs, we ensure your home stays cool and comfortable.",
  keywords: ["AC repair", "AC service", "Air conditioning", "Arti Air Con", "AC installation", "Gas filling"],
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    other: [
      { rel: "apple-touch-icon-precomposed", url: "/apple-touch-icon.png" },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Arti Air Con",
  },
  openGraph: {
    title: "Arti Air Con | Professional AC Services",
    description: "Expert air conditioner repair, installation, and maintenance services.",
    url: "https://artiair.com",
    siteName: "Arti Air Con",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arti Air Con | Professional AC Services",
    description: "Expert air conditioner repair, installation, and maintenance services.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} scroll-smooth antialiased`}
    >
      <body className="min-h-screen bg-[#f7f9fb] font-sans text-[#191c1e] flex flex-col selection:bg-[#0066ff] selection:text-white">
        <AuthHydrator />
        <SettingsHydrator />
        <NotificationListener />
        <NotificationPermissionModal />
        <PwaInstallPrompt />
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        {children}
      </body>
    </html>
  );
}
