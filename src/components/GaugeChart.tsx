interface GaugeChartProps {
  active: number;
  inactive: number;
  label: string;
}

export default function GaugeChart({ active, inactive, label }: GaugeChartProps) {
  const total = active + inactive;
  const percentage = total > 0 ? Math.round((active / total) * 100) : 0;

  // SVG config
  const cx = 150;
  const cy = 130;
  const radius = 100;
  const strokeWidth = 12;
  const segments = 60; // number of bars
  const gap = 2; // gap between bars in degrees
  const arcDegrees = 270; // 3/4 circle
  const startAngle = 135; // start from bottom-left

  // Generate bars
  const bars = [];
  const activeSegments = Math.round((percentage / 100) * segments);

  for (let i = 0; i < segments; i++) {
    const angle = startAngle + (arcDegrees / segments) * i;
    const rad = (angle * Math.PI) / 180;
    const radEnd = ((angle + (arcDegrees / segments) - gap) * Math.PI) / 180;

    const x1 = cx + (radius - strokeWidth / 2) * Math.cos(rad);
    const y1 = cy + (radius - strokeWidth / 2) * Math.sin(rad);
    const x2 = cx + (radius + strokeWidth / 2) * Math.cos(rad);
    const y2 = cy + (radius + strokeWidth / 2) * Math.sin(rad);

    const x3 = cx + (radius + strokeWidth / 2) * Math.cos(radEnd);
    const y3 = cy + (radius + strokeWidth / 2) * Math.sin(radEnd);
    const x4 = cx + (radius - strokeWidth / 2) * Math.cos(radEnd);
    const y4 = cy + (radius - strokeWidth / 2) * Math.sin(radEnd);

    const isActive = i < activeSegments;
    const color = isActive
      ? `hsl(${210 + (i / segments) * 40}, 70%, ${50 + (i / segments) * 15}%)`
      : "rgba(255,255,255,0.08)";

    bars.push(
      <polygon
        key={i}
        points={`${x1},${y1} ${x2},${y2} ${x3},${y3} ${x4},${y4}`}
        fill={color}
        rx={2}
        ry={2}
      />
    );
  }

  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 300 200" className="w-full max-w-[280px]">
        {bars}
        {/* Center text */}
        <text x={cx} y={cy - 5} textAnchor="middle" fill="white" fontSize="28" fontWeight="bold">
          {percentage}%
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="12">
          {label}
        </text>
      </svg>

      {/* Legend */}
      <div className="flex items-center gap-8 mt-2">
        <div className="text-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-blue-400" />
            <span className="text-white/60 text-xs">Ativos</span>
          </div>
          <p className="text-white text-xl font-bold">{active.toLocaleString("pt-PT")}</p>
          <p className="text-white/40 text-[10px]">Total</p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full bg-pink-400" />
            <span className="text-white/60 text-xs">Não Ativos</span>
          </div>
          <p className="text-white text-xl font-bold">{inactive.toLocaleString("pt-PT")}</p>
          <p className="text-white/40 text-[10px]">Total</p>
        </div>
      </div>
    </div>
  );
}
