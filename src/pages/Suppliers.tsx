import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { formatPhone } from "@/hooks/useFormat";
import {
  Building2,
  Plus,
  Search,
  Pencil,
  Trash2,
  X,
  Save,
  Phone,
  Mail,
  MapPin,
  User,
} from "lucide-react";

export default function Suppliers() {
  const { data: suppliers, refetch } = trpc.supplier.list.useQuery();
  const { success, error, confirmDelete } = useSweetAlert();
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    name: "",
    nif: "",
    address: "",
    phone: "",
    email: "",
    contactPerson: "",
  });

  const createMutation = trpc.supplier.create.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      resetForm();
      success("Fornecedor criado com sucesso!");
    },
    onError: () => error("Erro ao criar fornecedor"),
  });

  const updateMutation = trpc.supplier.update.useMutation({
    onSuccess: () => {
      refetch();
      setShowForm(false);
      setEditingId(null);
      resetForm();
      success("Fornecedor atualizado com sucesso!");
    },
    onError: () => error("Erro ao atualizar fornecedor"),
  });

  const deleteMutation = trpc.supplier.delete.useMutation({
    onSuccess: () => {
      refetch();
      success("Fornecedor eliminado com sucesso!");
    },
    onError: () => error("Erro ao eliminar fornecedor"),
  });

  const resetForm = () => {
    setForm({ name: "", nif: "", address: "", phone: "", email: "", contactPerson: "" });
  };

  const handleEdit = (s: any) => {
    setForm({
      name: s.name,
      nif: s.nif || "",
      address: s.address || "",
      phone: s.phone || "",
      email: s.email || "",
      contactPerson: s.contactPerson || "",
    });
    setEditingId(s.id);
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

  const handleDelete = async (s: any) => {
    if (await confirmDelete(s.name)) {
      deleteMutation.mutate({ id: s.id });
    }
  };

  const filtered = suppliers?.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.nif || "").includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            FORNECEDORES
          </h1>
          <p className="text-white/50 text-sm mt-1">
            Gestão de fornecedores e entidades contratadas
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingId(null); resetForm(); }}
          className="btn-3d px-5 py-2.5 text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Novo Fornecedor
        </button>
      </div>

      {/* Search */}
      <div className="glass-card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Pesquisar por nome ou NIF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="glass-input w-full pl-10 pr-4 py-2.5 text-sm"
          />
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">
              {editingId ? "Editar Fornecedor" : "Novo Fornecedor"}
            </h3>
            <button
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">Nome *</label>
              <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5">NIF</label>
              <input value={form.nif} onChange={(e) => setForm({ ...form, nif: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1"><Phone className="w-3 h-3" />Telefone</label>
              <input value={form.phone} placeholder="+244-999-999-999" onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1"><Mail className="w-3 h-3" />Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div>
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1"><User className="w-3 h-3" />Pessoa de Contacto</label>
              <input value={form.contactPerson} onChange={(e) => setForm({ ...form, contactPerson: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-white/60 text-xs uppercase tracking-wider mb-1.5 flex items-center gap-1"><MapPin className="w-3 h-3" />Morada</label>
              <textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="glass-input w-full px-4 py-2.5 text-sm" rows={2} />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="btn-3d-secondary px-6 py-2.5 text-sm">Cancelar</button>
              <button type="submit" className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2">
                <Save className="w-4 h-4" /> Guardar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full glass-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>NIF</th>
                <th>Telefone</th>
                <th>Email</th>
                <th>Pessoa de Contacto</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered?.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium text-amber-400">{s.name}</td>
                  <td className="text-xs">{s.nif || "—"}</td>
                  <td className="text-xs">{s.phone || "—"}</td>
                  <td className="text-xs">{s.email || "—"}</td>
                  <td className="text-xs">{s.contactPerson || "—"}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg text-white/40 hover:text-blue-400 hover:bg-white/5 transition-all">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s)} className="p-1.5 rounded-lg text-white/40 hover:text-red-400 hover:bg-white/5 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {(!filtered || filtered.length === 0) && (
                <tr><td colSpan={6} className="text-center text-white/40 py-12">Nenhum fornecedor encontrado</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
