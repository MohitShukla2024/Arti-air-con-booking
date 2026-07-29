import Link from "next/link";
import type { LegalPageContent } from "@/lib/legal-content";
import { LEGAL_PAGES } from "@/lib/legal-metadata";

type LegalPageLayoutProps = {
  content: LegalPageContent;
};

export function LegalPageLayout({ content }: LegalPageLayoutProps) {
  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#0050cb] mb-3">
          Legal Information
        </p>
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#191c1e] mb-4">
          {content.title}
        </h1>
        <p className="text-sm text-[#727687]">Last updated: {content.lastUpdated}</p>
        <p className="mt-4 text-[#424656] leading-relaxed">{content.intro}</p>
      </header>

      <nav
        aria-label="Table of contents"
        className="mb-10 rounded-2xl border border-[#c2c6d8]/40 bg-white p-5 sm:p-6"
      >
        <h2 className="font-display text-sm font-bold uppercase tracking-wide text-[#191c1e] mb-3">
          On this page
        </h2>
        <ol className="grid sm:grid-cols-2 gap-2 text-sm">
          {content.sections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                className="text-[#0050cb] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff] rounded"
              >
                {section.title}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="space-y-8">
        {content.sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-heading`}
            className="rounded-2xl border border-[#c2c6d8]/30 bg-white p-6 sm:p-8 scroll-mt-28"
          >
            <h2
              id={`${section.id}-heading`}
              className="font-display text-xl font-bold text-[#191c1e] mb-4"
            >
              {section.title}
            </h2>
            <div className="space-y-3 text-[#424656] leading-relaxed text-sm sm:text-base">
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
              {section.list && (
                <ul className="list-disc pl-5 space-y-2">
                  {section.list.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        ))}
      </div>

      <footer className="mt-12 pt-8 border-t border-[#c2c6d8]/30">
        <h2 className="font-display text-base font-bold text-[#191c1e] mb-4">
          Related policies
        </h2>
        <ul className="flex flex-wrap gap-3 text-sm">
          {LEGAL_PAGES.filter((page) => page.label !== content.title).map((page) => (
            <li key={page.href}>
              <Link
                href={page.href}
                className="inline-flex items-center rounded-full border border-[#c2c6d8]/50 px-4 py-2 text-[#0050cb] hover:bg-[#dae1ff]/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0066ff]"
              >
                {page.label}
              </Link>
            </li>
          ))}
        </ul>
      </footer>
    </article>
  );
}
