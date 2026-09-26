import React from "react";

export type FaqItem = { q: string; a: string };

/**
 * FAQ accordion — native <details>, instant open/close, line-based rows.
 * Rows invert on hover; the +/− toggle is pure CSS (see globals.css).
 */
export default function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="border-t-2 border-foreground">
      {items.map((item) => (
        <details key={item.q} className="faq-item border-b-2 border-foreground">
          <summary className="flex cursor-pointer items-start justify-between gap-6 px-4 py-6 transition-colors duration-100 hover:bg-foreground hover:text-background md:px-6">
            <span className="font-display text-xl leading-snug font-bold tracking-tight md:text-2xl">
              {item.q}
            </span>
            <span
              className="faq-toggle mt-1 shrink-0 font-mono text-xl leading-none"
              aria-hidden="true"
            >
              <span className="faq-closed">+</span>
              <span className="faq-open">−</span>
            </span>
          </summary>
          <p className="max-w-3xl px-4 pb-6 text-base leading-relaxed text-muted-foreground md:px-6">
            {item.a}
          </p>
        </details>
      ))}
    </div>
  );
}
