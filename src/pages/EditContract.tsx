import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { formatKzInput, parseKzValue } from "@/hooks/useFormat";
import { ArrowLeft, Save } from "lucide-react";

const statusOptions = [
  { value: "ativo", label: "Ativo" },
  { value: "concluido", label: "Concluído" },
  { value: "rescindido", label: "Rescindido" },
  { value: "em_renovacao", label: "Em Renovação" },
  { value: "em_aditamento", label: "Em Aditamento" },
];

export default function EditContract() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { success, error } = useSweetAlert();

  const { data: contract } = trpc.contract.getById.useQuery(
    { id: Number(id) },
    { enabled: !!id }
  );
  const { data: suppliers } = trpc.supplier.list.useQuery();
  const { data: departments } = trpc.department.list.useQuery();
  const { data: usersList } = trpc.auth.usersList.useQuery();
  const { data: contractTypeList } = trpc.contractType.list.useQuery();

  const updateMutation = trpc.contract.update.useMutation({
    onSuccess: () => {
      success("Contrato atualizado com sucesso!");
      navigate(`/contratos/${id}`);
    },
    onError: () => error("Erro ao atualizar contrato"),
  });

  const [form, setForm] = useState({
    contractNumber: "",
    contractType: "aquisicao",
    description: "",
    totalValue: "",
    supplierId: "",
    departmentId: "",
    pcaId: "",
    signingDate: "",
    startDate: "",
    endDate: "",
    renewalDate: "",
    status: "ativo",
  });

  useEffect(() => {
    if (contract) {
      setForm({
        contractNumber: contract.contractNumber,
        contractType: contract.contractType,
        description: contract.description || "",
        totalValue: formatKzInput(String(contract.totalValue)),
        supplierId: String(contract.supplierId),
        departmentId: String(contract.departmentId),
        pcaId: String(contract.pcaId),
        signingDate: formatDate(contract.signingDate),
        startDate: formatDate(contract.startDate),
        endDate: formatDate(contract.endDate),
        renewalDate: contract.renewalDate ? formatDate(contract.renewalDate) : "",
        status: contract.status,
      });
    }
  }, [contract]);

  const formatDate = (d: string | Date | null) => {
    if (!d) return "";
    const date = typeof d === "string" ? new Date(d) : d;
    return date.toISOString().split("T")[0];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      id: Number(id),
      contractNumber: form.contractNumber,
      contractType: form.contractType as any,
      description: form.description,
      totalValue: parseKzValue(form.totalValue),
      supplierId: Number(form.supplierId),
      departmentId: Number(form.departmentId),
      pcaId: Number(form.pcaId),
      signingDate: form.signingDate,
      startDate: form.startDate,
      endDate: form.endDate,
      renewalDate: form.renewalDate || undefined,
      status: form.status as any,
    });
  };

  const inputClass = "glass-input w-full px-4 py-2.5 text-sm";
  const labelClass = "block text-white/60 text-xs uppercase tracking-wider mb-1.5";

  if (!contract) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-white/50">A carregar...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6" style={{ maxWidth: "90%", margin: "0 auto" }}>
      <div className="flex items-center gap-4">
        <Link to={`/contratos/${id}`} className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">EDITAR CONTRATO</h1>
          <p className="text-white/50 text-sm">{form.contractNumber}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className={labelClass}>Número do Contrato *</label>
            <input required value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Tipo de Contrato *</label>
            <select value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })} className={inputClass}>
              {contractTypeList?.map((t) => (
                <option key={t.id} value={t.code.toLowerCase()}>{t.name}</option>
              ))}
              {!contractTypeList?.length && (
                <>
                  <option value="aquisicao">Aquisição de Bens</option>
                  <option value="servicos">Prestação de Serviços</option>
                  <option value="obras">Obras Públicas</option>
                  <option value="locacao">Locação</option>
                  <option value="outros">Outros</option>
                </>
              )}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className={labelClass}>Objeto do Contrato *</label>
            <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Valor Total (Kz) *</label>
            <input type="text" required value={form.totalValue} onChange={(e) => setForm({ ...form, totalValue: formatKzInput(e.target.value) })} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>Fornecedor *</label>
            <select required value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} className={inputClass}>
              <option value="">Selecionar...</option>
              {suppliers?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Data de Assinatura *</label>
            <input type="date" required value={form.signingDate} onChange={(e) => setForm({ ...form, signingDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de Início *</label>
            <input type="date" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de Término *</label>
            <input type="date" required value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Data de Renovação</label>
            <input type="date" value={form.renewalDate} onChange={(e) => setForm({ ...form, renewalDate: e.target.value })} className={inputClass} />
          </div>

          <div>
            <label className={labelClass}>PCA Responsável *</label>
            <select required value={form.pcaId} onChange={(e) => setForm({ ...form, pcaId: e.target.value })} className={inputClass}>
              <option value="">Selecionar...</option>
              {usersList?.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Departamento *</label>
            <select required value={form.departmentId} onChange={(e) => setForm({ ...form, departmentId: e.target.value })} className={inputClass}>
              <option value="">Selecionar...</option>
              {departments?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>

          <div>
            <label className={labelClass}>Estado</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={inputClass}>
              {statusOptions.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <button type="submit" disabled={updateMutation.isPending} className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {updateMutation.isPending ? "A guardar..." : "Guardar Alterações"}
          </button>
          <Link to={`/contratos/${id}`} className="btn-3d-secondary px-6 py-2.5 text-sm">Cancelar</Link>
        </div>
      </form>
    </div>
  );
} 