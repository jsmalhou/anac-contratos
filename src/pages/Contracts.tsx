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
    if (v == null) return "Kz 0";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    })
      .format(n)
      .replace("AOA", "Kz");
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
                    <span
                      className={`status-badge status-${c.status}`}
                    >
                      {statusLabels[c.status]}
                    </span>
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
