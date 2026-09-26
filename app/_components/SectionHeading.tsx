import React from "react";

/**
 * Shared section heading: hairline rule + mono eyebrow + oversized serif title.
 * The repeated masthead grammar across every marketing section.
 */
export default function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  className = "",
  level = 2,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  level?: 1 | 2;
}) {
  const center = align === "center";
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <div className={`${center ? "text-center" : ""} ${className}`}>
      <div className={`flex items-center gap-4 ${center ? "justify-center" : ""}`}>
        <span className="h-1 w-12 bg-foreground" aria-hidden="true" />
        <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
          {eyebrow}
        </span>
      </div>
      <Heading className="mt-6 font-display text-4xl leading-[0.9] font-black tracking-tighter md:text-6xl">
        {title}
      </Heading>
      {description && (
        <p
          className={`mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground ${
            center ? "mx-auto" : ""
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}
