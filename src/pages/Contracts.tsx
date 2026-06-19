import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { Link } from "react-router";
import {
  Search,
  Filter,
  Plus,
  Eye,
  Pencil,
  Trash2,
} from "lucide-react";

const statusLabels: Record<string, string> = {
  ativo: "Ativo",
  concluido: "Concluído",
  rescindido: "Rescindido",
  em_renovacao: "Em Renovação",
  em_aditamento: "Em Aditamento",
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
    <span
      style={{
        display: "inline-block",
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.5px",
        background: colors.bg,
        color: colors.color,
        border: `1px solid ${colors.border}`,
      }}
    >
      {label}
    </span>
  );
}

const typeLabels: Record<string, string> = {
  aquisicao: "Aquisição",
  servicos: "Serviços",
  obras: "Obras",
  locacao: "Locação",
  outros: "Outros",
};

export default function Contracts() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  const { data: contracts, refetch } = trpc.contract.list.useQuery({
    search: search || undefined,
    status: statusFilter || undefined,
    type: typeFilter || undefined,
  });

  const deleteMutation = trpc.contract.delete.useMutation({
    onSuccess: () => refetch(),
  });

  const formatKz = (v: string | number | null) => {
    if (v == null) return "Kz 0,00";
    const n = typeof v === "string" ? parseFloat(v) : v;
    if (isNaN(n)) return "Kz 0,00";
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
            CONTRATOS
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Gestão de todos os contratos públicos da ANAC
          </p>
        </div>
        <Link
          to="/contratos/novo"
          className="btn-3d px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Contrato
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              placeholder="Pesquisar por número..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="glass-input px-3 py-2.5 text-sm"
            >
              <option value="">Todos os estados</option>
              {Object.entries(statusLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="glass-input px-3 py-2.5 text-sm"
            >
              <option value="">Todos os tipos</option>
              {Object.entries(typeLabels).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full glass-table">
            <thead>
              <tr>
                <th>Número</th>
                <th>Tipo</th>
                <th>Descrição</th>
                <th>Fornecedor</th>
                <th>Valor Total</th>
                <th>Valor Pago</th>
                <th>Término</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contracts?.map((c) => (
                <tr key={c.id}>
                  <td className="font-mono text-amber-400 text-xs">
                    {c.contractNumber}
                  </td>
                  <td className="text-xs">
                    {typeLabels[c.contractType]}
                  </td>
                  <td className="text-xs max-w-[200px] truncate">
                    {c.description}
                  </td>
                  <td className="text-xs">{c.supplierName}</td>
                  <td className="text-xs font-semibold">
                    {formatKz(c.totalValue)}
                  </td>
                  <td className="text-xs text-emerald-400">
                    {formatKz(c.paidValue)}
                  </td>
                  <td className="text-xs">
                    {c.endDate
                      ? new Date(c.endDate).toLocaleDateString("pt-PT")
                      : "—"}
                  </td>
                  <td>
                    <StatusBadge status={c.status} />
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <Link
                        to={`/contratos/${c.id}`}
                        className="p-1.5 rounded-lg text-white/40 hover:text-amber-400 hover:bg-white/5 transition-all"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link
                        to={`/contratos/${c.id}/editar`}
                        className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => {
                          if (
                            confirm("Tem certeza que deseja eliminar este contrato?")
                          )
                            deleteMutation.mutate({ id: c.id });
                        }}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!contracts || contracts.length === 0) && (
                <tr>
                  <td colSpan={9} className="text-center text-white/40 py-12">
                    Nenhum contrato encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
