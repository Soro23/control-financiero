"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: string;
  label: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function NavItem({ href, icon, label, disabled = false, onClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  if (disabled) {
    return (
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 cursor-not-allowed select-none">
        <span className="material-symbols-outlined text-[20px]">{icon}</span>
        <span className="font-headline tracking-tight text-sm">{label}</span>
      </div>
    );
  }

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm",
        isActive
          ? "text-slate-900 font-bold border-r-2 border-slate-900 bg-slate-100/50"
          : "text-slate-500 font-medium hover:bg-slate-100/50"
      )}
    >
      <span
        className={cn(
          "material-symbols-outlined text-[20px]",
          isActive && "fill-icon"
        )}
      >
        {icon}
      </span>
      <span className="font-headline tracking-tight">{label}</span>
    </Link>
  );
}
