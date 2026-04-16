"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase/client";
import { NavItem } from "./NavItem";
import { MovementModal } from "@/components/movements/MovementModal";
import { useAlerts } from "@/hooks/useAlerts";

const NAV_LINKS = [
  { href: "/dashboard", icon: "dashboard", label: "Resumen" },
  { href: "/ingresos", icon: "payments", label: "Ingresos" },
  { href: "/gastos", icon: "receipt_long", label: "Gastos" },
  { href: "/presupuesto", icon: "account_balance_wallet", label: "Presupuesto" },
  { href: "/seguimiento", icon: "monitoring", label: "Seguimiento mensual" },
  { href: "/objetivos", icon: "savings", label: "Objetivos de ahorro" },
  { href: "/importar", icon: "upload", label: "Importar" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAlertsClick?: () => void;
}

export function Sidebar({ isOpen = false, onClose, onAlertsClick }: SidebarProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const { unreadCount } = useAlerts();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { name: u.displayName || undefined, email: u.email || undefined } : null);
    });
    return unsub;
  }, []);

  const handleMovementSaved = () => {
    window.dispatchEvent(new CustomEvent("movement-updated"));
  };

  const name = typeof user?.name === "string" ? user.name : null;
  const emailDisplay = user?.email || "";
  const initials = name
    ? name.slice(0, 2).toUpperCase()
    : emailDisplay.slice(0, 2).toUpperCase() ?? "CF";

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`
          fixed top-0 h-screen w-72 sidebar-glass border-r border-outline-variant/20
          flex flex-col py-8 px-6 z-50 transition-transform duration-300
          lg:translate-x-0 lg:block
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="mb-10">
          <span className="text-2xl font-black text-on-surface font-headline tracking-tight">
            Control Financiero
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-primary-container mt-1">
            Wealth Management
          </p>
        </div>

        <nav className="flex-1 min-h-0 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.href} {...link} onClick={onClose} />
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-outline-variant/20 space-y-3">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full gradient-primary text-on-primary py-4 px-6 rounded-xl font-bold font-headline text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Movimiento
          </button>

          {/* User with settings link */}
          <button
            onClick={() => router.push("/configuracion")}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-surface-container-low transition-colors text-left"
          >
            <span className="material-symbols-outlined text-[22px] text-on-surface-variant">
              settings
            </span>
            <span className="text-sm text-on-surface truncate">
              {name || emailDisplay}
            </span>
          </button>
        </div>
      </aside>

      <MovementModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        defaultType="expense"
        onSuccess={handleMovementSaved}
      />
    </>
  );
}
