import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import {
  Shield,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Check,
  XIcon,
} from "lucide-react";

export default function Roles() {
  const { data: rolesList, refetch } = trpc.role.list.useQuery();
  const { success, error, confirmDelete } = useSweetAlert();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    canInsert: 1,
    canUpdate: 1,
    canDelete: 0,
    canPrint: 1,
  });

  const createMutation = trpc.role.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); resetForm(); success("Função criada!"); },
    onError: () => error("Erro ao criar função"),
  });

  const updateMutation = trpc.role.update.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setEditingId(null); resetForm(); success("Função atualizada!"); },
    onError: () => error("Erro ao atualizar"),
  });

  const deleteMutation = trpc.role.delete.useMutation({
    onSuccess: () => { refetch(); success("Função eliminada!"); },
    onError: () => error("Erro ao eliminar"),
  });

  const resetForm = () => setForm({ name: "", description: "", canInsert: 1, canUpdate: 1, canDelete: 0, canPrint: 1 });

  const handleEdit = (r: any) => {
    setForm({
      name: r.name,
      description: r.description || "",
      canInsert: r.canInsert ?? 1,
      canUpdate: r.canUpdate ?? 1,
      canDelete: r.canDelete ?? 0,
      canPrint: r.canPrint ?? 1,
    });
    setEditingId(r.id);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, ...form });
    } else {
      createMutation.mutate(form);
    }
  };

  const PermIcon = ({ active }: { active: number }) =>
    active ? <Check className="w-4 h-4 text-emerald-400" /> : <XIcon className="w-4 h-4 text-red-400" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">FUNÇÕES</h1>
          <p className="text-white/50 text-sm mt-1">Gestão de funções e permissões de acesso</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="btn-3d px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Nova Função
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{editingId ? "Editar" : "Nova"} Função</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">Nome *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" />
              </div>
              <div>
                <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">Descrição</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-2">Permissões</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: "canInsert", label: "Inserir" },
                  { key: "canUpdate", label: "Modificar" },
                  { key: "canDelete", label: "Apagar" },
                  { key: "canPrint", label: "Imprimir" },
                ].map((perm) => (
                  <button
                    key={perm.key}
                    type="button"
                    onClick={() => setForm({ ...form, [perm.key]: form[perm.key as keyof typeof form] ? 0 : 1 })}
                    className={`p-3 rounded-lg border transition-all flex items-center justify-center gap-2 ${
                      form[perm.key as keyof typeof form]
                        ? "bg-emerald-500/20 border-emerald-400/40 text-emerald-400"
                        : "bg-red-500/10 border-red-400/20 text-red-400"
                    }`}
                  >
                    <PermIcon active={form[perm.key as keyof typeof form] as number} />
                    <span className="text-sm">{perm.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-3d-secondary px-6 py-2.5 text-sm">Cancelar</button>
              <button type="submit" className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full glass-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Inserir</th>
                <th>Modificar</th>
                <th>Apagar</th>
                <th>Imprimir</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {rolesList?.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-amber-400">{r.name}</td>
                  <td className="text-xs">{r.description || "—"}</td>
                  <td><PermIcon active={r.canInsert ?? 1} /></td>
                  <td><PermIcon active={r.canUpdate ?? 1} /></td>
                  <td><PermIcon active={r.canDelete ?? 0} /></td>
                  <td><PermIcon active={r.canPrint ?? 1} /></td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(r)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={async () => { if (await confirmDelete(r.name)) deleteMutation.mutate({ id: r.id }); }} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!rolesList || rolesList.length === 0) && (
                <tr><td colSpan={7} className="text-center text-white/40 py-12">Nenhuma função registada</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
