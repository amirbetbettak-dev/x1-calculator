import { useEffect, useState } from "react";

interface Flake {
  id: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
  layer: "far" | "mid" | "near";
}

export function Snowfall({ count = 42 }: { count?: number }) {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    const list: Flake[] = [];
    for (let i = 0; i < count; i++) {
      const layerType = i % 5 === 0 ? "near" : i % 2 === 0 ? "mid" : "far";
      const size =
        layerType === "near"
          ? 6 + Math.random() * 4
          : layerType === "mid"
          ? 3 + Math.random() * 3
          : 1.5 + Math.random() * 2;

      const duration =
        layerType === "near"
          ? 7 + Math.random() * 6
          : layerType === "mid"
          ? 11 + Math.random() * 8
          : 16 + Math.random() * 10;

      list.push({
        id: i,
        left: Math.random() * 100,
        size,
        duration,
        delay: -Math.random() * 25,
        drift: -50 + Math.random() * 100,
        opacity:
          layerType === "near"
            ? 0.75 + Math.random() * 0.25
            : layerType === "mid"
            ? 0.5 + Math.random() * 0.4
            : 0.3 + Math.random() * 0.3,
        layer: layerType,
      });
    }
    setFlakes(list);
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {flakes.map((f) => (
        <span
          key={f.id}
          className={`snowflake ${f.layer === "near" ? "snowflake-near" : f.layer === "far" ? "snowflake-far" : ""}`}
          style={
            {
              left: `${f.left}%`,
              width: `${f.size}px`,
              height: `${f.size}px`,
              opacity: f.opacity,
              animationDuration: `${f.duration}s`,
              animationDelay: `${f.delay}s`,
              "--drift": `${f.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
