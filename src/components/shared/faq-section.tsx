"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQ_LIST } from "@/lib/constants";

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleAccordion = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-20 bg-white px-6" id="faq">
      <div className="max-w-3xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-[#191c1e] text-center mb-12">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {FAQ_LIST.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className={`bg-[#ffffff] rounded-2xl border border-[#c2c6d8]/30 transition-all ${
                  isOpen ? "shadow-md border-[#0066ff]/30" : ""
                }`}
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full flex justify-between items-center p-6 cursor-pointer text-left focus:outline-none"
                >
                  <span className="font-display text-lg font-semibold text-[#191c1e]">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#0050cb] transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 text-sm text-[#424656] leading-relaxed border-t border-[#f2f4f6] pt-4">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
