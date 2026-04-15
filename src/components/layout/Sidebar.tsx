"use client";

import { useState } from "react";
import { NavItem } from "./NavItem";
import { MovementModal } from "@/components/movements/MovementModal";

const NAV_LINKS = [
  { href: "/dashboard",     icon: "dashboard",               label: "Resumen" },
  { href: "/ingresos",      icon: "payments",                label: "Ingresos" },
  { href: "/gastos",        icon: "receipt_long",            label: "Gastos" },
  { href: "/presupuesto",   icon: "account_balance_wallet",  label: "Presupuesto" },
  { href: "/seguimiento",   icon: "monitoring",              label: "Seguimiento mensual" },
  { href: "/objetivos",     icon: "savings",                 label: "Objetivos de ahorro" },
  { href: "/configuracion", icon: "settings",                label: "Configuración" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const handleMovementSaved = () => {
    window.dispatchEvent(new CustomEvent("movement-updated"));
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      <aside className={`
        fixed top-0 h-screen w-72 sidebar-glass border-r border-slate-200/15 
        flex flex-col py-8 px-6 z-50 transition-transform duration-300
        lg:translate-x-0 lg:block
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        {/* Logo */}
        <div className="mb-10">
          <span className="text-2xl font-black text-slate-900 font-headline tracking-tight">
            Control Financiero
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-primary-container mt-1">
            Wealth Management
          </p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {NAV_LINKS.map((link) => (
            <NavItem key={link.href} {...link} onClick={onClose} />
          ))}
        </nav>

        {/* CTA */}
        <div className="mt-auto pt-6">
          <button
            onClick={() => setModalOpen(true)}
            className="w-full gradient-primary text-on-primary py-4 px-6 rounded-xl font-bold font-headline text-sm flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-primary/10"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            Nuevo Movimiento
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
