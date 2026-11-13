export type Op = "+" | "-" | "×" | "÷";

export interface CalcHistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

export interface CalcState {
  display: string;
  prev: number | null;
  op: Op | null;
  waiting: boolean;
  chain: { value: number; op: Op }[];
  expression: string;
  liveResult: string | null;
  history: CalcHistoryItem[];
}

export type CalcAction =
  | { type: "digit"; value: string }
  | { type: "dot" }
  | { type: "op"; value: Op }
  | { type: "equals" }
  | { type: "clear" }
  | { type: "sign" }
  | { type: "percent" }
  | { type: "backspace" }
  | { type: "clearHistory" }
  | { type: "restoreHistory"; expression: string; result: string }
  | { type: "setHistory"; history: CalcHistoryItem[] };

export const initialState: CalcState = {
  display: "0",
  prev: null,
  op: null,
  waiting: false,
  chain: [],
  expression: "",
  liveResult: null,
  history: [],
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

function buildExpressionString(chain: { value: number; op: Op }[], currentOp: Op | null, currentDisplay: string | null, waiting: boolean): string {
  const parts: string[] = [];
  for (const item of chain) {
    parts.push(format(item.value));
    parts.push(item.op);
  }
  if (!waiting && currentDisplay !== null && currentDisplay !== undefined) {
    parts.push(currentDisplay);
  }
  return parts.join(" ");
}

export function calcReducer(state: CalcState, action: CalcAction): CalcState {
  const isError = state.display === "Error";

  switch (action.type) {
    case "clear":
      return {
        ...initialState,
        history: state.history,
      };

    case "setHistory":
      return {
        ...state,
        history: action.history,
      };

    case "clearHistory":
      return {
        ...state,
        history: [],
      };

    case "restoreHistory":
      return {
        ...state,
        display: action.result,
        prev: null,
        op: null,
        waiting: true,
        chain: [],
        expression: action.expression,
        liveResult: null,
      };

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
      if (isError) return state;
      if (state.waiting) {
        return state;
      }
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

      // If waiting after pressing an operator and tapped another operator: change operator
      if (state.waiting && state.op !== null) {
        const nextChain = [...state.chain];
        if (nextChain.length > 0) {
          nextChain[nextChain.length - 1] = {
            ...nextChain[nextChain.length - 1],
            op: action.value,
          };
        }
        return {
          ...state,
          op: action.value,
          chain: nextChain,
          expression: buildExpressionString(nextChain, action.value, null, true),
        };
      }

      // If continuing an active calculation chain
      if (state.op && state.prev !== null) {
        const result = compute(state.prev, current, state.op);
        const formattedResult = format(result);
        if (formattedResult === "Error") {
          return { ...initialState, display: "Error", history: state.history };
        }

        const nextChain = [...state.chain, { value: current, op: action.value }];
        return {
          display: formattedResult,
          prev: result,
          op: action.value,
          waiting: true,
          chain: nextChain,
          expression: buildExpressionString(nextChain, action.value, null, true),
          liveResult: null,
          history: state.history,
        };
      }

      // First operator in a fresh calculation
      const nextChain = [{ value: current, op: action.value }];
      return {
        ...state,
        prev: current,
        op: action.value,
        waiting: true,
        chain: nextChain,
        expression: buildExpressionString(nextChain, action.value, null, true),
        liveResult: null,
      };
    }

    case "equals": {
      if (isError || state.op === null || state.prev === null) return state;
      const current = parseFloat(state.display);
      const result = compute(state.prev, current, state.op);
      const formattedResult = format(result);

      const fullChainTokens = [...state.chain];
      let fullExpr = "";
      for (const item of fullChainTokens) {
        fullExpr += `${format(item.value)} ${item.op} `;
      }
      fullExpr += `${format(current)} =`;

      const newHistoryItem: CalcHistoryItem = {
        id: `hist_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        expression: fullExpr,
        result: formattedResult,
        timestamp: Date.now(),
      };

      const updatedHistory = [newHistoryItem, ...state.history].slice(0, 60);
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("x1_calc_history", JSON.stringify(updatedHistory));
        }
      } catch {}

      return {
        display: formattedResult,
        prev: null,
        op: null,
        waiting: true,
        chain: [],
        expression: fullExpr,
        liveResult: null,
        history: updatedHistory,
      };
    }
  }
}
