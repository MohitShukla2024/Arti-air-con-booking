import { Clock, UserCheck, CreditCard, ShieldCheck } from "lucide-react";

export function TrustBadgesSection() {
  const trustFactors = [
    { icon: Clock, title: "Same Day Service" },
    { icon: UserCheck, title: "Expert Technicians" },
    { icon: CreditCard, title: "Affordable Pricing" },
    { icon: ShieldCheck, title: "Genuine Spare Parts" },
  ];

  return (
    <section id="about" className="scroll-mt-24 bg-[#f2f4f6] py-12 border-y border-[#c2c6d8]/30">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {trustFactors.map((factor) => {
            const Icon = factor.icon;
            return (
              <div
                key={factor.title}
                className="flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0066ff]/10 text-[#0050cb] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-semibold text-[#191c1e]">{factor.title}</h3>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
