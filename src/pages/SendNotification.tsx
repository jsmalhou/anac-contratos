import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import {
  Send,
  ArrowLeft,
  Mail,
  Smartphone,
  Users,
  Check,
  Bell,
} from "lucide-react";

export default function SendNotification() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const contractId = searchParams.get("contractId");
  const { success, error } = useSweetAlert();
  const { user } = useDemoAuth();

  const { data: contract } = trpc.contract.getById.useQuery(
    { id: Number(contractId) },
    { enabled: !!contractId }
  );
  const { data: usersList } = trpc.auth.usersList.useQuery();

  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [sendEmail, setSendEmail] = useState(true);
  const [sendSms, setSendSms] = useState(false);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const managers = usersList?.filter((u) =>
    ["admin", "gestor", "pca"].includes(u.appRole || "")
  );

  const toggleUser = (id: number) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  };

  const handleSend = () => {
    if (selectedUsers.length === 0) {
      error("Selecione pelo menos um destinatário!");
      return;
    }
    if (!sendEmail && !sendSms) {
      error("Selecione pelo menos um meio de envio (Email ou SMS)!");
      return;
    }

    setSending(true);

    // Simular envio
    setTimeout(() => {
      const recipients = managers
        ?.filter((m) => selectedUsers.includes(m.id))
        .map((m) => m.name)
        .join(", ");

      success(
        `Notificação enviada com sucesso para: ${recipients}`
      );

      // Guardar no localStorage
      const history = JSON.parse(
        localStorage.getItem("anac_notification_history") || "[]"
      );
      history.push({
        contractId: Number(contractId),
        contractNumber: contract?.contractNumber,
        recipients: selectedUsers,
        sendEmail,
        sendSms,
        message,
        sentBy: user?.name,
        sentAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "anac_notification_history",
        JSON.stringify(history)
      );

      setSending(false);
      navigate("/alertas");
    }, 1500);
  };

  const defaultMessage = contract
    ? `ALERTA: O contrato ${contract.contractNumber} (${contract.description}) terminou no dia ${new Date(contract.endDate).toLocaleDateString("pt-PT")}. Por favor proceder à renovação ou rescisão do mesmo.`
    : "";

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/alertas")}
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            ENVIAR NOTIFICAÇÃO
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Enviar alerta aos gestores de contratos
          </p>
        </div>
      </div>

      {/* Contract Info */}
      {contract && (
        <div className="glass-card p-5">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            Contrato em Alerta
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-white/40 text-xs uppercase">Número</p>
              <p className="text-amber-400 font-medium">{contract.contractNumber}</p>
            </div>
            <div>
              <p className="text-white/40 text-xs uppercase">Data de Término</p>
              <p className="text-red-400 font-medium">
                {new Date(contract.endDate).toLocaleDateString("pt-PT")}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-white/40 text-xs uppercase">Objeto</p>
              <p className="text-white text-sm">{contract.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recipients */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          Destinatários
        </h3>
        <div className="space-y-2">
          {managers?.map((m) => (
            <button
              key={m.id}
              onClick={() => toggleUser(m.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                selectedUsers.includes(m.id)
                  ? "bg-amber-500/20 border-amber-400/40"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  selectedUsers.includes(m.id)
                    ? "bg-amber-500 border-amber-500"
                    : "border-white/30"
                }`}
              >
                {selectedUsers.includes(m.id) && (
                  <Check className="w-3 h-3 text-white" />
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="text-white text-sm font-medium">{m.name}</p>
                <p className="text-white/40 text-xs">{m.email}</p>
              </div>
              <span className="text-amber-400 text-xs capitalize">
                {m.appRole}
              </span>
            </button>
          ))}
          {(!managers || managers.length === 0) && (
            <p className="text-white/40 text-center py-4">
              Nenhum gestor encontrado
            </p>
          )}
        </div>
      </div>

      {/* Send Methods */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Send className="w-5 h-5 text-amber-400" />
          Meio de Envio
        </h3>
        <div className="flex gap-4">
          <button
            onClick={() => setSendEmail(!sendEmail)}
            className={`flex-1 flex items-center gap-3 p-4 rounded-lg border transition-all ${
              sendEmail
                ? "bg-blue-500/20 border-blue-400/40"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Mail
              className={`w-6 h-6 ${sendEmail ? "text-blue-400" : "text-white/30"}`}
            />
            <div className="text-left">
              <p className="text-white text-sm font-medium">E-mail</p>
              <p className="text-white/40 text-xs">Enviar por email</p>
            </div>
          </button>
          <button
            onClick={() => setSendSms(!sendSms)}
            className={`flex-1 flex items-center gap-3 p-4 rounded-lg border transition-all ${
              sendSms
                ? "bg-emerald-500/20 border-emerald-400/40"
                : "bg-white/5 border-white/10"
            }`}
          >
            <Smartphone
              className={`w-6 h-6 ${sendSms ? "text-emerald-400" : "text-white/30"}`}
            />
            <div className="text-left">
              <p className="text-white text-sm font-medium">SMS</p>
              <p className="text-white/40 text-xs">Enviar por SMS</p>
            </div>
          </button>
        </div>
      </div>

      {/* Message */}
      <div className="glass-card p-5">
        <h3 className="text-white font-semibold mb-3">Mensagem</h3>
        <textarea
          rows={5}
          value={message || defaultMessage}
          onChange={(e) => setMessage(e.target.value)}
          className="glass-input w-full px-4 py-3 text-sm"
        />
      </div>

      {/* Send Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSend}
          disabled={sending}
          className="btn-3d px-8 py-3 text-sm flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          {sending ? "A enviar..." : "Enviar Notificação"}
        </button>
      </div>
    </div>
  );
}
