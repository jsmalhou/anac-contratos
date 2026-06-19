import { trpc } from "@/providers/trpc";
import GaugeChart from "@/components/GaugeChart";
import {
  FileText,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Clock,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router";

const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  concluido: "Concluído",
  rescindido: "Rescindido",
  em_renovacao: "Em Renovação",
  em_aditamento: "Em Aditamento",
};

const typeLabels: Record<string, string> = {
  aquisicao: "Aquisição",
  servicos: "Serviços",
  obras: "Obras",
  locacao: "Locação",
  outros: "Outros",
};

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  ativo: { bg: "rgba(74, 222, 128, 0.2)", color: "#4ADE80", border: "rgba(74,222,128,0.3)" },
  concluido: { bg: "rgba(74, 222, 128, 0.2)", color: "#4ADE80", border: "rgba(74,222,128,0.3)" },
  rescindido: { bg: "rgba(248, 113, 113, 0.2)", color: "#F87171", border: "rgba(248,113,113,0.3)" },
  em_renovacao: { bg: "rgba(251, 191, 36, 0.2)", color: "#FBBF24", border: "rgba(251,191,36,0.3)" },
  em_aditamento: { bg: "rgba(156, 163, 175, 0.2)", color: "#9CA3AF", border: "rgba(156,163,175,0.3)" },
};

function StatusBadge({ status }: { status: string | null }) {
  const s = status || "desconhecido";
  const label = statusLabels[s] || s;
  const colors = statusColors[s] || { bg: "rgba(156,163,175,0.2)", color: "#9CA3AF", border: "rgba(156,163,175,0.3)" };
  return (
    <span style={{
      display: "inline-block", padding: "4px 12px", borderRadius: "20px",
      fontSize: "0.75rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px",
      background: colors.bg, color: colors.color, border: `1px solid ${colors.border}`,
    }}>
      {label}
    </span>
  );
}

export default function Dashboard() {
  const { data: kpis } = trpc.dashboard.kpis.useQuery();
  const { data: charts } = trpc.dashboard.charts.useQuery();
  const { data: recent } = trpc.dashboard.recentContracts.useQuery();
  const { data: expiring } = trpc.dashboard.expiringContracts.useQuery();
  
  // Gerar alertas automaticamente ao carregar o dashboard
  trpc.alertGenerator.check.useQuery(undefined, {
    refetchOnWindowFocus: true,
    staleTime: 60000, // 1 minuto
  });

  const formatKz = (v: string | number | null | undefined) => {
    if (v == null) return "Kz 0,00";
    const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : 0;
    if (isNaN(n)) return "Kz 0,00";
    // Formato manual: Kz 2.500.638.000.000,00
    const [intPart, decPart] = n.toFixed(2).split(".");
    const intFormatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `Kz ${intFormatted},${decPart}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            DASHBOARD
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Visão geral dos contratos da ANAC
          </p>
        </div>
        <Link to="/contratos/novo" className="btn-3d px-5 py-2.5 text-sm">
          + Novo Contrato
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-8 h-8 text-amber-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Total
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {kpis?.totalContracts ?? 0}
          </p>
          <p className="text-sm text-white/50 mt-1">Contratos registados</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Activos
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {kpis?.activeContracts ?? 0}
          </p>
          <p className="text-sm text-white/50 mt-1">Contratos em vigor</p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <DollarSign className="w-8 h-8 text-amber-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Valor Total
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {formatKz(kpis?.totalValue ?? 0)}
          </p>
          <p className="text-sm text-white/50 mt-1">
            Pago: {formatKz(kpis?.paidValue ?? 0)}
          </p>
        </div>

        <div className="kpi-card">
          <div className="flex items-center justify-between mb-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            <span className="text-xs text-white/40 uppercase tracking-wider">
              Críticos
            </span>
          </div>
          <p className="text-3xl font-bold text-white">
            {kpis?.expiringContracts ?? 0}
          </p>
          <p className="text-sm text-white/50 mt-1">Prazos a expirar (30d)</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* By Type */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Por Tipo de Contrato
          </h3>
          <div className="space-y-3">
            {charts?.byType.map((item) => (
              <div key={item.type} className="flex items-center gap-3">
                <span className="text-white/70 text-sm w-24">
                  {typeLabels[item.type] || item.type}
                </span>
                <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, (item.count / (charts.byType[0]?.count || 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-white font-semibold text-sm w-6 text-right">
                  {item.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* By Status - Gauge Chart */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            Taxa de Ativos
          </h3>
          <GaugeChart
            active={kpis?.activeContracts ?? 0}
            inactive={(kpis?.totalContracts ?? 0) - (kpis?.activeContracts ?? 0)}
            label="Contratos Ativos"
          />
        </div>

        {/* Pending Value */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Resumo Financeiro
          </h3>
          <div className="space-y-4">
            <div className="glass-dark p-4 rounded-lg">
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Valor Total
              </p>
              <p className="text-2xl font-bold text-white mt-1">
                {formatKz(kpis?.totalValue ?? 0)}
              </p>
            </div>
            <div className="glass-dark p-4 rounded-lg">
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Valor Pago
              </p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">
                {formatKz(kpis?.paidValue ?? 0)}
              </p>
            </div>
            <div className="glass-dark p-4 rounded-lg">
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Valor Pendente
              </p>
              <p className="text-2xl font-bold text-amber-400 mt-1">
                {formatKz(kpis?.pendingValue ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Contracts */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4">
            Contratos Recentes
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full glass-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recent?.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono text-amber-400 text-xs">
                      <Link
                        to={`/contratos/${c.id}`}
                        className="hover:underline"
                      >
                        {c.contractNumber}
                      </Link>
                    </td>
                    <td className="text-xs">
                      {typeLabels[c.contractType]}
                    </td>
                    <td className="text-xs font-semibold">
                      {formatKz(c.totalValue)}
                    </td>
                    <td>
                      <StatusBadge status={c.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiring Contracts */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Prazos a Expirar (30 dias)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full glass-table">
              <thead>
                <tr>
                  <th>Número</th>
                  <th>Fornecedor</th>
                  <th>Término</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {expiring?.map((c) => (
                  <tr key={c.id}>
                    <td className="font-mono text-amber-400 text-xs">
                      <Link
                        to={`/contratos/${c.id}`}
                        className="hover:underline"
                      >
                        {c.contractNumber}
                      </Link>
                    </td>
                    <td className="text-xs">{c.supplierName}</td>
                    <td className="text-xs text-red-400">
                      {c.endDate
                        ? new Date(c.endDate).toLocaleDateString("pt-PT")
                        : "—"}
                    </td>
                    <td className="text-xs font-semibold">
                      {formatKz(c.totalValue)}
                    </td>
                  </tr>
                ))}
                {(!expiring || expiring.length === 0) && (
                  <tr>
                    <td
                      colSpan={4}
                      className="text-center text-white/40 py-8"
                    >
                      Nenhum contrato com prazo crítico
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
