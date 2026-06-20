import { useState, useRef } from "react";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { formatPhone } from "@/hooks/useFormat";
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  UserCircle,
  Shield,
  Mail,
  Phone,
  Building2,
  Check,
  Camera,
} from "lucide-react";

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  pca: "PCA",
  gestor: "Gestor de Contratos",
  financeiro: "Financeiro",
  operador: "Operador",
  visualizador: "Visualizador",
};

const roleColors: Record<string, string> = {
  admin: "bg-amber-500/20 text-amber-400 border-amber-400/30",
  pca: "bg-blue-500/20 text-blue-400 border-blue-400/30",
  gestor: "bg-emerald-500/20 text-emerald-400 border-emerald-400/30",
  financeiro: "bg-purple-500/20 text-purple-400 border-purple-400/30",
  operador: "bg-cyan-500/20 text-cyan-400 border-cyan-400/30",
  visualizador: "bg-gray-500/20 text-gray-400 border-gray-400/30",
};

export default function UsersPage() {
  const { data: usersList, refetch } = trpc.appUser.list.useQuery();
  const { data: departments } = trpc.department.list.useQuery();
  const { data: rolesList } = trpc.role.list.useQuery();
  const { success, error, confirmDelete } = useSweetAlert();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    appRole: "visualizador" as string,
    roleId: "",
    departmentId: "",
    password: "",
    avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const createMutation = trpc.appUser.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      resetForm();
      success("Utilizador criado com sucesso!");
    },
    onError: () => error("Erro ao criar utilizador"),
  });

  const updateMutation = trpc.appUser.update.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setEditingId(null);
      resetForm();
      success("Utilizador atualizado com sucesso!");
    },
    onError: () => error("Erro ao atualizar utilizador"),
  });

  const deleteMutation = trpc.appUser.delete.useMutation({
    onSuccess: () => {
      refetch();
      success("Utilizador eliminado com sucesso!");
    },
    onError: () => error("Erro ao eliminar utilizador"),
  });

  const resetForm = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      appRole: "visualizador",
      roleId: "",
      departmentId: "",
      password: "",
      avatar: "",
    });
    setAvatarPreview(null);
  };

  const handleEdit = (u: any) => {
    setForm({
      fullName: u.fullName,
      email: u.email,
      phone: u.phone || "",
      appRole: u.appRole,
      roleId: u.roleId ? String(u.roleId) : "",
      departmentId: u.departmentId ? String(u.departmentId) : "",
      password: "",
      avatar: u.avatar || "",
    });
    setAvatarPreview(u.avatar || null);
    setEditingId(u.id);
    setShowForm(true);
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        error("A imagem deve ter menos de 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setAvatarPreview(base64);
        setForm((prev) => ({ ...prev, avatar: base64 }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({
        id: editingId,
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        appRole: form.appRole as any,
        roleId: form.roleId ? Number(form.roleId) : undefined,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        avatar: form.avatar || undefined,
      });
    } else {
      createMutation.mutate({
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        appRole: form.appRole as any,
        roleId: form.roleId ? Number(form.roleId) : undefined,
        departmentId: form.departmentId ? Number(form.departmentId) : undefined,
        password: form.password || undefined,
        avatar: form.avatar || undefined,
      });
    }
  };

  const inputClass = "glass-input w-full px-4 py-2.5 text-sm";
  const labelClass = "block text-white/60 text-xs uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            UTILIZADORES
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Gerir utilizadores e atribuir perfis de acesso
          </p>
        </div>
        <button
          onClick={() => {
            setShowForm(true);
            setEditingId(null);
            resetForm();
          }}
          className="btn-3d px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Novo Utilizador
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              {editingId ? "Editar" : "Novo"} Utilizador
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Avatar Upload */}
            <div className="md:col-span-2 flex justify-center mb-4">
              <div className="relative">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-amber-400/50 bg-gradient-to-br from-amber-400/20 to-amber-600/20 flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircle className="w-12 h-12 text-white/40" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center hover:bg-amber-600 transition-all shadow-lg"
                >
                  <Camera className="w-4 h-4 text-white" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Nome Completo *</label>
              <input
                required
                value={form.fullName}
                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                className={inputClass}
                placeholder="Nome completo do utilizador"
              />
            </div>
            <div>
              <label className={labelClass}>E-mail *</label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputClass}
                placeholder="email@anac.ao"
              />
            </div>
            <div>
              <label className={labelClass}>Telefone</label>
              <input
                value={form.phone}
                placeholder="+244-999-999-999"
                onChange={(e) =>
                  setForm({ ...form, phone: formatPhone(e.target.value) })
                }
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Perfil de Acesso *</label>
              <select
                required
                value={form.appRole}
                onChange={(e) => setForm({ ...form, appRole: e.target.value })}
                className={inputClass}
              >
                {Object.entries(roleLabels).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Funcao</label>
              <select
                value={form.roleId}
                onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                className={inputClass}
              >
                <option value="">Selecionar funcao...</option>
                {rolesList?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Departamento</label>
              <select
                value={form.departmentId}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
                className={inputClass}
              >
                <option value="">Selecionar departamento...</option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
            {!editingId && (
              <div>
                <label className={labelClass}>Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  className={inputClass}
                  placeholder="Password inicial"
                />
              </div>
            )}
            <div className="md:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="btn-3d-secondary px-6 py-2.5 text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2"
              >
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full glass-table">
            <thead>
              <tr>
                <th>Utilizador</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Perfil</th>
                <th>Estado</th>
                <th>Acoes</th>
              </tr>
            </thead>
            <tbody>
              {usersList?.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.fullName}
                          className="w-9 h-9 rounded-full object-cover border border-amber-400/30"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-sm font-bold">
                          {(u.fullName || "U")[0]}
                        </div>
                      )}
                      <span className="text-white font-medium text-sm">
                        {u.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="text-xs text-white/70">{u.email}</td>
                  <td className="text-xs text-white/70">
                    {u.phone || "—"}
                  </td>
                  <td>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                        roleColors[u.appRole] || roleColors.visualizador
                      }`}
                    >
                      {roleLabels[u.appRole] || u.appRole}
                    </span>
                  </td>
                  <td>
                    {u.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-400 text-xs">
                        <Check className="w-3 h-3" /> Ativo
                      </span>
                    ) : (
                      <span className="text-red-400 text-xs">Inativo</span>
                    )}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(u)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={async () => {
                          if (await confirmDelete(u.fullName))
                            deleteMutation.mutate({ id: u.id });
                        }}
                        className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!usersList || usersList.length === 0) && (
                <tr>
                  <td colSpan={6} className="text-center text-white/40 py-12">
                    Nenhum utilizador registado
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
