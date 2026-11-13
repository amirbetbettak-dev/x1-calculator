import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "num" | "op" | "eq" | "fn";

const variantClass: Record<Variant, string> = {
  num: "text-foreground",
  op: "ice-key-op",
  eq: "ice-key-eq",
  fn: "ice-key-fn",
};

interface IceKeyProps {
  children: ReactNode;
  onPress: () => void;
  variant?: Variant | undefined;
  className?: string | undefined;
  label?: string | undefined;
  active?: boolean | undefined;
  hapticEnabled?: boolean | undefined;
}

export function spawnFrost(el: HTMLElement, x?: number, y?: number) {
  const rect = el.getBoundingClientRect();
  const cx = x ?? rect.width / 2;
  const cy = y ?? rect.height / 2;
  const size = Math.max(rect.width, rect.height) * 1.6;

  const burst = document.createElement("span");
  burst.className = "frost-burst";
  burst.style.left = `${cx}px`;
  burst.style.top = `${cy}px`;
  burst.style.width = `${size}px`;
  burst.style.height = `${size}px`;
  el.appendChild(burst);
  setTimeout(() => burst.remove(), 400);

  for (let i = 0; i < 3; i++) {
    const shard = document.createElement("span");
    shard.className = "ice-shard";
    const angle = (Math.PI * 2 * i) / 3 + Math.random() * 0.4;
    const dist = 16 + Math.random() * 10;
    shard.style.left = `${cx - 3}px`;
    shard.style.top = `${cy - 3}px`;
    shard.style.setProperty("--dx", `${Math.cos(angle) * dist}px`);
    shard.style.setProperty("--dy", `${Math.sin(angle) * dist}px`);
    el.appendChild(shard);
    setTimeout(() => shard.remove(), 450);
  }
}

export function IceKey({
  children,
  onPress,
  variant = "num",
  className,
  label,
  active,
  hapticEnabled = true,
}: IceKeyProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const handlePointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (hapticEnabled && typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate(10);
      } catch {}
    }
    const rect = e.currentTarget.getBoundingClientRect();
    spawnFrost(e.currentTarget, e.clientX - rect.left, e.clientY - rect.top);
  };

  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      data-pressed={active ? "true" : undefined}
      onPointerDown={handlePointerDown}
      onClick={onPress}
      className={cn(
        "ice-key flex h-[3.4rem] sm:h-[4.1rem] select-none items-center justify-center rounded-2xl text-xl sm:text-2xl font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring touch-manipulation cursor-pointer",
        variantClass[variant],
        className,
      )}
    >
      <span className="relative z-[2] pointer-events-none flex items-center justify-center">{children}</span>
    </button>
  );
}
