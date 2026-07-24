import { Snowflake } from "lucide-react";
import { BRAND_INFO } from "@/lib/constants";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-mesh min-h-screen font-sans text-[#191c1e] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="fixed -z-10 top-20 -right-20 w-96 h-96 bg-[#0066ff]/5 rounded-full blur-[80px]"></div>
      <div className="fixed -z-10 bottom-20 -left-20 w-96 h-96 bg-blue-400/5 rounded-full blur-[80px]"></div>

      {/* Main Container */}
      <main className="w-full max-w-md my-auto">
        {/* Header / Logo */}
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#0066ff] rounded-2xl flex items-center justify-center shadow-lg mb-4 text-white">
            <Snowflake className="w-10 h-10" />
          </div>
          <h1 className="font-display text-2xl font-bold text-[#0050cb]">
            {BRAND_INFO.name}
          </h1>
          <p className="text-[#424656] text-sm mt-1">
            {BRAND_INFO.subTagline}
          </p>
        </div>

        {children}
      </main>
    </div>
  );
}
