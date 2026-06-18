import { useAuth } from "@/hooks/useAuth";
import {
  Shield,
  User,
  Database,
  Mail,
  Smartphone,
  Save,
} from "lucide-react";

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          CONFIGURAÇÕES
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Configurações do sistema e perfil do utilizador
        </p>
      </div>

      {/* User Profile */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <User className="w-5 h-5 text-amber-400" />
          Perfil do Utilizador
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">
              Nome
            </label>
            <input
              type="text"
              value={user?.name || ""}
              readOnly
              className="glass-input w-full px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">
              E-mail
            </label>
            <input
              type="text"
              value={user?.email || ""}
              readOnly
              className="glass-input w-full px-4 py-2.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">
              Função
            </label>
            <input
              type="text"
              value={user?.role === "admin" ? "Administrador" : "Utilizador"}
              readOnly
              className="glass-input w-full px-4 py-2.5 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Segurança
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between glass-dark p-4 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">
                Timeout de Sessão
              </p>
              <p className="text-white/40 text-xs">
                Terminar sessão após 30 minutos de inatividade
              </p>
            </div>
            <div className="w-12 h-6 bg-emerald-500/30 rounded-full relative">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between glass-dark p-4 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">
                Trilha de Auditoria
              </p>
              <p className="text-white/40 text-xs">
                Registar todas as ações dos utilizadores
              </p>
            </div>
            <div className="w-12 h-6 bg-emerald-500/30 rounded-full relative">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-amber-400" />
          Configurações de Notificações
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between glass-dark p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white text-sm font-medium">
                  Notificações por E-mail
                </p>
                <p className="text-white/40 text-xs">
                  Enviar alertas para o e-mail configurado
                </p>
              </div>
            </div>
            <div className="w-12 h-6 bg-emerald-500/30 rounded-full relative">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between glass-dark p-4 rounded-lg">
            <div className="flex items-center gap-3">
              <Smartphone className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-white text-sm font-medium">
                  Notificações por SMS
                </p>
                <p className="text-white/40 text-xs">
                  Enviar alertas por SMS para o telemóvel
                </p>
              </div>
            </div>
            <div className="w-12 h-6 bg-emerald-500/30 rounded-full relative">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Database */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-amber-400" />
          Base de Dados
        </h3>
        <div className="flex items-center gap-4">
          <button className="btn-3d-secondary px-4 py-2 text-sm flex items-center gap-2">
            <Database className="w-4 h-4" />
            Exportar Dados
          </button>
          <button className="btn-3d-secondary px-4 py-2 text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            Backup
          </button>
        </div>
      </div>
    </div>
  );
}
