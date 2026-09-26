import React from "react";
import Link from "next/link";

/**
 * Final CTA — inverted plate with radial glow texture.
 * White-on-black button pair, mono footnote.
 */
export default function FinalCTA({
  eyebrow,
  title,
  description,
  primary,
  secondary,
  note,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: string;
  primary: { label: string; href: string };
  secondary?: { label: string; href: string };
  note?: string;
}) {
  return (
    <section className="border-t-4 border-foreground bg-foreground text-background texture-glow">
      <div className="mx-auto w-full max-w-6xl px-6 py-20 text-center md:px-8 md:py-32 lg:px-12">
        <div className="flex items-center justify-center gap-4">
          <span className="h-1 w-10 bg-background" aria-hidden="true" />
          <span className="font-mono text-[11px] tracking-[0.2em] text-background/70 uppercase">
            {eyebrow}
          </span>
          <span className="h-1 w-10 bg-background" aria-hidden="true" />
        </div>

        <h2 className="mx-auto mt-8 max-w-4xl font-display text-5xl leading-[0.9] font-black tracking-tighter md:text-7xl">
          {title}
        </h2>

        {description && (
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-background/80">
            {description}
          </p>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href={primary.href}
            className="group inline-flex items-center gap-3 border-2 border-background bg-background px-8 py-4 font-mono text-xs font-medium tracking-widest text-foreground uppercase transition-colors duration-100 hover:bg-transparent hover:text-background"
          >
            {primary.label}
            <span
              aria-hidden="true"
              className="transition-transform duration-100 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex items-center gap-3 border-2 border-background px-8 py-4 font-mono text-xs font-medium tracking-widest uppercase transition-colors duration-100 hover:bg-background hover:text-foreground"
            >
              {secondary.label}
            </Link>
          )}
        </div>

        {note && (
          <p className="mt-8 font-mono text-[10px] tracking-[0.25em] text-background/60 uppercase">
            {note}
          </p>
        )}
      </div>
    </section>
  );
}
