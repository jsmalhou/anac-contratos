import { useState } from "react";
import { useDemoAuth } from "@/hooks/useDemoAuth";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import {
  User,
  Phone,
  Building2,
  Shield,
  Camera,
  Save,
  Check,
  X,
} from "lucide-react";

export default function Profile() {
  const { user } = useDemoAuth();
  const { success } = useSweetAlert();

  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    department: "Direção Geral",
    role: user?.appRole || "admin",
    avatar: user?.avatar || "",
    canInsert: true,
    canUpdate: true,
    canDelete: true,
    canPrint: true,
  });

  const handleSave = () => {
    localStorage.setItem("anac_demo_profile", JSON.stringify(form));
    success("Perfil atualizado com sucesso!");
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setForm({ ...form, avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const roleLabels: Record<string, string> = {
    admin: "Administrador",
    pca: "PCA",
    finance_manager: "Gestor Financeiro",
    operator: "Operador",
    viewer: "Visualizador",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-wide">
          PERFIL DO UTILIZADOR
        </h1>
        <p className="text-white/50 text-sm mt-1">
          Gerir informações pessoais e permissões
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Photo Card */}
        <div className="glass-card p-6 text-center">
          <h3 className="text-white font-semibold mb-4 flex items-center justify-center gap-2">
            <Camera className="w-5 h-5 text-amber-400" />
            Fotografia
          </h3>

          <div className="relative mx-auto w-32 h-32 mb-4">
            {form.avatar ? (
              <img
                src={form.avatar}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-2 border-amber-400/50"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-3xl font-bold border-2 border-amber-400/50">
                {(form.name || "U")[0]}
              </div>
            )}
            <label className="absolute bottom-0 right-0 w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-amber-600 transition-all shadow-lg">
              <Camera className="w-5 h-5 text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <p className="text-white font-medium">{form.name}</p>
          <p className="text-white/50 text-sm">{form.email}</p>
          <span className="status-badge status-ativo mt-2 inline-block text-xs">
            {roleLabels[form.role] || form.role}
          </span>
        </div>

        {/* Personal Info */}
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <User className="w-5 h-5 text-amber-400" />
            Informações Pessoais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">
                Nome Completo
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Phone className="w-3 h-3" />
                Nº de Telemóvel
              </label>
              <input
                type="tel"
                placeholder="+244 9XX XXX XXX"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                Departamento
              </label>
              <input
                type="text"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="glass-input w-full px-4 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Função
              </label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="glass-input w-full px-4 py-2.5 text-sm"
              >
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
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
            { key: "canInsert", label: "Inserir", icon: Plus },
            { key: "canUpdate", label: "Modificar", icon: Pencil },
            { key: "canDelete", label: "Apagar", icon: Trash },
            { key: "canPrint", label: "Imprimir", icon: Printer },
          ].map((perm) => {
            const Icon = perm.icon;
            const active = form[perm.key as keyof typeof form] as boolean;
            return (
              <button
                key={perm.key}
                onClick={() =>
                  setForm({ ...form, [perm.key]: !active })
                }
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

      {/* Save */}
      <div className="flex justify-end">
        <button onClick={handleSave} className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2">
          <Save className="w-4 h-4" />
          Guardar Alterações
        </button>
      </div>
    </div>
  );
}

// Icon components for permissions
function Plus({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}
function Pencil({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}
function Trash({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
  );
}
function Printer({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
