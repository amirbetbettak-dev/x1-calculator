import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Delete, Clock, Settings } from "lucide-react";

import { IceKey } from "@/components/IceKey";
import { Snowfall } from "@/components/Snowfall";
import { SnowCap } from "@/components/SnowCap";
import { SummerParticles } from "@/components/SummerParticles";
import { SettingsModal } from "@/components/SettingsModal";
import { HistoryModal } from "@/components/HistoryModal";
import {
  calcReducer,
  format,
  initialState,
  type CalcAction,
  type CalcHistoryItem,
  type Op,
} from "@/lib/calculator";

type Key = {
  label: React.ReactNode;
  action: CalcAction;
  variant?: "num" | "op" | "eq" | "fn";
  aria?: string;
};

const keys: Key[] = [
  // Row 1
  { label: "AC", action: { type: "clear" }, variant: "fn", aria: "Clear all" },
  {
    label: <Delete className="w-5 h-5 sm:w-6 sm:h-6" />,
    action: { type: "backspace" },
    variant: "fn",
    aria: "Backspace",
  },
  { label: "%", action: { type: "percent" }, variant: "fn", aria: "Percent" },
  { label: "÷", action: { type: "op", value: "÷" }, variant: "op", aria: "Divide" },

  // Row 2
  { label: "7", action: { type: "digit", value: "7" } },
  { label: "8", action: { type: "digit", value: "8" } },
  { label: "9", action: { type: "digit", value: "9" } },
  { label: "×", action: { type: "op", value: "×" }, variant: "op", aria: "Multiply" },

  // Row 3
  { label: "4", action: { type: "digit", value: "4" } },
  { label: "5", action: { type: "digit", value: "5" } },
  { label: "6", action: { type: "digit", value: "6" } },
  { label: "−", action: { type: "op", value: "-" }, variant: "op", aria: "Subtract" },

  // Row 4
  { label: "1", action: { type: "digit", value: "1" } },
  { label: "2", action: { type: "digit", value: "2" } },
  { label: "3", action: { type: "digit", value: "3" } },
  { label: "+", action: { type: "op", value: "+" }, variant: "op", aria: "Add" },

  // Row 5
  { label: "±", action: { type: "sign" }, variant: "fn", aria: "Toggle sign" },
  { label: "0", action: { type: "digit", value: "0" } },
  { label: ".", action: { type: "dot" }, aria: "Decimal point" },
  { label: "=", action: { type: "equals" }, variant: "eq", aria: "Equals" },
];

const keyMap: Record<string, CalcAction> = {
  "+": { type: "op", value: "+" },
  "-": { type: "op", value: "-" },
  "*": { type: "op", value: "×" },
  x: { type: "op", value: "×" },
  "/": { type: "op", value: "÷" },
  Enter: { type: "equals" },
  "=": { type: "equals" },
  ".": { type: "dot" },
  ",": { type: "dot" },
  "%": { type: "percent" },
  Escape: { type: "clear" },
  Backspace: { type: "backspace" },
};

function formatDisplayNumber(val: string): string {
  if (!val || val === "Error" || val.includes("e") || val.includes("E")) {
    return val;
  }
  const isNegative = val.startsWith("-");
  const unsigned = isNegative ? val.slice(1) : val;
  const [intPart, decPart] = unsigned.split(".", 2);
  let formattedInt = intPart;
  try {
    formattedInt = intPart ? Number(intPart).toLocaleString("en-US") : "0";
  } catch {
    formattedInt = intPart;
  }
  const prefix = isNegative ? "-" : "";
  if (decPart !== undefined) {
    return `${prefix}${formattedInt}.${decPart}`;
  }
  return `${prefix}${formattedInt}`;
}

function getDisplayFontSize(text: string): string {
  const len = text.replace(/,/g, "").length;
  if (len <= 7) return "text-3xl sm:text-4xl";
  if (len <= 10) return "text-2xl sm:text-3xl";
  if (len <= 13) return "text-xl sm:text-2xl";
  if (len <= 16) return "text-lg sm:text-xl";
  return "text-base sm:text-lg";
}

function formatFormula(expr: string): string {
  if (!expr) return "";
  return expr
    .split(" ")
    .map((token) => (/^-?\d+(\.\d+)?$/.test(token) ? formatDisplayNumber(token) : token))
    .join(" ");
}

