"use client";

import { useAlerts } from "@/hooks/useAlerts";
import { cn } from "@/lib/utils";

interface AlertsDropdownProps {
  onClose: () => void;
}

export function AlertsDropdown({ onClose }: AlertsDropdownProps) {
  const { alerts, loading, markAsRead, markAllAsRead } = useAlerts();

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return "Ahora";
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    if (days === 1) return "Ayer";
    return `${days}d`;
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "budget_over":
        return "warning";
      case "recurring_due":
        return "schedule";
      case "goal_reminder":
        return "savings";
      case "emergency_fund":
        return "shield";
      default:
        return "info";
    }
  };

  return (
    <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/20 overflow-hidden z-50">
      <div className="flex items-center justify-between p-4 border-b border-outline-variant/10">
        <h3 className="font-semibold text-on-surface">Alertas</h3>
        <button
          onClick={markAllAsRead}
          className="text-xs text-primary hover:underline"
        >
          Marcar todo leído
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined animate-spin text-2xl">
              sync
            </span>
            <p className="text-sm mt-2">Cargando...</p>
          </div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-on-surface-variant">
            <span className="material-symbols-outlined text-3xl opacity-50">
              notifications_none
            </span>
            <p className="text-sm mt-2">Sin alertas</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => markAsRead(alert.id)}
              className={cn(
                "w-full p-4 flex items-start gap-3 hover:bg-surface-container-low transition-colors text-left",
                !alert.is_read && "bg-primary/5"
              )}
            >
              <span className={cn(
                "material-symbols-outlined mt-0.5",
                alert.type === "budget_over" || alert.type === "emergency_fund"
                  ? "text-error"
                  : "text-primary"
              )}>
                {getAlertIcon(alert.type)}
              </span>
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-sm font-medium truncate",
                  alert.is_read ? "text-on-surface-variant" : "text-on-surface"
                )}>
                  {alert.title}
                </p>
                <p className="text-xs text-on-surface-variant line-clamp-2 mt-0.5">
                  {alert.message}
                </p>
                <p className="text-xs text-outline mt-1">
                  {formatDate(alert.created_at)}
                </p>
              </div>
              {!alert.is_read && (
                <span className="w-2 h-2 bg-primary rounded-full mt-1.5" />
              )}
            </button>
          ))
        )}
      </div>
    </div>
  );
}