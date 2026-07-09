import type { ScoreResult } from "@/lib/types";

type RadarChartProps = {
  scores: ScoreResult["scores"];
  personalityLabel: string;
  personalityOneLiner: string;
  summary: string;
  accentColor?: string;   // default '#E5681A'
  size?: number;          // default 320
  showValues?: boolean;   // default true
  gridStyle?: "circle" | "pentagon";  // default "pentagon"
};

const DIM_ORDER: Array<{ key: keyof ScoreResult["scores"]; label: string }> = [
  { key: "decadeSpread", label: "Decade" },      // top (12 o'clock)
  { key: "genreBalance", label: "Genre" },        // top-right
  { key: "mainstreamScore", label: "Mainstream" },// bottom-right
  { key: "moodSpectrum", label: "Mood" },         // bottom-left
  { key: "discoveryIndex", label: "Discovery" },  // top-left
];

function radarPoints(
  scores: ScoreResult["scores"],
  cx: number,
  cy: number,
  r: number
): string {
  const step = (Math.PI * 2) / DIM_ORDER.length;
  return DIM_ORDER
    .map(({ key }, i) => {
      const ratio = scores[key] / 100;
      const angle = step * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * r * ratio;
      const y = cy + Math.sin(angle) * r * ratio;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

function pentagonPath(cx: number, cy: number, r: number): string {
  const step = (Math.PI * 2) / 5;
  return (
    Array.from({ length: 5 }, (_, i) => {
      const angle = step * i - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
    }).join(" ") + " Z"
  );
}

export default function RadarChart({
  scores,
  personalityLabel,
  personalityOneLiner,
  summary,
  accentColor = "#E5681A",
  size = 320,
  showValues = true,
  gridStyle = "pentagon",
}: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  // r leaves room for labels (text extends ~30px beyond outer vertex).
  const r = size * 0.35;
  const labelR = r + 22;
  const step = (Math.PI * 2) / 5;
  const polygon = radarPoints(scores, cx, cy, r);

  return (
    <div className="flex flex-col items-center gap-6">
      <svg
        viewBox={`0 0 ${size} ${size}`}
        className="w-full max-w-sm"
        aria-label="5-dimension radar chart"
      >
        {/* grid: 4 concentric rings at 0.25/0.5/0.75/1.0 */}
        {[0.25, 0.5, 0.75, 1].map((ratio) => {
          const ringR = r * ratio;
          if (gridStyle === "circle") {
            return (
              <circle
                key={ratio}
                cx={cx}
                cy={cy}
                r={ringR}
                fill="none"
                stroke="currentColor"
                className="text-line"
                strokeWidth="0.5"
              />
            );
          }
          return (
            <path
              key={ratio}
              d={pentagonPath(cx, cy, ringR)}
              fill="none"
              stroke="currentColor"
              className="text-line"
              strokeWidth="0.5"
            />
          );
        })}

        {/* axes: 5 lines from center to outer vertex */}
        {DIM_ORDER.map((_, i) => {
          const angle = step * i - Math.PI / 2;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={x}
              y2={y}
              stroke="currentColor"
              className="text-line"
              strokeWidth="0.5"
            />
          );
        })}

        {/* data polygon: 2 layers — semi-transparent fill + stroke */}
        <polygon points={polygon} fill={accentColor} fillOpacity="0.25" />
        <polygon
          points={polygon}
          fill="none"
          stroke={accentColor}
          strokeWidth="1.5"
        />

        {/* axis labels + values */}
        {DIM_ORDER.map(({ key, label }, i) => {
          const angle = step * i - Math.PI / 2;
          const x = cx + Math.cos(angle) * labelR;
          const y = cy + Math.sin(angle) * labelR;
          return (
            <text
              key={label}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-fgmute"
              style={{ fontSize: "11px" }}
            >
              {showValues ? `${label} ${scores[key]}` : label}
            </text>
          );
        })}
      </svg>

      {/* Personality block below radar, full width */}
      <div className="w-full rounded-lg border border-line bg-bgcard p-5">
        <div className="text-xs uppercase tracking-wide text-accent2">
          Personality
        </div>
        <h2 className="mt-2 text-2xl font-bold text-fg">{personalityLabel}</h2>
        <p className="mt-2 italic text-fgmute">
          &quot;{personalityOneLiner}&quot;
        </p>
        <p className="mt-3 text-sm text-fg">{summary}</p>
      </div>
    </div>
  );
}

// Day 4 temporary showcase for visual verification. Day 5 will delete this export.
export function RadarChartShowcase() {
  return (
    <div className="grid grid-cols-1 gap-8 p-8 md:grid-cols-3">
      <RadarChart
        scores={{
          decadeSpread: 50,
          genreBalance: 50,
          mainstreamScore: 50,
          moodSpectrum: 50,
          discoveryIndex: 50,
        }}
        personalityLabel="The Centerpiece"
        personalityOneLiner="Equidistant from every genre."
        summary="A balanced taste, evenly spread across decades, genres, mainstream, mood, and discovery."
      />
      <RadarChart
        scores={{
          decadeSpread: 30,
          genreBalance: 20,
          mainstreamScore: 90,
          moodSpectrum: 60,
          discoveryIndex: 15,
        }}
        personalityLabel="Mainstream Sunshine"
        personalityOneLiner="You know every hit, and you're proud."
        summary="Drawn to the top 40, with a clear preference for current popular sound."
      />
      <RadarChart
        scores={{
          decadeSpread: 80,
          genreBalance: 90,
          mainstreamScore: 15,
          moodSpectrum: 40,
          discoveryIndex: 95,
        }}
        personalityLabel="Late Night Explorer"
        personalityOneLiner="You live in 2014 and cry to synthesizers."
        summary="A nostalgic soul with eclectic taste, drawn to melancholic indie that's quietly underground."
      />
    </div>
  );
}
