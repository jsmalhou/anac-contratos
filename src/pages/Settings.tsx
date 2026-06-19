import { useState, useEffect } from "react";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { formatPhone } from "@/hooks/useFormat";
import { trpc } from "@/providers/trpc";
import {
  Shield,
  User,
  Database,
  Mail,
  Smartphone,
  Save,
  Camera,
  Phone,
  Building2,
  Check,
  X,
  UserCircle,
} from "lucide-react";

export default function Settings() {
  const { user } = useDemoAuth();
  const { success } = useSweetAlert();
  const { data: departments } = trpc.department.list.useQuery();
  const { data: rolesList } = trpc.role.list.useQuery();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    departmentId: "",
    roleId: "",
    avatar: "",
    canInsert: true,
    canUpdate: true,
    canDelete: false,
    canPrint: true,
  });

  useEffect(() => {
    const saved = localStorage.getItem("anac_demo_profile");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setForm((prev) => ({ ...prev, ...parsed }));
      } catch {
        // ignore
      }
    } else if (user) {
      setForm((prev) => ({
        ...prev,
        name: user.name || "",
        email: user.email || "",
      }));
    }
  }, [user]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm((prev) => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    localStorage.setItem("anac_demo_profile", JSON.stringify(form));
    success("Perfil atualizado com sucesso!");
  };

  const inputClass = "glass-input w-full px-4 py-2.5 text-sm";
  const labelClass = "block text-white/60 text-xs uppercase tracking-wider mb-1.5";

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    pca: "PCA",
    finance_manager: "Gestor Financeiro",
    operator: "Operador",
    viewer: "Visualizador",
  };

  return (
    <div className="space-y-6" style={{ maxWidth: "90%", margin: "0 auto" }}>
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          CONFIGURAÇÕES
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Configurações do sistema e perfil do utilizador
        </p>
      </div>

      {/* Profile Card with Photo */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-6 flex items-center gap-2">
          <UserCircle className="w-5 h-5 text-amber-400" />
          Perfil do Utilizador
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Photo Upload */}
          <div className="flex flex-col items-center text-center">
            <div className="relative mx-auto mb-4">
              {form.avatar ? (
                <img
                  src={form.avatar}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-2 border-amber-400/50"
                />
              ) : (
                <div className="w-28 h-28 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-amber-400/50">
                  {(form.name || "U")[0]}
                </div>
              )}
              <label className="absolute bottom-0 right-0 w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-all shadow-lg">
                <Camera className="w-4 h-4 text-white" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
              </label>
            </div>
            <p className="text-white font-medium text-sm">{form.name || "Utilizador"}</p>
            <p className="text-white/40 text-xs">{form.email}</p>
            <span className="status-badge status-ativo mt-2 inline-block text-xs">
              {roleLabels[user?.appRole || "admin"] || "Administrador"}
            </span>
          </div>

          {/* Personal Info Form */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Nome Completo</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className={inputClass}
                placeholder="Nome do utilizador"
              />
            </div>

            <div>
              <label className={labelClass}>E-mail</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="email@anac.ao"
              />
            </div>

            <div>
              <label className={`${labelClass} flex items-center gap-1`}>
                <Phone className="w-3 h-3" />
                Nº de Telemóvel
              </label>
              <input
                type="tel"
                value={form.phone}
                placeholder="+244-999-999-999"
                onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                className={inputClass}
              />
            </div>

            <div>
              <label className={`${labelClass} flex items-center gap-1`}>
                <Building2 className="w-3 h-3" />
                Departamento
              </label>
              <select
                value={form.departmentId}
                onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                className={`${inputClass} select-dark`}
              >
                <option value="">Selecionar departamento...</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={`${labelClass} flex items-center gap-1`}>
                <Shield className="w-3 h-3" />
                Função
              </label>
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className={`${inputClass} select-dark`}
              >
                <option value="">Selecionar função...</option>
                {rolesList?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Permissions */}
      <div className="glass-card p-6">
        <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          Permissões de Acesso
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { key: "canInsert", label: "Inserir", icon: PlusIcon },
            { key: "canUpdate", label: "Modificar", icon: EditIcon },
            { key: "canDelete", label: "Apagar", icon: DeleteIcon },
            { key: "canPrint", label: "Imprimir", icon: PrintIcon },
          ].map((perm) => {
            const Icon = perm.icon;
            const active = form[perm.key as keyof typeof form] as boolean;
            return (
              <button
                key={perm.key}
                onClick={() => setForm({ ...form, [perm.key]: !active })}
                className={`p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${
                  active
                    ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400"
                    : "bg-red-500/10 border-red-400/20 text-red-400"
                }`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-sm font-medium">{perm.label}</span>
                {active ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <X className="w-4 h-4" />
                )}
              </button>
            );
          })}
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
              <p className="text-white text-sm font-medium">Timeout de Sessão</p>
              <p className="text-white/40 text-xs">Terminar sessão após 30 minutos de inatividade</p>
            </div>
            <div className="w-12 h-6 bg-emerald-500/30 rounded-full relative">
              <div className="w-5 h-5 bg-emerald-400 rounded-full absolute right-0.5 top-0.5" />
            </div>
          </div>
          <div className="flex items-center justify-between glass-dark p-4 rounded-lg">
            <div>
              <p className="text-white text-sm font-medium">Trilha de Auditoria</p>
              <p className="text-white/40 text-xs">Registar todas as ações dos utilizadores</p>
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
                <p className="text-white text-sm font-medium">Notificações por E-mail</p>
                <p className="text-white/40 text-xs">Enviar alertas para o e-mail configurado</p>
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
                <p className="text-white text-sm font-medium">Notificações por SMS</p>
                <p className="text-white/40 text-xs">Enviar alertas por SMS para o telemóvel</p>
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2">
          <Save className="w-4 h-4" />
          Guardar Alterações
        </button>
      </div>
    </div>
  );
}

/* Inline icon components for permissions */
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function EditIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}
function DeleteIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
function PrintIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
