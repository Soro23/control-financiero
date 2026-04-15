"use client";

import { monthYearLabel } from "@/lib/utils/formatDate";
import type { MonthYear } from "@/types";

interface MonthSelectorProps {
  value: MonthYear;
  onChange: (value: MonthYear) => void;
}

export function MonthSelector({ value, onChange }: MonthSelectorProps) {
  function prev() {
    if (value.month === 1) {
      onChange({ month: 12, year: value.year - 1 });
    } else {
      onChange({ month: value.month - 1, year: value.year });
    }
  }

  function next() {
    const now = new Date();
    const isCurrentMonth = value.year === now.getFullYear() && value.month === now.getMonth() + 1;
    if (isCurrentMonth) return;

    if (value.month === 12) {
      onChange({ month: 1, year: value.year + 1 });
    } else {
      onChange({ month: value.month + 1, year: value.year });
    }
  }

  const now = new Date();
  const isCurrentMonth = value.year === now.getFullYear() && value.month === now.getMonth() + 1;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={prev}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Mes anterior"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_left</span>
      </button>

      <span className="font-headline font-bold text-slate-900 min-w-[140px] text-center">
        {monthYearLabel(value.month, value.year)}
      </span>

      <button
        onClick={next}
        disabled={isCurrentMonth}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="Mes siguiente"
      >
        <span className="material-symbols-outlined text-[20px]">chevron_right</span>
      </button>
    </div>
  );
}
