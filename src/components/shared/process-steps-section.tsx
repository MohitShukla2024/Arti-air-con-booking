import { CalendarCheck, MailCheck, Home, CheckCircle2 } from "lucide-react";
import { PROCESS_STEPS } from "@/lib/constants";

export function ProcessStepsSection() {
  const iconMap: Record<string, React.ElementType> = {
    CalendarCheck,
    MailCheck,
    Home,
    CheckCircle2,
  };

  return (
    <section className="py-20 px-6 bg-[#f7f9fb]">
      <div className="max-w-[1280px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl font-bold text-[#191c1e]">
            Simple 4-Step Process
          </h2>
        </div>

        <div className="grid md:grid-cols-4 gap-8 relative">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-0.5 bg-[#c2c6d8]/30 -z-0" />

          {PROCESS_STEPS.map((stepItem) => {
            const Icon = iconMap[stepItem.icon] || CalendarCheck;
            return (
              <div
                key={stepItem.step}
                className="text-center space-y-4 relative z-10"
              >
                <div className="w-20 h-20 rounded-full bg-white shadow-lg mx-auto flex items-center justify-center text-[#0050cb] border-4 border-[#dae1ff] relative">
                  <Icon className="w-8 h-8" />
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#0066ff] text-white text-sm font-bold flex items-center justify-center shadow-md">
                    {stepItem.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-bold text-[#191c1e]">
                  {stepItem.title}
                </h3>
                <p className="text-xs text-[#424656] max-w-xs mx-auto leading-relaxed">
                  {stepItem.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
