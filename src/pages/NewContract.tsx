import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { ArrowLeft, Save } from "lucide-react";

const typeOptions = [
  { value: "aquisicao", label: "Aquisição de Bens" },
  { value: "servicos", label: "Prestação de Serviços" },
  { value: "obras", label: "Obras Públicas" },
  { value: "locacao", label: "Locação" },
  { value: "outros", label: "Outros" },
];

export default function NewContract() {
  const navigate = useNavigate();
  const { data: suppliers } = trpc.supplier.list.useQuery();
  const { data: departments } = trpc.department.list.useQuery();
  const { data: usersList } = trpc.auth.usersList.useQuery();

  const createMutation = trpc.contract.create.useMutation({
    onSuccess: () => navigate("/contratos"),
  });

  const [form, setForm] = useState({
    contractNumber: "",
    contractType: "aquisicao",
    description: "",
    totalValue: "",
    supplierId: "",
    signingDate: "",
    startDate: "",
    endDate: "",
    renewalDate: "",
    pcaId: "",
    departmentId: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      contractNumber: form.contractNumber,
      contractType: form.contractType as "aquisicao" | "servicos" | "obras" | "locacao" | "outros",
      description: form.description,
      totalValue: form.totalValue,
      supplierId: Number(form.supplierId),
      pcaId: Number(form.pcaId),
      departmentId: Number(form.departmentId),
      signingDate: form.signingDate,
      startDate: form.startDate,
      endDate: form.endDate,
      renewalDate: form.renewalDate || undefined,
      createdBy: 1,
    });
  };

  const inputClass = "glass-input w-full px-4 py-2.5 text-sm";
  const labelClass = "block text-white/60 text-xs uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/contratos"
          className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            NOVO CONTRATO
          </h1>
          <p className="text-white/50 text-sm">
            Registar um novo contrato público
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Contract Number */}
          <div>
            <label className={labelClass}>Número do Contrato *</label>
            <input
              type="text"
              required
              placeholder="CNT-2025-001"
              value={form.contractNumber}
              onChange={(e) =>
                setForm({ ...form, contractNumber: e.target.value })
              }
              className={inputClass}
            />
          </div>

          {/* Type */}
          <div>
            <label className={labelClass}>Tipo de Contrato *</label>
            <select
              value={form.contractType}
              onChange={(e) =>
                setForm({ ...form, contractType: e.target.value })
              }
              className={inputClass}
            >
              {typeOptions.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className={labelClass}>Objeto do Contrato *</label>
            <textarea
              required
              rows={3}
              placeholder="Descrição detalhada do objeto do contrato..."
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              className={inputClass}
            />
          </div>

          {/* Total Value */}
          <div>
            <label className={labelClass}>Valor Total (Kz) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="0.00"
              value={form.totalValue}
              onChange={(e) =>
                setForm({ ...form, totalValue: e.target.value })
              }
              className={inputClass}
            />
          </div>

          {/* Supplier */}
          <div>
            <label className={labelClass}>Fornecedor *</label>
            <select
              required
              value={form.supplierId}
              onChange={(e) =>
                setForm({ ...form, supplierId: e.target.value })
              }
              className={inputClass}
            >
              <option value="">Selecionar...</option>
              {suppliers?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div>
            <label className={labelClass}>Data de Assinatura *</label>
            <input
              type="date"
              required
              value={form.signingDate}
              onChange={(e) =>
                setForm({ ...form, signingDate: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Data de Início *</label>
            <input
              type="date"
              required
              value={form.startDate}
              onChange={(e) =>
                setForm({ ...form, startDate: e.target.value })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Data de Término *</label>
            <input
              type="date"
              required
              value={form.endDate}
              onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Data de Renovação</label>
            <input
              type="date"
              value={form.renewalDate}
              onChange={(e) =>
                setForm({ ...form, renewalDate: e.target.value })
              }
              className={inputClass}
            />
          </div>

          {/* PCA */}
          <div>
            <label className={labelClass}>PCA Responsável *</label>
            <select
              required
              value={form.pcaId}
              onChange={(e) => setForm({ ...form, pcaId: e.target.value })}
              className={inputClass}
            >
              <option value="">Selecionar...</option>
              {usersList?.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div>
            <label className={labelClass}>Departamento *</label>
            <select
              required
              value={form.departmentId}
              onChange={(e) =>
                setForm({ ...form, departmentId: e.target.value })
              }
              className={inputClass}
            >
              <option value="">Selecionar...</option>
              {departments?.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {createMutation.isPending ? "A guardar..." : "Guardar Contrato"}
          </button>
          <Link
            to="/contratos"
            className="btn-3d-secondary px-6 py-2.5 text-sm"
          >
            Cancelar
          </Link>
        </div>
      </form>
    </div>
  );
}