export default function App() {
  const [state, dispatch] = useReducer(calcReducer, initialState, (base) => {
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem("x1_calc_history");
        const history = raw ? JSON.parse(raw) : [];
        return { ...base, history: Array.isArray(history) ? history : [] };
      }
    } catch {}
    return base;
  });
  const [pulse, setPulse] = useState(0);

  // Theme & Preferences
  const [season, setSeason] = useState<"winter" | "summer">("winter");
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [particlesEnabled, setParticlesEnabled] = useState(true);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Load saved preferences & history on mount
  useEffect(() => {
    try {
      if (typeof localStorage !== "undefined") {
        const savedSeason = localStorage.getItem("x1_season");
        if (savedSeason === "summer" || savedSeason === "winter") {
          setSeason(savedSeason);
        }
        const savedHaptic = localStorage.getItem("x1_haptic");
        if (savedHaptic !== null) {
          setHapticEnabled(savedHaptic === "true");
        }
        const savedParticles = localStorage.getItem("x1_particles");
        if (savedParticles !== null) {
          setParticlesEnabled(savedParticles === "true");
        }
      }
    } catch {}
  }, []);

  const handleSelectSeason = (s: "winter" | "summer") => {
    setSeason(s);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("x1_season", s);
      }
    } catch {}
  };

  const handleToggleHaptic = () => {
    setHapticEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("x1_haptic", String(next));
      } catch {}
      return next;
    });
  };

  const handleToggleParticles = () => {
    setParticlesEnabled((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("x1_particles", String(next));
      } catch {}
      return next;
    });
  };

  const press = useCallback((a: CalcAction) => {
    dispatch(a);
    setPulse((p) => p + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[0-9]$/.test(e.key)) return press({ type: "digit", value: e.key });
      const a = keyMap[e.key];
      if (a) {
        e.preventDefault();
        press(a);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [press]);

  // Build active ongoing continuous calculation formula string
  let activeExpression = "";
  if (state.chain.length > 0) {
    const parts = state.chain.map((c) => `${formatDisplayNumber(format(c.value))} ${c.op}`);
    if (!state.waiting) {
      parts.push(formatDisplayNumber(state.display));
    }
    activeExpression = parts.join(" ");
  } else if (state.expression) {
    activeExpression = formatFormula(state.expression);
  }

  return (
    <main
      data-season={season}
      className="bg-sky relative flex min-h-screen items-center justify-center overflow-hidden px-3.5 py-4 select-none"
    >
      {/* Background Ambience Blobs */}
      <div
        aria-hidden
        className="float-blob absolute -left-20 -top-20 h-80 w-80 rounded-full blur-3xl opacity-70"
        style={{
          background:
            season === "winter"
              ? "radial-gradient(circle, oklch(0.86 0.07 215 / 80%), transparent 70%)"
              : "radial-gradient(circle, oklch(0.92 0.12 75 / 80%), transparent 70%)",
        }}
      />
      <div
        aria-hidden
        className="float-blob absolute -bottom-28 -right-16 h-96 w-96 rounded-full blur-3xl opacity-60"
        style={{
          animationDelay: "-6s",
          background:
            season === "winter"
              ? "radial-gradient(circle, oklch(0.68 0.13 230 / 60%), transparent 70%)"
              : "radial-gradient(circle, oklch(0.82 0.18 55 / 60%), transparent 70%)",
        }}
      />

      {/* Weather Particles */}
      {particlesEnabled && (season === "winter" ? <Snowfall /> : <SummerParticles />)}

      <section className="ice-shell relative z-10 w-full max-w-[23.5rem] sm:max-w-md rounded-[2.5rem] p-4 sm:p-6 shadow-2xl">
        {/* Realistic Snowcap resting on top rim (Winter Only) */}
        {season === "winter" && <SnowCap />}

        {/* Top Header Bar */}
        <header className="mb-3 flex items-center justify-between px-1">
          {/* Logo & Name */}
          <div className="flex items-center gap-2.5">
            <img
              src="/icon.png"
              alt="X1"
              className="h-9 w-9 sm:h-10 sm:w-10 rounded-2xl object-cover shadow-md ring-2 ring-white/80"
            />
            <div className="flex flex-col">
              <span className="font-display text-xl sm:text-2xl font-bold tracking-wider text-foreground leading-tight">
                X1
              </span>
              <span className="text-[10px] text-muted-foreground font-medium">
                {season === "winter" ? "نسخه زمستانی ❄️" : "نسخه تابستانی ☀️"}
              </span>
            </div>
          </div>

          {/* Quick Header Actions: History & Settings */}
          <div className="flex items-center gap-1.5">
            {/* History Button */}
            <button
              type="button"
              onClick={() => setIsHistoryOpen(true)}
              aria-label="تاریخچه محاسبات"
              className="relative p-2 rounded-2xl bg-white/40 hover:bg-white/60 text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              {state.history.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold text-white shadow">
                  {state.history.length > 9 ? "+9" : state.history.length}
                </span>
              )}
            </button>

            {/* Settings Button */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              aria-label="تنظیمات"
              className="p-2 rounded-2xl bg-white/40 hover:bg-white/60 text-muted-foreground hover:text-foreground transition-all shadow-sm active:scale-95 cursor-pointer"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* Spacious Continuous Accounting & Calculation Display */}
        <div className="ice-screen mb-3.5 flex min-h-[11.5rem] sm:min-h-[12.5rem] flex-col justify-between overflow-hidden rounded-3xl p-3.5 sm:p-5 shadow-inner">
          {/* Top Line: Full Accounting Formula Chain (e.g. 200,000,000 - 2,000,000 - 30,000,000) */}
          <div className="flex items-center justify-between gap-2 border-b border-white/15 pb-1.5">
            <span className="text-[10px] text-muted-foreground/70 font-medium select-none">
              زنجیره محاسبات
            </span>
            <div
              className="w-full text-right text-xs sm:text-sm font-normal text-muted-foreground/85 overflow-x-auto whitespace-nowrap scrollbar-none tracking-wide"
              dir="ltr"
              aria-live="polite"
            >
              {activeExpression || " "}
            </div>
          </div>

          {/* Center Main Line: Current Active Number */}
          <div className="my-auto w-full overflow-x-auto whitespace-nowrap scrollbar-none py-1">
            <div
              key={pulse}
              className={`display-pop w-full text-right font-light tracking-tight tabular-nums transition-all text-foreground ${getDisplayFontSize(
                state.display
              )}`}
              dir="ltr"
              aria-live="polite"
              data-testid="display"
            >
              {formatDisplayNumber(state.display)}
            </div>
          </div>

          {/* Bottom Line: Instant Live Calculation Preview */}
          <div className="min-h-[1.75rem] flex items-center justify-between w-full pt-1.5 border-t border-white/20">
            {state.liveResult ? (
              <>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-primary select-none">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  محاسبه لحظه‌ای
                </span>
                <span
                  className="text-base sm:text-lg font-bold text-primary tabular-nums overflow-x-auto whitespace-nowrap scrollbar-none"
                  dir="ltr"
                >
                  = {formatDisplayNumber(state.liveResult)}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-muted-foreground/50 italic select-none">
                {state.op ? "در حال ورود رقم بعدی..." : "آماده محاسبه"}
              </span>
            )}
          </div>
        </div>

        {/* Compact 4x5 Keypad Grid (Including Backspace right in the grid) */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5">
          {keys.map((k, i) => (
            <IceKey
              key={i}
              label={k.aria}
              variant={k.variant}
              onPress={() => press(k.action)}
              hapticEnabled={hapticEnabled}
              active={
                k.action.type === "op" &&
                state.waiting &&
                state.op === (k.action as { value: Op }).value
              }
            >
              {k.label}
            </IceKey>
          ))}
        </div>

        {/* Subtle Creator Credit in Corner */}
        <footer className="mt-3 flex items-center justify-between px-2 text-[11px] text-muted-foreground/50 tracking-wide select-none">
          <span>سازنده: غلامی</span>
          <span className="text-[10px] opacity-60">X1 v1.2</span>
        </footer>
      </section>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={state.history}
        season={season}
        onClear={() => {
          dispatch({ type: "clearHistory" });
          try {
            localStorage.removeItem("x1_calc_history");
          } catch {}
        }}
        onSelect={(item: CalcHistoryItem) => {
          dispatch({
            type: "restoreHistory",
            expression: item.expression,
            result: item.result,
          });
        }}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        season={season}
        onSelectSeason={handleSelectSeason}
        hapticEnabled={hapticEnabled}
        onToggleHaptic={handleToggleHaptic}
        particlesEnabled={particlesEnabled}
        onToggleParticles={handleToggleParticles}
      />
    </main>
  );
}
