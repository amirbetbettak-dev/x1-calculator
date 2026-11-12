import { useEffect, useState } from "react";

interface Flake {
  left: number;
  size: number;
  duration: number;
  delay: number;
  drift: number;
  opacity: number;
}

export function Snowfall({ count = 36 }: { count?: number }) {
  const [flakes, setFlakes] = useState<Flake[]>([]);

  useEffect(() => {
    setFlakes(
      Array.from({ length: count }, () => ({
        left: Math.random() * 100,
        size: 2 + Math.random() * 5,
        duration: 10 + Math.random() * 14,
        delay: -Math.random() * 20,
        drift: -40 + Math.random() * 80,
        opacity: 0.4 + Math.random() * 0.6,
      })),
    );
  }, [count]);

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {flakes.map((f, i) => (
        <span
          key={i}
          className="snowflake"
          style={
            {
              left: `${f.left}%`,
              width: f.size,
              height: f.size,
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
