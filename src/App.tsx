import React, { useCallback, useEffect, useReducer, useState } from "react";
import { Delete, Snowflake } from "lucide-react";

import { IceKey } from "@/components/IceKey";
import { Snowfall } from "@/components/Snowfall";
import { calcReducer, initialState, type CalcAction, type Op } from "@/lib/calculator";

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

  const len = state.display.length;
  const sizeClass = len > 11 ? "text-4xl" : len > 8 ? "text-5xl" : "text-6xl";

  return (
    <main className="bg-sky relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div aria-hidden className="float-blob absolute -left-24 -top-24 h-80 w-80 rounded-full bg-glacier/60 blur-3xl" />
      <div
        aria-hidden
        className="float-blob absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-primary/30 blur-3xl"
        style={{ animationDelay: "-6s" }}
      />
      <Snowfall />

      <section className="ice-shell relative z-10 w-full max-w-sm rounded-[2.25rem] p-5 sm:p-6">
        <header className="mb-4 flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Snowflake className="h-5 w-5 text-primary" strokeWidth={1.75} />
            <h1 className="font-display text-xl font-semibold tracking-tight text-foreground">x1</h1>
          </div>
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">frost</span>
        </header>

        <div className="ice-screen mb-5 flex h-36 flex-col items-end justify-end overflow-hidden rounded-3xl px-5 py-4">
          <div className="h-6 truncate text-sm text-muted-foreground" aria-live="polite">
            {state.expression}
          </div>
          <div
            key={pulse}
            className={`display-pop w-full truncate text-right font-light tabular-nums text-foreground ${sizeClass}`}
            aria-live="polite"
            data-testid="display"
          >
            {state.display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
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
          className="mx-auto mt-4 flex items-center gap-1.5 rounded-full px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          <Delete className="h-3.5 w-3.5" /> delete
        </button>
      </section>
    </main>
  );
}
