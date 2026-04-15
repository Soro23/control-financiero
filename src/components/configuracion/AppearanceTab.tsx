"use client";

import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const THEMES = [
  { value: "light",  label: "Claro",  icon: "light_mode" },
  { value: "dark",   label: "Oscuro", icon: "dark_mode" },
  { value: "system", label: "Sistema", icon: "desktop_windows" },
] as const;

export function AppearanceTab() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-[0_2px_12px_rgba(25,28,30,0.06)] space-y-6">
      <div>
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-4">Tema de la aplicación</p>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(({ value, label, icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTheme(value)}
              className={cn(
                "flex flex-col items-center gap-3 py-5 rounded-2xl border-2 transition-all",
                theme === value
                  ? "gradient-primary text-on-primary border-transparent shadow-lg shadow-primary/15"
                  : "bg-surface-container-low text-slate-600 border-transparent hover:border-outline-variant/30"
              )}
            >
              <span className={cn(
                "material-symbols-outlined text-[28px]",
                theme === value ? "fill-icon" : ""
              )}>
                {icon}
              </span>
              <span className="text-sm font-bold font-headline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-surface-container-low rounded-xl px-5 py-4">
        <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">Nota</p>
        <p className="text-sm text-on-surface-variant">
          El tema oscuro está en desarrollo. Algunas secciones pueden no estar completamente adaptadas.
        </p>
      </div>
    </div>
  );
}
