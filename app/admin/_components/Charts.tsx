"use client";

import React from "react";

export type Point = { label: string; value: number };

const W = 640;
const H = 220;
const PAD_X = 36;
const PAD_TOP = 18;
const PAD_BOTTOM = 26;

const formatCompact = (n: number) =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
      ? `${(n / 1_000).toFixed(1)}k`
      : String(n);

function isEmpty(data: Point[]) {
  return data.length === 0 || data.every((d) => d.value === 0);
}

function EmptyPlate({ label }: { label: string }) {
  return (
    <div className="flex h-[220px] items-center justify-center border-2 border-border-light bg-muted texture-hlines">
      <span className="font-mono text-[10px] tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </span>
    </div>
  );
}

/**
 * Hairline trend chart — black polyline, white-fill dots, ruler-thin grid.
 * Zero dependencies; renders from a plain numeric series.
 */
export function TrendChart({
  data,
  valueLabel = "value",
  emptyLabel = "No data yet",
}: {
  data: Point[];
  valueLabel?: string;
  emptyLabel?: string;
}) {
  if (isEmpty(data)) return <EmptyPlate label={emptyLabel} />;

  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;

  const points = data.map((d, i) => {
    const x = PAD_X + (i * innerW) / Math.max(data.length - 1, 1);
    const y = PAD_TOP + innerH - (d.value / max) * innerH;
    return { ...d, x, y };
  });

  const polyline = points.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const gridLines = [0, 0.25, 0.5, 0.75, 1];
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${valueLabel} trend, ${data.length} points, max ${max}`}
    >
      {/* ruler grid */}
      {gridLines.map((t) => {
        const y = PAD_TOP + innerH * t;
        return (
          <g key={t}>
            <line
              x1={PAD_X}
              x2={W - PAD_X}
              y1={y}
              y2={y}
              stroke={t === 1 ? "#000" : "#E5E5E5"}
              strokeWidth={t === 1 ? 1.5 : 1}
            />
            <text
              x={4}
              y={y + 3}
              fontSize="9"
              fill="#525252"
              fontFamily="var(--font-jetbrains), monospace"
            >
              {formatCompact(Math.round(max * (1 - t)))}
            </text>
          </g>
        );
      })}

      {/* trend */}
      <polyline
        points={polyline}
        fill="none"
        stroke="#000"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {points.map((p, i) => (
        <circle
          key={i}
          cx={p.x}
          cy={p.y}
          r="3.5"
          fill="#fff"
          stroke="#000"
          strokeWidth="1.5"
        >
          <title>{`${p.label}: ${p.value}`}</title>
        </circle>
      ))}

      {/* x labels */}
      {points.map((p, i) =>
        i % labelEvery === 0 || i === points.length - 1 ? (
          <text
            key={`l${i}`}
            x={p.x}
            y={H - 8}
            fontSize="9"
            textAnchor="middle"
            fill="#525252"
            fontFamily="var(--font-jetbrains), monospace"
          >
            {p.label}
          </text>
        ) : null
      )}
    </svg>
  );
}

/**
 * Solid black bars on a baseline rule; hover inverts (white fill, black edge).
 */
export function BarChart({
  data,
  formatValue = (n) => String(n),
  valueLabel = "value",
  emptyLabel = "No data yet",
}: {
  data: Point[];
  formatValue?: (n: number) => string;
  valueLabel?: string;
  emptyLabel?: string;
}) {
  if (isEmpty(data)) return <EmptyPlate label={emptyLabel} />;

  const max = Math.max(...data.map((d) => d.value), 1);
  const innerW = W - PAD_X * 2;
  const innerH = H - PAD_TOP - PAD_BOTTOM;
  const slot = innerW / data.length;
  const barW = Math.min(slot * 0.6, 56);
  const labelEvery = Math.ceil(data.length / 6);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`${valueLabel} by period, max ${formatValue(max)}`}
    >
      <line
        x1={PAD_X}
        x2={W - PAD_X}
        y1={PAD_TOP + innerH}
        y2={PAD_TOP + innerH}
        stroke="#000"
        strokeWidth="1.5"
      />

      {data.map((d, i) => {
        const h = (d.value / max) * innerH;
        const x = PAD_X + i * slot + (slot - barW) / 2;
        const y = PAD_TOP + innerH - h;
        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barW}
              height={Math.max(h, d.value > 0 ? 2 : 0)}
              className="fill-foreground stroke-foreground transition-colors duration-100 hover:fill-background"
              strokeWidth="2"
            >
              <title>{`${d.label}: ${formatValue(d.value)}`}</title>
            </rect>
            {i % labelEvery === 0 || i === data.length - 1 ? (
              <text
                x={x + barW / 2}
                y={H - 8}
                fontSize="9"
                textAnchor="middle"
                fill="#525252"
                fontFamily="var(--font-jetbrains), monospace"
              >
                {d.label}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
