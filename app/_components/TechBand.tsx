import React from "react";

/**
 * Capability band — a ruled strip of product capabilities in mono caps.
 * Sits directly beneath the hero as a masthead colophon.
 */
export default function TechBand({ items }: { items: string[] }) {
  return (
    <div className="border-b-4 border-foreground bg-background">
      <ul className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-6 py-5 font-mono text-[11px] tracking-[0.2em] uppercase md:px-8 lg:px-12">
        {items.map((item, i) => (
          <li key={item} className="flex items-center gap-4">
            {i > 0 && (
              <span className="text-muted-foreground" aria-hidden="true">
                /
              </span>
            )}
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
