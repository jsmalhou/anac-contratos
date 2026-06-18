import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  Users,
} from "lucide-react";

export default function Departments() {
  const { data: departments, refetch } = trpc.department.list.useQuery();
  const { success, error, confirmDelete } = useSweetAlert();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({ name: "", budgetLimit: "", description: "" });

  const createMutation = trpc.department.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); resetForm(); success("Departamento criado!"); },
    onError: () => error("Erro ao criar departamento"),
  });

  const updateMutation = trpc.department.update.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setEditingId(null); resetForm(); success("Departamento atualizado!"); },
    onError: () => error("Erro ao atualizar"),
  });

  const deleteMutation = trpc.department.delete.useMutation({
    onSuccess: () => { refetch(); success("Departamento eliminado!"); },
    onError: () => error("Erro ao eliminar"),
  });

  const resetForm = () => setForm({ name: "", budgetLimit: "", description: "" });

  const handleEdit = (d: any) => {
    setForm({ name: d.name, budgetLimit: d.budgetLimit || "", description: d.description || "" });
    setEditingId(d.id);
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

  const formatKz = (v: string | null) => {
    if (!v) return "Kz 0";
    return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(parseFloat(v)).replace("AOA", "Kz");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">DEPARTAMENTOS</h1>
          <p className="text-white/50 text-sm mt-1">Gestão dos departamentos da ANAC</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="btn-3d px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Departamento
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{editingId ? "Editar" : "Novo"} Departamento</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">Nome *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">Limite Orçamental (Kz)</label>
              <input type="number" step="0.01" value={form.budgetLimit} onChange={(e) => setForm({ ...form, budgetLimit: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" placeholder="0.00" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">Descrição</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" rows={2} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-3d-secondary px-6 py-2.5 text-sm">Cancelar</button>
              <button type="submit" className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2"><Save className="w-4 h-4" /> Guardar</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {departments?.map((d) => (
          <div key={d.id} className="glass-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-400" />
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"><Pencil className="w-4 h-4" /></button>
                <button onClick={async () => { if (await confirmDelete(d.name)) deleteMutation.mutate({ id: d.id }); }} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <h3 className="text-white font-semibold mb-1">{d.name}</h3>
            <p className="text-white/50 text-xs mb-2">{d.description || "Sem descrição"}</p>
            <div className="flex items-center gap-2 text-xs text-white/40">
              <Users className="w-3 h-3" />
              <span>Limite: {formatKz(d.budgetLimit)}</span>
            </div>
          </div>
        ))}
        {(!departments || departments.length === 0) && (
          <div className="md:col-span-3 glass-card p-12 text-center text-white/40">Nenhum departamento registado</div>
        )}
      </div>
    </div>
  );
}
