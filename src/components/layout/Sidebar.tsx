"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, signOut } from "firebase/auth";
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
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  onAlertsClick?: () => void;
}

export function Sidebar({ isOpen = false, onClose, onAlertsClick }: SidebarProps) {
  const router = useRouter();
  const [modalOpen, setModalOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [configMenuOpen, setConfigMenuOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; email?: string } | null>(null);
  const { unreadCount } = useAlerts();
  
  const userMenuRef = useRef<HTMLDivElement>(null);
  const configMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u ? { name: u.displayName || undefined, email: u.email || undefined } : null);
    });
    return unsub;
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
      if (configMenuRef.current && !configMenuRef.current.contains(event.target as Node)) {
        setConfigMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMovementSaved = () => {
    window.dispatchEvent(new CustomEvent("movement-updated"));
  };

  const handleSignOut = async () => {
    await signOut(auth);
    router.push("/login");
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

        <nav className="flex-1 space-y-1">
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

          {/* Alerts & User footer */}
          <div className="flex items-center gap-2 pt-3">
            {/* Alerts button */}
            <button
              onClick={onAlertsClick}
              className="relative p-3 rounded-xl hover:bg-surface-container-low transition-colors"
              aria-label="Alertas"
            >
              <span className="material-symbols-outlined text-[22px] text-on-surface-variant">
                notifications
              </span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* User dropdown */}
            <div className="relative flex-1" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-surface-container-low transition-colors"
              >
                <div className="w-9 h-9 rounded-full bg-primary-fixed text-primary font-bold text-xs flex items-center justify-center">
                  {initials}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <p className="text-sm font-medium text-on-surface truncate">
                    {name || "Usuario"}
                  </p>
                  <p className="text-xs text-on-surface-variant truncate">{emailDisplay}</p>
                </div>
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  expand_more
                </span>
              </button>

              {userMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden">
                  <div className="relative" ref={configMenuRef}>
                    <button
                      onClick={() => setConfigMenuOpen(!configMenuOpen)}
                      className="w-full flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                          settings
                        </span>
                        <span className="text-sm text-on-surface">Configuración</span>
                      </div>
                      <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                        chevron_right
                      </span>
                    </button>

                    {configMenuOpen && (
                      <div className="absolute left-full bottom-0 ml-2 w-48 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden">
                        <button
                          onClick={() => {
                            router.push("/configuracion");
                            setConfigMenuOpen(false);
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-low transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                            tune
                          </span>
                          <span className="text-sm text-on-surface">Preferencias</span>
                        </button>
                        <button
                          onClick={() => {
                            handleSignOut();
                            setConfigMenuOpen(false);
                            setUserMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-3 p-3 hover:bg-surface-container-low transition-colors text-error"
                        >
                          <span className="material-symbols-outlined text-[18px]">logout</span>
                          <span className="text-sm">Cerrar sesión</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
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
