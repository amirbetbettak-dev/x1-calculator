import React from "react";
import { Clock, Trash2, X, ArrowDownRight, Calculator } from "lucide-react";
import type { CalcHistoryItem } from "@/lib/calculator";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: CalcHistoryItem[];
  onClear: () => void;
  onSelect: (item: CalcHistoryItem) => void;
  season: "winter" | "summer";
}

function formatDisplayNumber(val: string): string {
  if (!val || val === "Error" || val.includes("e") || val.includes("E")) return val;
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
  return decPart !== undefined ? `${prefix}${formattedInt}.${decPart}` : `${prefix}${formattedInt}`;
}

function formatFormula(expr: string): string {
  if (!expr) return "";
  return expr
    .split(" ")
    .map((token) => (/^-?\d+(\.\d+)?$/.test(token) ? formatDisplayNumber(token) : token))
    .join(" ");
}

function formatTime(ts: number): string {
  try {
    const d = new Date(ts);
    return d.toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export function HistoryModal({
  isOpen,
  onClose,
  history,
  onClear,
  onSelect,
  season,
}: HistoryModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="ice-shell relative w-full max-w-sm sm:max-w-md max-h-[82vh] flex flex-col rounded-3xl p-5 shadow-2xl overflow-hidden border border-white/60 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">دفترچه و تاریخچه حساب‌ها</h2>
              <p className="text-[11px] text-muted-foreground">مشاهده و استفاده مجدد از محاسبات قبلی</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="بستن"
            className="p-1.5 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of past calculations */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2.5 max-h-[50vh] pr-1 pl-1">
          {history.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Calculator className="w-10 h-10 stroke-1 opacity-40 text-primary" />
              <p className="text-sm">هنوز محاسبه‌ای ثبت نشده است.</p>
              <p className="text-xs opacity-70">هر زمان دکمه مساوی (=) را بزنید، در اینجا ذخیره می‌شود.</p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group relative flex flex-col p-3 rounded-2xl bg-white/40 dark:bg-white/10 hover:bg-white/60 transition-all border border-white/40 shadow-sm cursor-pointer active:scale-[0.98]"
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground/80 mb-1">
                  <span>{formatTime(item.timestamp)}</span>
                  <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary font-medium text-[10px]">
                    <ArrowDownRight className="w-3 h-3" /> استفاده مجدد
                  </span>
                </div>

                {/* Continuous Formula Chain */}
                <div
                  className="text-xs sm:text-sm font-normal text-muted-foreground text-left overflow-x-auto whitespace-nowrap scrollbar-none pb-0.5"
                  dir="ltr"
                >
                  {formatFormula(item.expression)}
                </div>

                {/* Calculation Result */}
                <div
                  className="text-base sm:text-lg font-bold text-primary text-left tracking-tight tabular-nums pt-0.5"
                  dir="ltr"
                >
                  = {formatDisplayNumber(item.result)}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer actions */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-white/20 flex items-center justify-between">
            <button
              type="button"
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-destructive hover:bg-destructive/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              پاک کردن تاریخچه
            </button>
            <span className="text-[11px] text-muted-foreground">{history.length} مورد ذخیره شده</span>
          </div>
        )}
      </div>
    </div>
  );
}
