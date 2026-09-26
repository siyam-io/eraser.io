import React from "react";

/**
 * Editorial pull quote — oversized italic serif framed by thick rules,
 * with an oversized quotation mark used as a graphic element.
 */
export default function PullQuote({
  quote,
  attribution,
  role,
  eyebrow,
}: {
  quote: React.ReactNode;
  attribution: string;
  role?: string;
  eyebrow?: string;
}) {
  return (
    <figure className="relative border-t-4 border-b-4 border-foreground py-12 md:py-16">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-6 left-0 font-display text-9xl leading-none text-foreground/5 select-none md:-top-10"
      >
        &ldquo;
      </span>

      <div className="relative">
        {eyebrow && (
          <figcaption className="mb-6 font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            {eyebrow}
          </figcaption>
        )}
        <blockquote className="max-w-4xl font-display text-3xl leading-[1.15] font-medium italic tracking-tight md:text-5xl">
          {quote}
        </blockquote>
        <div className="mt-8 flex items-center gap-4">
          <span className="h-1 w-10 bg-foreground" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-[0.2em] uppercase">
            {attribution}
          </span>
          {role && (
            <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
              — {role}
            </span>
          )}
        </div>
      </div>
    </figure>
  );
}
