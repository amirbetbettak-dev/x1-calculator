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

  const targetText = state.liveResult ?? state.display;
  const len = targetText.length;
  const sizeClass = len > 11 ? "text-3xl sm:text-4xl" : len > 8 ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl";

  return (
    <main className="bg-sky relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 select-none">
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

        {/* Enlarged Calculation Display with Live Instant Preview */}
        <div className="ice-screen mb-5 flex min-h-[10.5rem] sm:min-h-[11.5rem] flex-col items-end justify-between overflow-hidden rounded-3xl px-5 py-4">
          <div className="w-full text-right text-sm sm:text-base font-medium text-muted-foreground/90 truncate tracking-wide" aria-live="polite">
            {activeExpression || " "}
          </div>

          <div className="flex w-full flex-col items-end justify-end gap-1">
            {state.liveResult && (
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold uppercase tracking-wider text-muted-foreground/75">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                <span>محاسبه لحظه‌ای</span>
              </div>
            )}
            <div
              key={pulse}
              className={`display-pop w-full truncate text-right font-light tabular-nums transition-all ${
                state.liveResult
                  ? "text-primary font-semibold drop-shadow-[0_0_16px_rgba(100,180,255,0.45)]"
                  : "text-foreground"
              } ${sizeClass}`}
              aria-live="polite"
              data-testid="display"
            >
              {state.liveResult ? `= ${state.liveResult}` : state.display}
            </div>
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
      </section>
    </main>
  );
}
