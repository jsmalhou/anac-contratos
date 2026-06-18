import { useParams, Link } from "react-router";
import { trpc } from "@/providers/trpc";
import {
  ArrowLeft,
  FileText,
  DollarSign,
  Building2,
  User,
  History,
  Download,
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

const amendmentLabels: Record<string, string> = {
  valor: "Valor",
  prazo: "Prazo",
  objeto: "Objeto",
};

export default function ContractDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: contract } = trpc.contract.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );

  const formatKz = (v: string | number | null) => {
    if (!v) return "Kz 0";
    const n = typeof v === "string" ? parseFloat(v) : v;
    return new Intl.NumberFormat("pt-PT", {
      style: "currency",
      currency: "AOA",
      minimumFractionDigits: 0,
    })
      .format(n)
      .replace("AOA", "Kz");
  };

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50">A carregar...</p>
      </div>
    );
  }

  const pendingValue =
    parseFloat(contract.totalValue) - parseFloat(contract.paidValue || "0");
  const progressPercent = Math.min(
    100,
    (parseFloat(contract.paidValue || "0") / parseFloat(contract.totalValue)) *
      100
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/contratos"
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            {contract.contractNumber}
          </h1>
          <p className="text-white/50 text-sm">{contract.description}</p>
        </div>
        <span
          className={`status-badge status-${contract.status} ml-auto`}
        >
          {statusLabels[contract.status]}
        </span>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Contract Info */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Informações do Contrato
          </h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Tipo</span>
              <span className="text-white text-sm">
                {typeLabels[contract.contractType]}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Data de Assinatura</span>
              <span className="text-white text-sm">
                {new Date(contract.signingDate).toLocaleDateString("pt-PT")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Início de Vigência</span>
              <span className="text-white text-sm">
                {new Date(contract.startDate).toLocaleDateString("pt-PT")}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50 text-sm">Término</span>
              <span className="text-white text-sm">
                {new Date(contract.endDate).toLocaleDateString("pt-PT")}
              </span>
            </div>
            {contract.renewalDate && (
              <div className="flex justify-between">
                <span className="text-white/50 text-sm">Renovação</span>
                <span className="text-amber-400 text-sm">
                  {new Date(contract.renewalDate).toLocaleDateString("pt-PT")}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Parties */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Building2 className="w-5 h-5 text-amber-400" />
            Partes
          </h3>
          <div className="space-y-3">
            <div className="glass-dark p-3 rounded-lg">
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Fornecedor
              </p>
              <p className="text-white font-medium">
                {contract.supplier?.name}
              </p>
              {contract.supplier?.nif && (
                <p className="text-white/40 text-xs">
                  NIF: {contract.supplier.nif}
                </p>
              )}
              {contract.supplier?.phone && (
                <p className="text-white/40 text-xs">
                  {contract.supplier.phone}
                </p>
              )}
            </div>
            <div className="glass-dark p-3 rounded-lg">
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Departamento
              </p>
              <p className="text-white font-medium">
                {contract.department?.name}
              </p>
            </div>
            <div className="glass-dark p-3 rounded-lg">
              <p className="text-white/50 text-xs uppercase tracking-wider">
                PCA Responsável
              </p>
              <p className="text-white font-medium flex items-center gap-2">
                <User className="w-4 h-4" />
                {contract.pca?.name}
              </p>
            </div>
          </div>
        </div>

        {/* Financial */}
        <div className="glass-card p-5 space-y-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Situação Financeira
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Valor Total
              </p>
              <p className="text-2xl font-bold text-white">
                {formatKz(contract.totalValue)}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Valor Pago
              </p>
              <p className="text-xl font-bold text-emerald-400">
                {formatKz(contract.paidValue)}
              </p>
            </div>
            <div>
              <p className="text-white/50 text-xs uppercase tracking-wider">
                Valor Pendente
              </p>
              <p className="text-xl font-bold text-amber-400">
                {formatKz(pendingValue)}
              </p>
            </div>
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-white/50">Progresso de Pagamento</span>
                <span className="text-white">{progressPercent.toFixed(0)}%</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contract File */}
      {contract.contractFile && (
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <FileText className="w-5 h-5 text-red-400" />
            Documento do Contrato
          </h3>
          <div className="glass-dark p-4 rounded-lg flex items-center gap-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <FileText className="w-6 h-6 text-red-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-medium text-sm">{contract.contractFile}</p>
              <p className="text-white/40 text-xs">Documento PDF anexado</p>
            </div>
            <button className="btn-3d-secondary px-4 py-2 text-sm flex items-center gap-2">
              <Download className="w-4 h-4" />
              Descarregar
            </button>
          </div>
        </div>
      )}

      {/* Payments & Amendments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Payments */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-amber-400" />
            Pagamentos
          </h3>
          {contract.payments && contract.payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full glass-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Valor</th>
                    <th>Descrição</th>
                  </tr>
                </thead>
                <tbody>
                  {contract.payments.map((p: { id: number; paymentDate: string | Date; amount: string | number; description: string | null }) => (
                    <tr key={p.id}>
                      <td className="text-xs">
                        {new Date(p.paymentDate).toLocaleDateString("pt-PT")}
                      </td>
                      <td className="text-xs font-semibold text-emerald-400">
                        {formatKz(p.amount)}
                      </td>
                      <td className="text-xs">{p.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-white/40 text-sm py-4">
              Nenhum pagamento registado
            </p>
          )}
        </div>

        {/* Amendments */}
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <History className="w-5 h-5 text-amber-400" />
            Aditamentos
          </h3>
          {contract.amendments && contract.amendments.length > 0 ? (
            <div className="space-y-3">
              {contract.amendments.map((a: { id: number; amendmentType: string; description: string | null; valueChange: string | null; createdAt: string | Date; newEndDate: string | Date | null }) => (
                <div key={a.id} className="glass-dark p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-amber-400 text-xs font-semibold uppercase">
                      {amendmentLabels[a.amendmentType]}
                    </span>
                    <span className="text-white/30 text-xs">
                      {new Date(a.createdAt).toLocaleDateString("pt-PT")}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm">{a.description}</p>
                  {a.valueChange && parseFloat(a.valueChange) !== 0 && (
                    <p className="text-sm mt-1">
                      <span className="text-white/50">Alteração de valor:</span>{" "}
                      <span
                        className={
                          parseFloat(a.valueChange) > 0
                            ? "text-emerald-400"
                            : "text-red-400"
                        }
                      >
                        {parseFloat(a.valueChange) > 0 ? "+" : ""}
                        {formatKz(a.valueChange)}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-sm py-4">
              Nenhum aditamento registado
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
