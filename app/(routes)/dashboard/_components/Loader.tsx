import React from 'react';

/**
 * Line-based loading state. Uses currentColor so it works on both
 * the light app surfaces and the dark workspace panels.
 */
export default function Loader({ label = "Loading" }: { label?: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-4 py-12 text-current"
    >
      <div className="flex flex-col gap-1.5" aria-hidden="true">
        <span className="h-1 w-24 bg-current animate-pulse" />
        <span className="h-1 w-16 bg-current animate-pulse [animation-delay:150ms]" />
        <span className="h-1 w-8 bg-current animate-pulse [animation-delay:300ms]" />
      </div>
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] opacity-60">
        {label}
      </span>
    </div>
  );
}
