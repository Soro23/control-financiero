"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface TopNavBarProps {
  onMenuClick?: () => void;
  showAlerts?: boolean;
  onAlertsClick?: () => void;
}

export function TopNavBar({ onMenuClick, showAlerts = false, onAlertsClick }: TopNavBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isIngresosOrGastos = pathname === "/ingresos" || pathname === "/gastos";
  const [searchQuery, setSearchQuery] = useState("");
  const [searchEnabled] = useState(isIngresosOrGastos);

  useEffect(() => {
    setSearchQuery("");
  }, [isIngresosOrGastos]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    const url = new URL(window.location.href);
    if (value.trim()) {
      url.searchParams.set("search", value.trim());
    } else {
      url.searchParams.delete("search");
    }
    router.replace(url.toString(), { scroll: false });
  };

  return (
    <header className="h-20 sticky top-0 z-40 bg-transparent flex justify-between items-center px-4 md:px-12">
      {/* Left */}
      <div className="flex items-center gap-4 md:gap-8">
        {onMenuClick && (
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-surface-container-low lg:hidden min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined text-[24px]">menu</span>
          </button>
        )}
        {searchEnabled && (
          <div className="relative hidden sm:block">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-xl">
              search
            </span>
            <input
              className="bg-surface-container-low border-none rounded-full pl-10 pr-4 py-2 text-sm w-64 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="Buscar movimientos..."
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        {showAlerts && onAlertsClick && (
          <button
            onClick={onAlertsClick}
            className="p-2 text-on-surface-variant hover:text-primary transition-colors rounded-lg"
            aria-label="Ver alertas"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        )}
      </div>
    </header>
  );
}
