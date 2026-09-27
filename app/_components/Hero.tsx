import React from "react";
import Link from "next/link";
import GuestStartButton from "./GuestStartButton";

/**
 * Hero — editorial masthead.
 * The headline runs full-width (magazine cover scale), then splits into
 * a text column and an inverted typographic plate.
 */
const Hero = () => {
  return (
    <section className="border-b-4 border-foreground bg-background">
      {/* Masthead */}
      <div className="mx-auto w-full max-w-6xl px-6 md:px-8 lg:px-12">
        {/* Visual punctuation: rule + bordered square + label */}
        <div className="flex items-center gap-4 pt-16 md:pt-24">
          <span className="h-1 w-16 bg-foreground" aria-hidden="true" />
          <span
            className="size-3 border-2 border-foreground"
            aria-hidden="true"
          />
          <span className="font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            Docs &amp; Whiteboards — one workspace
          </span>
        </div>

        <h1 className="mt-10 font-display text-6xl leading-[0.82] font-black tracking-tighter sm:text-7xl md:text-8xl lg:text-9xl">
          Draw
          <br />
          <span className="font-normal italic tracking-tight">&amp;</span>{" "}
          Document
        </h1>

        {/* Heavy rule terminating in a bordered square */}
        <div className="mt-10 flex items-center" aria-hidden="true">
          <span className="h-1 flex-1 bg-foreground" />
          <span className="size-6 border-2 border-foreground" />
        </div>
      </div>

      {/* Split row */}
      <div className="mx-auto grid w-full max-w-6xl border-t-4 border-foreground lg:grid-cols-2">
        {/* Left: lead + CTAs */}
        <div className="border-b-4 border-foreground px-6 py-14 md:px-8 md:py-16 lg:border-b-0 lg:border-r-4 lg:px-12">
          <p className="max-w-md border-l-2 border-foreground pl-6 text-lg leading-relaxed text-muted-foreground">
            A collaborative workspace where documents and whiteboards live
            together. Organize thoughts, design system architectures, and ship
            faster.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/register"
              className="group inline-flex items-center gap-3 border-2 border-foreground bg-foreground px-8 py-4 font-mono text-xs font-medium tracking-widest text-background uppercase transition-colors duration-100 hover:bg-background hover:text-foreground"
            >
              Start Creating
              <span
                aria-hidden="true"
                className="transition-transform duration-100 group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <GuestStartButton
              label="Try Without Sign-up"
              loadingLabel="Opening…"
              showArrow={false}
              className="inline-flex items-center gap-3 border-2 border-foreground px-8 py-4 font-mono text-xs font-medium tracking-widest uppercase transition-colors duration-100 hover:bg-foreground hover:text-background disabled:opacity-60"
            />
            <Link
              href="/about"
              className="inline-flex items-center gap-3 border-2 border-foreground px-8 py-4 font-mono text-xs font-medium tracking-widest uppercase transition-colors duration-100 hover:bg-foreground hover:text-background"
            >
              View Features
            </Link>
          </div>
        </div>

        {/* Right: inverted typographic plate */}
        <div className="relative flex min-h-[420px] items-center justify-center overflow-hidden bg-foreground text-background texture-vlines lg:min-h-full">
          <div className="absolute inset-0 texture-glow" aria-hidden="true" />
          <span
            aria-hidden="true"
            className="relative select-none font-display text-[10rem] leading-none font-normal italic md:text-[13rem]"
          >
            &amp;
          </span>
          <span
            className="absolute top-6 left-6 size-8 border-2 border-background"
            aria-hidden="true"
          />
          <span className="absolute right-6 bottom-6 font-mono text-[10px] tracking-[0.3em] text-background/70 uppercase">
            Draw · Document · Ship
          </span>
        </div>
      </div>
    </section>
  );
};

export default Hero;
