import { useEffect, useCallback } from "react";

interface PrototypeSwitcherProps {
  variants: string[];
  current: string;
  onChange: (variant: string) => void;
  names?: Record<string, string>;
}

export function PrototypeSwitcher({ variants, current, onChange, names }: PrototypeSwitcherProps) {
  const idx = variants.indexOf(current);

  const prev = useCallback(() => {
    onChange(variants[(idx - 1 + variants.length) % variants.length]);
  }, [idx, variants, onChange]);

  const next = useCallback(() => {
    onChange(variants[(idx + 1) % variants.length]);
  }, [idx, variants, onChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [prev, next]);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 rounded-full border bg-zinc-900 px-4 py-2 text-sm text-white shadow-2xl">
      <button onClick={prev} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
        ←
      </button>
      <span className="min-w-[120px] text-center font-mono">
        {current}
        {names?.[current] && <span className="ml-2 text-zinc-400">— {names[current]}</span>}
      </span>
      <button onClick={next} className="text-zinc-400 hover:text-white transition-colors cursor-pointer">
        →
      </button>
    </div>
  );
}
