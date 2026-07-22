"use client";

import { useId, useState } from "react";
import { formatKES } from "@/lib/format";

type Point = { label: string; totalKES: number };

const WIDTH = 640;
const HEIGHT = 220;
const PAD_LEFT = 4;
const PAD_RIGHT = 4;
const PAD_TOP = 16;
const PAD_BOTTOM = 24;
const MAX_BAR_WIDTH = 24;
const BAR_RADIUS = 4;

function niceCeiling(value: number) {
  if (value <= 0) return 100;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const norm = value / base;
  const niceNorm = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return niceNorm * base;
}

// Rounded top corners, square baseline — "4px rounded data-end, square at the baseline".
function roundedTopRectPath(x: number, y: number, w: number, h: number, r: number) {
  if (h <= 0) return "";
  const radius = Math.min(r, h, w / 2);
  return [
    `M${x},${y + h}`,
    `L${x},${y + radius}`,
    `Q${x},${y} ${x + radius},${y}`,
    `L${x + w - radius},${y}`,
    `Q${x + w},${y} ${x + w},${y + radius}`,
    `L${x + w},${y + h}`,
    "Z",
  ].join(" ");
}

export function WeeklyRevenueChart({ data }: { data: Point[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const gridId = useId();

  const chartWidth = WIDTH - PAD_LEFT - PAD_RIGHT;
  const chartHeight = HEIGHT - PAD_TOP - PAD_BOTTOM;
  const slot = chartWidth / Math.max(data.length, 1);
  const barWidth = Math.min(MAX_BAR_WIDTH, slot * 0.55);
  const maxValue = Math.max(0, ...data.map((d) => d.totalKES));
  const niceMax = niceCeiling(maxValue);

  const bars = data.map((d, i) => {
    const barHeight = niceMax > 0 ? (d.totalKES / niceMax) * chartHeight : 0;
    const x = PAD_LEFT + i * slot + (slot - barWidth) / 2;
    const y = PAD_TOP + chartHeight - barHeight;
    return { ...d, x, y, barHeight, slotX: PAD_LEFT + i * slot };
  });

  const activeBar = hovered !== null ? bars[hovered] : null;

  if (maxValue === 0) {
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        No completed sessions or document sales yet this period.
      </p>
    );
  }

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={`Revenue by week: ${data
          .map((d) => `${d.label} ${formatKES(d.totalKES)}`)
          .join(", ")}`}
        className="w-full"
      >
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP}
          x2={WIDTH - PAD_RIGHT}
          y2={PAD_TOP}
          stroke="var(--border)"
          strokeWidth="1"
        />
        <text x={PAD_LEFT} y={PAD_TOP - 5} fontSize="10" fill="var(--muted-foreground)">
          {formatKES(niceMax)}
        </text>
        <line
          x1={PAD_LEFT}
          y1={PAD_TOP + chartHeight}
          x2={WIDTH - PAD_RIGHT}
          y2={PAD_TOP + chartHeight}
          stroke="var(--border)"
          strokeWidth="1"
        />

        {bars.map((bar, i) => (
          <g
            key={gridId + i}
            tabIndex={0}
            className="outline-none"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(i)}
            onBlur={() => setHovered(null)}
          >
            <title>{`${bar.label}: ${formatKES(bar.totalKES)}`}</title>
            {/* hit target spans the full slot, taller than the visible bar */}
            <rect
              x={bar.slotX}
              y={PAD_TOP}
              width={slot}
              height={chartHeight}
              fill="transparent"
              className="cursor-pointer"
            />
            <path
              d={roundedTopRectPath(bar.x, bar.y, barWidth, bar.barHeight, BAR_RADIUS)}
              fill="var(--chart-1)"
              opacity={hovered === null || hovered === i ? 1 : 0.5}
            />
            <text
              x={bar.slotX + slot / 2}
              y={HEIGHT - 6}
              fontSize="9"
              textAnchor="middle"
              fill="var(--muted-foreground)"
            >
              {bar.label}
            </text>
          </g>
        ))}
      </svg>

      {activeBar && (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2.5 py-1.5 text-xs whitespace-nowrap text-popover-foreground shadow-md"
          style={{
            left: `${((activeBar.slotX + slot / 2) / WIDTH) * 100}%`,
            top: `${(activeBar.y / HEIGHT) * 100}%`,
            marginTop: "-6px",
          }}
        >
          <p className="font-semibold">{formatKES(activeBar.totalKES)}</p>
          <p className="text-muted-foreground">Week of {activeBar.label}</p>
        </div>
      )}
    </div>
  );
}
