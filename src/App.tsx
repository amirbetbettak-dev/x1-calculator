import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Delete } from "lucide-react";

import { IceKey } from "@/components/IceKey";
import { Snowfall } from "@/components/Snowfall";
import { calcReducer, format, initialState, type CalcAction, type Op } from "@/lib/calculator";

type Key = {
  label: React.ReactNode;
  action: CalcAction;
  variant?: "num" | "op" | "eq" | "fn";
  aria?: string;
  wide?: boolean;
};

const keys: Key[] = [
  { label: "AC", action: { type: "clear" }, variant: "fn", aria: "Clear" },
  { label: "±", action: { type: "sign" }, variant: "fn", aria: "Toggle sign" },
  { label: "%", action: { type: "percent" }, variant: "fn", aria: "Percent" },
  { label: "÷", action: { type: "op", value: "÷" }, variant: "op", aria: "Divide" },
  { label: "7", action: { type: "digit", value: "7" } },
  { label: "8", action: { type: "digit", value: "8" } },
  { label: "9", action: { type: "digit", value: "9" } },
  { label: "×", action: { type: "op", value: "×" }, variant: "op", aria: "Multiply" },
  { label: "4", action: { type: "digit", value: "4" } },
  { label: "5", action: { type: "digit", value: "5" } },
  { label: "6", action: { type: "digit", value: "6" } },
  { label: "−", action: { type: "op", value: "-" }, variant: "op", aria: "Subtract" },
  { label: "1", action: { type: "digit", value: "1" } },
  { label: "2", action: { type: "digit", value: "2" } },
  { label: "3", action: { type: "digit", value: "3" } },
  { label: "+", action: { type: "op", value: "+" }, variant: "op", aria: "Add" },
  { label: "0", action: { type: "digit", value: "0" }, wide: true },
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
    if (intPart) {
      formattedInt = Number(intPart).toLocaleString("en-US");
    } else {
      formattedInt = "0";
    }
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
  if (len <= 6) return "text-3xl sm:text-4xl";
  if (len <= 9) return "text-2xl sm:text-3xl";
  if (len <= 12) return "text-xl sm:text-2xl";
  if (len <= 15) return "text-lg sm:text-xl";
  return "text-base sm:text-lg";
}

function formatExpression(expr: string): string {
  if (!expr) return "";
  return expr
    .split(" ")
    .map((token) => (/^-?\d+(\.\d+)?$/.test(token) ? formatDisplayNumber(token) : token))
    .join(" ");
}

export default function App() {
  const [state, dispatch] = useReducer(calcReducer, initialState);
  const [pulse, setPulse] = useState(0);

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

  // Determine active expression string
  const activeExpression =
    state.op !== null && state.prev !== null
      ? state.waiting
        ? `${format(state.prev)} ${state.op}`
        : `${format(state.prev)} ${state.op} ${state.display}`
      : state.expression;

  return (
    <main className="bg-sky relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-6 select-none">
      <div aria-hidden className="float-blob absolute -left-24 -top-24 h-80 w-80 rounded-full bg-glacier/60 blur-3xl" />
      <div
        aria-hidden
        className="float-blob absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <Snowfall />

      <section className="ice-shell relative z-10 w-full max-w-sm sm:max-w-md rounded-[2.5rem] p-5 sm:p-7 shadow-2xl">
        <header className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-3">
            <img
              src="/icon.png"
              alt="X1"
              className="h-10 w-10 rounded-2xl object-cover shadow-md ring-2 ring-white/70"
            />
            <h1 className="font-display text-2xl font-bold tracking-wider text-foreground">X1</h1>
          </div>
        </header>

        {/* Enlarged Calculation Display with Balanced Responsive Sizing */}
        <div className="ice-screen mb-5 flex min-h-[11.5rem] sm:min-h-[12.5rem] flex-col justify-between overflow-hidden rounded-3xl p-4 sm:p-5 shadow-inner">
          {/* Top Row: Full Formula / Calculation Expression */}
          <div
            className="w-full text-right text-sm sm:text-base font-normal text-muted-foreground/80 overflow-x-auto whitespace-nowrap scrollbar-none tracking-wide"
            dir="ltr"
            aria-live="polite"
          >
            {activeExpression ? formatExpression(activeExpression) : " "}
          </div>

          {/* Center Row: Current Number (Responsive Sizing, No Truncation) */}
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

          {/* Bottom Row: Instant Calculation Live Result */}
          <div className="min-h-[1.75rem] flex items-center justify-between w-full pt-1.5 border-t border-white/20">
            {state.liveResult ? (
              <>
                <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-primary/80 select-none">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  محاسبه لحظه‌ای
                </span>
                <span
                  className="text-base sm:text-lg font-semibold text-primary drop-shadow-[0_0_12px_rgba(100,180,255,0.45)] tabular-nums overflow-x-auto whitespace-nowrap scrollbar-none"
                  dir="ltr"
                >
                  = {formatDisplayNumber(state.liveResult)}
                </span>
              </>
            ) : (
              <span className="text-[11px] text-muted-foreground/40 italic select-none">
                {state.op ? "در حال ورود رقم بعدی..." : "آماده محاسبه"}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:gap-3.5">
          {keys.map((k, i) => (
            <IceKey
              key={i}
              label={k.aria}
              variant={k.variant}
              onPress={() => press(k.action)}
              className={k.wide ? "col-span-2" : undefined}
              active={k.action.type === "op" && state.waiting && state.op === (k.action as { value: Op }).value}
            >
              {k.label}
            </IceKey>
          ))}
        </div>

        <button
          type="button"
          onClick={() => press({ type: "backspace" })}
          aria-label="Delete last digit"
          className="mx-auto mt-4 flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs sm:text-sm font-medium text-muted-foreground transition-all hover:text-foreground active:scale-95 touch-manipulation cursor-pointer"
        >
          <Delete className="h-4 w-4" /> پاک کردن رقم آخر
        </button>

        {/* Subtle Creator Credit in Corner */}
        <footer className="mt-3 flex items-center justify-between px-3 text-[11px] text-muted-foreground/50 tracking-wide select-none">
          <span>سازنده: غلامی</span>
          <span className="text-[10px] opacity-60">X1 v1.1</span>
        </footer>
      </section>
    </main>
  );
}
