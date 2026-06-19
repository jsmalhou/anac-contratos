import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
} from "lucide-react";

export default function ContractTypes() {
  const { data: types, refetch } = trpc.contractType.list.useQuery();
  const { success, error, confirmDelete } = useSweetAlert();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({ code: "", name: "", description: "" });

  const createMutation = trpc.contractType.create.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); resetForm(); success("Tipo de contrato criado!"); },
    onError: () => error("Erro ao criar"),
  });

  const updateMutation = trpc.contractType.update.useMutation({
    onSuccess: () => { refetch(); setShowForm(false); setEditingId(null); resetForm(); success("Tipo de contrato atualizado!"); },
    onError: () => error("Erro ao atualizar"),
  });

  const deleteMutation = trpc.contractType.delete.useMutation({
    onSuccess: () => { refetch(); success("Tipo de contrato eliminado!"); },
    onError: () => error("Erro ao eliminar"),
  });

  const resetForm = () => setForm({ code: "", name: "", description: "" });

  const handleEdit = (t: any) => {
    setForm({ code: t.code, name: t.name, description: t.description || "" });
    setEditingId(t.id);
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

  const inputClass = "glass-input w-full px-4 py-2.5 text-sm";
  const labelClass = "block text-white/60 text-xs uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">TIPOS DE CONTRATO</h1>
          <p className="text-white/50 text-sm mt-1">Gerir os tipos de contrato disponíveis</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }} className="btn-3d px-5 py-2.5 text-sm flex items-center gap-2">
          <Plus className="w-4 h-4" /> Novo Tipo
        </button>
      </div>

      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">{editingId ? "Editar" : "Novo"} Tipo de Contrato</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"><X className="w-5 h-5" /></button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Código *</label>
              <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className={inputClass} placeholder="EX: AQUIS" />
            </div>
            <div>
              <label className={labelClass}>Nome *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} placeholder="Ex: Aquisição de Bens" />
            </div>
            <div>
              <label className={labelClass}>Descrição</label>
              <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} placeholder="Descrição opcional" />
            </div>
            <div className="md:col-span-3 flex justify-end gap-3">
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
                <th>Código</th>
                <th>Nome</th>
                <th>Descrição</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {types?.map((t) => (
                <tr key={t.id}>
                  <td className="font-mono text-amber-400 text-xs">{t.code}</td>
                  <td className="font-medium text-white">{t.name}</td>
                  <td className="text-xs text-white/50">{t.description || "—"}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(t)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all"><Pencil className="w-4 h-4" /></button>
                      <button onClick={async () => { if (await confirmDelete(t.name)) deleteMutation.mutate({ id: t.id }); }} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!types || types.length === 0) && (
                <tr><td colSpan={4} className="text-center text-white/40 py-12">Nenhum tipo de contrato registado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
