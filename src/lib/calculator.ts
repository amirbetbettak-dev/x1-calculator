export type Op = "+" | "-" | "×" | "÷";

export interface CalcState {
  display: string;
  prev: number | null;
  op: Op | null;
  waiting: boolean;
  expression: string;
  liveResult: string | null;
}

export type CalcAction =
  | { type: "digit"; value: string }
  | { type: "dot" }
  | { type: "op"; value: Op }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "sign" }
  | { type: "percent" }
  | { type: "backspace" };

export const initialState: CalcState = {
  display: "0",
  prev: null,
  op: null,
  waiting: false,
  expression: "",
  liveResult: null,
};

export function compute(a: number, b: number, op: Op): number {
  switch (op) {
    case "+":
      return a + b;
    case "-":
      return a - b;
    case "×":
      return a * b;
    case "÷":
      return b === 0 ? NaN : a / b;
  }
}

export function format(n: number): string {
  if (!Number.isFinite(n)) return "Error";
  const rounded = parseFloat(n.toPrecision(12));
  const s = String(rounded);
  return s.length > 14 ? rounded.toExponential(6) : s;
}

function updateLiveResult(state: CalcState): CalcState {
  if (state.op !== null && state.prev !== null && !state.waiting) {
    const current = parseFloat(state.display);
    if (!isNaN(current)) {
      const res = compute(state.prev, current, state.op);
      const formatted = format(res);
      return {
        ...state,
        liveResult: formatted === "Error" ? null : formatted,
      };
    }
  }
  return { ...state, liveResult: null };
}

export function calcReducer(state: CalcState, action: CalcAction): CalcState {
  const isError = state.display === "Error";
  switch (action.type) {
    case "clear":
      return initialState;

    case "digit": {
      let nextDisplay: string;
      if (isError || state.waiting) {
        nextDisplay = action.value;
      } else {
        if (state.display.replace(/[-.]/g, "").length >= 14) return state;
        nextDisplay = state.display === "0" ? action.value : state.display + action.value;
      }
      return updateLiveResult({
        ...state,
        display: nextDisplay,
        waiting: false,
      });
    }

    case "dot": {
      if (isError || state.waiting) {
        return updateLiveResult({ ...state, display: "0.", waiting: false });
      }
      if (state.display.includes(".")) return state;
      return updateLiveResult({ ...state, display: state.display + "." });
    }

    case "backspace": {
      if (isError || state.waiting) return state;
      const next = state.display.slice(0, -1);
      const nextDisplay = next === "" || next === "-" ? "0" : next;
      return updateLiveResult({ ...state, display: nextDisplay });
    }

    case "sign": {
      if (isError || state.display === "0") return state;
      const nextDisplay = state.display.startsWith("-")
        ? state.display.slice(1)
        : "-" + state.display;
      return updateLiveResult({ ...state, display: nextDisplay });
    }

    case "percent": {
      if (isError) return state;
      const nextDisplay = format(parseFloat(state.display) / 100);
      return updateLiveResult({ ...state, display: nextDisplay });
    }

    case "op": {
      if (isError) return state;
      const current = parseFloat(state.display);
      if (state.op && state.prev !== null && !state.waiting) {
        const result = compute(state.prev, current, state.op);
        const display = format(result);
        if (display === "Error") return { ...initialState, display };
        return {
          display,
          prev: result,
          op: action.value,
          waiting: true,
          expression: `${display} ${action.value}`,
          liveResult: null,
        };
      }
      return {
        ...state,
        prev: current,
        op: action.value,
        waiting: true,
        expression: `${format(current)} ${action.value}`,
        liveResult: null,
      };
    }

    case "equals": {
      if (isError || state.op === null || state.prev === null) return state;
      const current = parseFloat(state.display);
      const result = compute(state.prev, current, state.op);
      const display = format(result);
      return {
        display,
        prev: null,
        op: null,
        waiting: true,
        expression: display === "Error" ? "" : `${format(state.prev)} ${state.op} ${format(current)} =`,
        liveResult: null,
      };
    }
  }
}
