interface SparklineProps {
  data: number[];
  color?: string;
  fillOpacity?: number;
  strokeWidth?: number;
  height?: number;
}

export function Sparkline({
  data,
  color = "hsl(174 72% 42%)",
  fillOpacity = 0.15,
  strokeWidth = 2,
  height = 40,
}: SparklineProps) {
  if (!data.length) return null;

  const width = 100;
  const padding = 2;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;

  const points = data.map((value, index) => {
    const x =
      padding + (index / (data.length - 1 || 1)) * (width - padding * 2);
    const y =
      height - padding - ((value - min) / range) * (height - padding * 2);
    return [x, y];
  });

  const linePath = points
    .map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");

  const areaPath = `${linePath} L ${width - padding} ${height} L ${padding} ${height} Z`;

  const gradientId = `sparkline-gradient-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-full overflow-visible"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
