import React from "react";

export function SnowCap({ className = "" }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute -top-3 left-4 right-4 z-20 overflow-visible select-none ${className}`}
    >
      <svg
        viewBox="0 0 360 28"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full drop-shadow-[0_2px_4px_rgba(160,210,255,0.45)]"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="snowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.98" />
            <stop offset="60%" stopColor="#f0f7ff" stopOpacity="0.94" />
            <stop offset="100%" stopColor="#d8edff" stopOpacity="0.85" />
          </linearGradient>
          <linearGradient id="iceShine" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Soft, pillowy snow bank path */}
        <path
          d="M 0 16 
             Q 18 6, 36 12 
             T 75 10 
             Q 95 4, 120 12 
             T 165 9 
             Q 190 3, 215 11 
             T 260 8 
             Q 285 4, 310 12 
             T 360 14 
             L 360 22 
             Q 340 20, 310 21 
             T 250 20 
             Q 210 22, 170 20 
             T 90 21 
             Q 45 22, 0 20 Z"
          fill="url(#snowGrad)"
        />

        {/* Melting ice droplet 1 */}
        <path
          d="M 85 20 Q 86 26, 88 26 Q 90 26, 91 20 Z"
          fill="#e0f2fe"
          className="melt-drip"
        />

        {/* Melting ice droplet 2 */}
        <path
          d="M 235 19 Q 236 27, 238 27 Q 240 27, 241 19 Z"
          fill="#e0f2fe"
          className="melt-drip"
          style={{ animationDelay: "-2.4s" }}
        />

        {/* Melting ice droplet 3 */}
        <path
          d="M 305 20 Q 306 25, 308 25 Q 310 25, 311 20 Z"
          fill="#e0f2fe"
          className="melt-drip"
          style={{ animationDelay: "-4.1s" }}
        />

        {/* Crisp snow highlights */}
        <circle cx="48" cy="10" r="1.5" fill="#ffffff" className="glimmer" />
        <circle cx="140" cy="8" r="1.8" fill="#ffffff" className="glimmer" style={{ animationDelay: "-1.5s" }} />
        <circle cx="205" cy="7" r="1.5" fill="#ffffff" className="glimmer" style={{ animationDelay: "-3s" }} />
        <circle cx="280" cy="9" r="1.6" fill="#ffffff" className="glimmer" style={{ animationDelay: "-2s" }} />
      </svg>
    </div>
  );
}
