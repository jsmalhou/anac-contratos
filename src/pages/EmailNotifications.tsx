import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import {
  Mail,
  Send,
  Inbox,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Trash2,
  RefreshCw,
  AlertTriangle,
  FileText,
  Users,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const alertTypeLabels: Record<string, string> = {
  pagamento_30: "Pagamento - 30 dias",
  liquidacao_15: "Liquidacao - 15 dias",
  renovacao_7: "Renovacao - 7 dias",
  critico_3: "Critico - 3 dias",
  irregularidade: "Irregularidade",
  expirado: "Expirado",
  personalizado: "Personalizado",
};

const alertTypeColors: Record<string, string> = {
  pagamento_30: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  liquidacao_15: "bg-amber-500/20 text-amber-400 border-amber-400/30",
  renovacao_7: "bg-orange-500/20 text-orange-400 border-orange-400/30",
  critico_3: "bg-red-500/20 text-red-400 border-red-400/30",
  irregularidade: "bg-purple-500/20 text-purple-400 border-purple-400/30",
  expirado: "bg-red-500/20 text-red-400 border-red-400/30",
  personalizado: "bg-cyan-500/20 text-cyan-400 border-cyan-400/30",
};

export default function EmailNotifications() {
  const { data: emailLogs, refetch } = trpc.email.list.useQuery();
  const { data: stats } = trpc.email.stats.useQuery();
  const { data: contractsList } = trpc.contract.list.useQuery();
  const { success, error, confirmDelete } = useSweetAlert();

  const [showCompose, setShowCompose] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedContracts, setSelectedContracts] = useState<number[]>([]);
  const [emailForm, setEmailForm] = useState({
    recipientEmail: "",
    recipientName: "",
    subject: "",
    body: "",
    alertType: "personalizado" as string,
    contractId: "",
  });

  const sendMutation = trpc.email.send.useMutation({
    onSuccess: (result) => {
      if (result.success) {
        success("Email enviado com sucesso!");
        refetch();
        setShowCompose(false);
        resetForm();
      } else {
        error(`Erro ao enviar email: ${result.error}`);
      }
    },
    onError: (err) => error(`Erro: ${err.message}`),
  });

  const sendBulkMutation = trpc.email.sendBulk.useMutation({
    onSuccess: (result) => {
      success(
        `Emails enviados: ${result.success}/${result.total} com sucesso!`
      );
      refetch();
      setSelectedContracts([]);
    },
    onError: (err) => error(`Erro: ${err.message}`),
  });

  const deleteMutation = trpc.email.delete.useMutation({
    onSuccess: () => {
      refetch();
      success("Log eliminado!");
    },
  });

  const resetForm = () =>
    setEmailForm({
      recipientEmail: "",
      recipientName: "",
      subject: "",
      body: "",
      alertType: "personalizado",
      contractId: "",
    });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    sendMutation.mutate({
      recipientEmail: emailForm.recipientEmail,
      recipientName: emailForm.recipientName || undefined,
      subject: emailForm.subject,
      body: emailForm.body || undefined,
      alertType: emailForm.alertType as any,
      contractId: emailForm.contractId
        ? Number(emailForm.contractId)
        : undefined,
    });
  };

  const handleSendBulk = () => {
    if (selectedContracts.length === 0) {
      error("Selecione pelo menos um contrato!");
      return;
    }
    sendBulkMutation.mutate({
      contractIds: selectedContracts,
      subject: emailForm.subject,
      body: emailForm.body || undefined,
      alertType: emailForm.alertType as any,
    });
  };

  const toggleContract = (id: number) => {
    setSelectedContracts((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const inputClass = "glass-input w-full px-4 py-2.5 text-sm";
  const labelClass =
    "block text-white/60 text-xs uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            NOTIFICACOES POR EMAIL
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Enviar e gerir notificacoes por email aos gestores de contratos
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowStats(!showStats)}
            className="btn-3d-secondary px-4 py-2.5 text-sm flex items-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            Estatisticas
          </button>
          <button
            onClick={() => {
              setShowCompose(true);
              resetForm();
            }}
            className="btn-3d px-5 py-2.5 text-sm flex items-center gap-2"
          >
            <Mail className="w-4 h-4" /> Novo Email
          </button>
        </div>
      </div>

      {/* Stats */}
      {showStats && stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="glass-card p-4 text-center">
            <Mail className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.total}</p>
            <p className="text-white/50 text-xs">Total Emails</p>
          </div>
          <div className="glass-card p-4 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.sent}</p>
            <p className="text-white/50 text-xs">Enviados</p>
          </div>
          <div className="glass-card p-4 text-center">
            <Clock className="w-8 h-8 text-amber-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.pending}</p>
            <p className="text-white/50 text-xs">Pendentes</p>
          </div>
          <div className="glass-card p-4 text-center">
            <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
            <p className="text-2xl font-bold text-white">{stats.error}</p>
            <p className="text-white/50 text-xs">Erros</p>
          </div>
        </div>
      )}

      {/* Compose Email */}
      {showCompose && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold flex items-center gap-2">
              <Send className="w-5 h-5 text-amber-400" />
              Compor Email
            </h3>
            <button
              onClick={() => setShowCompose(false)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Email Destinatario *</label>
                <input
                  type="email"
                  required
                  value={emailForm.recipientEmail}
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      recipientEmail: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="gestor@anac.ao"
                />
              </div>
              <div>
                <label className={labelClass}>Nome Destinatario</label>
                <input
                  value={emailForm.recipientName}
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      recipientName: e.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Nome do gestor"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Assunto *</label>
              <input
                required
                value={emailForm.subject}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, subject: e.target.value })
                }
                className={inputClass}
                placeholder="Assunto do email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Tipo de Alerta</label>
                <select
                  value={emailForm.alertType}
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      alertType: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  {Object.entries(alertTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelClass}>Contrato Relacionado</label>
                <select
                  value={emailForm.contractId}
                  onChange={(e) =>
                    setEmailForm({
                      ...emailForm,
                      contractId: e.target.value,
                    })
                  }
                  className={inputClass}
                >
                  <option value="">Selecionar contrato...</option>
                  {contractsList?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.contractNumber} - {c.description?.slice(0, 40)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Mensagem</label>
              <textarea
                rows={4}
                value={emailForm.body}
                onChange={(e) =>
                  setEmailForm({ ...emailForm, body: e.target.value })
                }
                className={`${inputClass} resize-none`}
                placeholder="Mensagem personalizada (opcional)"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="btn-3d-secondary px-6 py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={sendMutation.isPending}
                className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <Send className="w-4 h-4" />
                {sendMutation.isPending
                  ? "A enviar..."
                  : "Enviar Email"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Bulk Send Section */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            Envio em Massa
          </h3>
          {selectedContracts.length > 0 && (
            <button
              onClick={handleSendBulk}
              disabled={sendBulkMutation.isPending}
              className="btn-3d px-4 py-2 text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" />
              {sendBulkMutation.isPending
                ? "A enviar..."
                : `Enviar (${selectedContracts.length})`}
            </button>
          )}
        </div>

        <p className="text-white/50 text-sm mb-4">
          Selecione os contratos para enviar notificacoes aos gestores
        </p>

        <div className="max-h-64 overflow-y-auto space-y-2">
          {contractsList?.map((contract) => (
            <label
              key={contract.id}
              className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                selectedContracts.includes(contract.id)
                  ? "bg-amber-500/20 border border-amber-400/30"
                  : "bg-white/5 border border-transparent hover:bg-white/10"
              }`}
            >
              <input
                type="checkbox"
                checked={selectedContracts.includes(contract.id)}
                onChange={() => toggleContract(contract.id)}
                className="w-4 h-4 accent-amber-500"
              />
              <FileText className="w-4 h-4 text-white/40" />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm truncate">
                  {contract.contractNumber}
                </p>
                <p className="text-white/40 text-xs truncate">
                  {contract.description || "Sem descricao"}
                </p>
              </div>
              <span
                className={`status-badge text-[10px] ${
                  contract.status === "ativo"
                    ? "status-ativo"
                    : contract.status === "concluido"
                    ? "status-concluido"
                    : "status-rescindido"
                }`}
              >
                {contract.status}
              </span>
            </label>
          ))}
          {(!contractsList || contractsList.length === 0) && (
            <p className="text-white/40 text-sm text-center py-4">
              Nenhum contrato disponivel
            </p>
          )}
        </div>
      </div>

      {/* Email Logs */}
      <div className="glass-card overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Inbox className="w-5 h-5 text-amber-400" />
            Historico de Emails
          </h3>
          <button
            onClick={() => refetch()}
            className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full glass-table">
            <thead>
              <tr>
                <th>Destinatario</th>
                <th>Assunto</th>
                <th>Tipo</th>
                <th>Estado</th>
                <th>Data</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {emailLogs?.map((log) => (
                <tr key={log.id}>
                  <td>
                    <div>
                      <p className="text-white text-sm">
                        {log.recipientName || "N/A"}
                      </p>
                      <p className="text-white/40 text-xs">
                        {log.recipientEmail}
                      </p>
                    </div>
                  </td>
                  <td className="text-white/70 text-sm max-w-xs truncate">
                    {log.subject}
                  </td>
                  <td>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                        alertTypeColors[log.alertType || "personalizado"]
                      }`}
                    >
                      {alertTypeLabels[log.alertType || "personalizado"]}
                    </span>
                  </td>
                  <td>
                    {log.status === "enviado" ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs">
                        <CheckCircle className="w-3 h-3" /> Enviado
                      </span>
                    ) : log.status === "erro" ? (
                      <span className="flex items-center gap-1 text-red-400 text-xs">
                        <XCircle className="w-3 h-3" /> Erro
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-400 text-xs">
                        <Clock className="w-3 h-3" /> Pendente
                      </span>
                    )}
                  </td>
                  <td className="text-white/40 text-xs">
                    {log.createdAt
                      ? new Date(log.createdAt).toLocaleDateString("pt-PT")
                      : "N/A"}
                  </td>
                  <td>
                    <button
                      onClick={async () => {
                        if (await confirmDelete("este log"))
                          deleteMutation.mutate({ id: log.id });
                      }}
                      className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
              {(!emailLogs || emailLogs.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center text-white/40 py-12">
                    <Mail className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    Nenhum email enviado ainda
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
