import { trpc } from "@/providers/trpc";
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Mail,
  Smartphone,
} from "lucide-react";

const alertTypeLabels: Record<string, { label: string; color: string; icon: typeof Bell }> = {
  pagamento_30: { label: "Pagamento (30d)", color: "text-amber-400", icon: Clock },
  liquidacao_15: { label: "Liquidação (15d)", color: "text-red-400", icon: AlertTriangle },
  renovacao_7: { label: "Renovação (7d)", color: "text-blue-400", icon: Calendar },
  critico_3: { label: "Crítico (3d)", color: "text-red-500", icon: AlertTriangle },
  irregularidade: { label: "Irregularidade", color: "text-orange-400", icon: AlertTriangle },
  expirado: { label: "Expirado", color: "text-red-500", icon: Bell },
};

const statusLabels: Record<string, { label: string; className: string }> = {
  pendente: { label: "Pendente", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  enviado: { label: "Enviado", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
  lido: { label: "Lido", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
};

export default function Alerts() {
  const { data: alerts, refetch } = trpc.alert.list.useQuery();
  const markRead = trpc.alert.markAsRead.useMutation({ onSuccess: () => refetch() });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          ALERTAS E NOTIFICAÇÕES
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Sistema de alertas preventivos para prazos contractuais
        </p>
      </div>

      {/* Notification Channels Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">E-mail</p>
            <p className="text-white/50 text-xs">Notificações automáticas</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Smartphone className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">SMS</p>
            <p className="text-white/50 text-xs">Alertas por telemóvel</p>
          </div>
        </div>
        <div className="glass-card p-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">Push</p>
            <p className="text-white/50 text-xs">Notificações na app</p>
          </div>
        </div>
      </div>

      {/* Alert Types Legend */}
      <div className="glass-card p-4">
        <h3 className="text-white font-semibold text-sm mb-3">Tipos de Alerta</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(alertTypeLabels).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="glass-dark p-3 rounded-lg text-center">
                <Icon className={`w-5 h-5 mx-auto mb-1 ${config.color}`} />
                <p className="text-white/70 text-xs">{config.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alerts List */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Alertas Recentes
        </h3>
        <div className="space-y-3">
          {alerts?.map((alert) => {
            const config = alertTypeLabels[alert.alertType];
            const Icon = config?.icon || Bell;
            const status = statusLabels[alert.status];

            return (
              <div
                key={alert.id}
                className="glass-dark p-4 rounded-lg flex items-start gap-4"
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    alert.status === "pendente"
                      ? "bg-amber-500/20"
                      : alert.status === "enviado"
                      ? "bg-blue-500/20"
                      : "bg-emerald-500/20"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      alert.status === "pendente"
                        ? "text-amber-400"
                        : alert.status === "enviado"
                        ? "text-blue-400"
                        : "text-emerald-400"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-amber-400 text-xs font-mono">
                      {alert.contractNumber}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border ${status.className}`}
                    >
                      {status.label}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{alert.message}</p>
                  <p className="text-white/30 text-xs mt-1">
                    {alert.createdAt
                      ? new Date(alert.createdAt).toLocaleString("pt-PT")
                      : ""}
                  </p>
                </div>
                {alert.status !== "lido" && (
                  <button
                    onClick={() => markRead.mutate({ id: alert.id })}
                    className="p-2 rounded-lg text-white/30 hover:text-emerald-400 hover:bg-emerald-400/10 transition-all flex-shrink-0"
                    title="Marcar como lido"
                  >
                    <CheckCircle className="w-5 h-5" />
                  </button>
                )}
              </div>
            );
          })}
          {(!alerts || alerts.length === 0) && (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-white/40">Nenhum alerta registado</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
