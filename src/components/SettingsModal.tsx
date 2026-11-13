import React from "react";
import { Settings, X, Snowflake, Sun, Sparkles, Smartphone, Check, Heart } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  season: "winter" | "summer";
  onSelectSeason: (s: "winter" | "summer") => void;
  hapticEnabled: boolean;
  onToggleHaptic: () => void;
  particlesEnabled: boolean;
  onToggleParticles: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  season,
  onSelectSeason,
  hapticEnabled,
  onToggleHaptic,
  particlesEnabled,
  onToggleParticles,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="ice-shell relative w-full max-w-sm sm:max-w-md flex flex-col rounded-3xl p-5 shadow-2xl border border-white/60 select-none animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/20">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/15 text-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-foreground">تنظیمات ظاهر و عملکرد</h2>
              <p className="text-[11px] text-muted-foreground">سفارشی‌سازی تم فصلی و بازخورد کلیدها</p>
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

        {/* Settings Body */}
        <div className="py-4 space-y-4">
          {/* Season Selector */}
          <div>
            <label className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              انتخاب فصل و تم ظاهری
            </label>
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              {/* Winter Card */}
              <button
                type="button"
                onClick={() => onSelectSeason("winter")}
                className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  season === "winter"
                    ? "bg-sky-500/15 border-sky-400 ring-2 ring-sky-300 shadow-md"
                    : "bg-white/30 border-white/40 hover:bg-white/50"
                }`}
              >
                {season === "winter" && (
                  <span className="absolute top-2 left-2 p-0.5 rounded-full bg-sky-500 text-white">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                <div className="p-2.5 rounded-2xl bg-sky-100 text-sky-600 mb-2 shadow-inner">
                  <Snowflake className="w-6 h-6 animate-pulse" />
                </div>
                <span className="text-sm font-bold text-foreground">زمستان یخی</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">آبی بلوری + بارش برف</span>
              </button>

              {/* Summer Card */}
              <button
                type="button"
                onClick={() => onSelectSeason("summer")}
                className={`relative flex flex-col items-center justify-center p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  season === "summer"
                    ? "bg-amber-500/15 border-amber-400 ring-2 ring-amber-300 shadow-md"
                    : "bg-white/30 border-white/40 hover:bg-white/50"
                }`}
              >
                {season === "summer" && (
                  <span className="absolute top-2 left-2 p-0.5 rounded-full bg-amber-500 text-white">
                    <Check className="w-3 h-3" />
                  </span>
                )}
                <div className="p-2.5 rounded-2xl bg-amber-100 text-amber-600 mb-2 shadow-inner">
                  <Sun className="w-6 h-6 animate-spin" style={{ animationDuration: "12s" }} />
                </div>
                <span className="text-sm font-bold text-foreground">تابستان گرم</span>
                <span className="text-[10px] text-muted-foreground mt-0.5">طلایی ساحلی + نور گرم</span>
              </button>
            </div>
          </div>

          {/* Toggles */}
          <div className="space-y-2 pt-2 border-t border-white/20">
            {/* Haptic */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/30 hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs font-semibold text-foreground">لرزش ملایم لمس کلیدها</div>
                  <div className="text-[10px] text-muted-foreground">بازخورد حسی سریع موقع لمس</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={hapticEnabled}
                onChange={onToggleHaptic}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>

            {/* Animation Toggle */}
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/30 hover:bg-white/40 transition-colors">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-xs font-semibold text-foreground">انیمیشن پس‌زمینه فصلی</div>
                  <div className="text-[10px] text-muted-foreground">بارش برف در زمستان / ذرات درخشان در تابستان</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={particlesEnabled}
                onChange={onToggleParticles}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer info & Creator credit */}
        <div className="pt-3 border-t border-white/20 flex flex-col items-center justify-center text-center gap-1">
          <div className="flex items-center gap-1 text-[11px] font-medium text-foreground">
            <span>ماشین‌حساب هوشمند X1</span>
            <span className="opacity-40">•</span>
            <span className="text-primary font-bold">سازنده: غلامی</span>
          </div>
          <p className="text-[10px] text-muted-foreground">نسخه اختصاصی با پشتیبانی از حسابداری و تغییر فصل</p>
        </div>
      </div>
    </div>
  );
}
