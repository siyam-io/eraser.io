import React from "react";

export type Stat = { value: string; label: string; note?: string };

/**
 * Inverted stats band — black plate with vertical line texture.
 * Cells divided by 20% white hairlines via the gap-px technique.
 */
export default function StatsBand({
  caption,
  stats,
}: {
  caption: string;
  stats: Stat[];
}) {
  return (
    <section className="border-y-4 border-foreground bg-foreground text-background">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-8 lg:px-12">
        <div className="border-b border-background/20 py-5 font-mono text-[10px] tracking-[0.3em] text-background/70 uppercase">
          {caption}
        </div>

        <div className="grid gap-px bg-background/20 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-foreground px-6 py-10 texture-vlines lg:py-14"
            >
              <div className="font-display text-5xl leading-none font-black tracking-tighter md:text-6xl">
                {stat.value}
              </div>
              <div className="mt-4 font-mono text-[10px] tracking-[0.25em] text-background/70 uppercase">
                {stat.label}
              </div>
              {stat.note && (
                <p className="mt-2 text-sm leading-relaxed text-background/80">
                  {stat.note}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
