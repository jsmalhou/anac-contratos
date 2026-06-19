import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useSweetAlert } from "@/hooks/useSweetAlert";
import { formatKzInput, parseKzValue, formatPhone } from "@/hooks/useFormat";
import { ArrowLeft, Save, FileText, Upload, X } from "lucide-react";

export default function NewContract() {
  const navigate = useNavigate();
  const { error } = useSweetAlert();
  const { data: suppliers } = trpc.supplier.list.useQuery();
  const { data: departments } = trpc.department.list.useQuery();
  const { data: usersList } = trpc.auth.usersList.useQuery();
  const { data: contractTypeList } = trpc.contractType.list.useQuery();

  const [activeTab, setActiveTab] = useState<"dados" | "documentos">("dados");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    contractNumber: "",
    contractType: "",
    description: "",
    totalValue: "",
    supplierId: "",
    signingDate: "",
    startDate: "",
    endDate: "",
    renewalDate: "",
    pcaId: "",
    departmentId: "",
    contractFile: "",
  });

  const createMutation = trpc.contract.create.useMutation({
    onSuccess: () => navigate("/contratos"),
    onError: (err) => error("Erro ao criar contrato: " + err.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      setUploadedFile(file);
      setForm({ ...form, contractFile: file.name });
    } else if (file) {
      error("Por favor selecione um ficheiro PDF válido");
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    setForm({ ...form, contractFile: "" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.contractNumber.trim()) { error("Número do contrato é obrigatório"); return; }
    if (!form.contractType) { error("Tipo de contrato é obrigatório"); return; }
    if (!form.supplierId) { error("Fornecedor é obrigatório"); return; }
    if (!form.pcaId) { error("PCA Responsável é obrigatório"); return; }
    if (!form.departmentId) { error("Departamento é obrigatório"); return; }
    
    const numericValue = parseKzValue(form.totalValue);
    
    createMutation.mutate({
      contractNumber: form.contractNumber.trim(),
      contractType: form.contractType as "aquisicao" | "servicos" | "obras" | "locacao" | "outros",
      description: form.description,
      totalValue: numericValue || "0",
      supplierId: Number(form.supplierId),
      pcaId: Number(form.pcaId),
      departmentId: Number(form.departmentId),
      signingDate: form.signingDate,
      startDate: form.startDate,
      endDate: form.endDate,
      renewalDate: form.renewalDate || undefined,
      createdBy: 1,
      contractFile: form.contractFile || undefined,
    });
  };

  const inputClass = "glass-input w-full px-4 py-2.5 text-sm";
  const labelClass = "block text-white/60 text-xs uppercase tracking-wider mb-1.5";

  return (
    <div className="space-y-6" style={{ maxWidth: "90%", margin: "0 auto" }}>
      <div className="flex items-center gap-4">
        <Link to="/contratos" className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">NOVO CONTRATO</h1>
          <p className="text-white/50 text-sm">Registar um novo contrato público</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-white/10 pb-0">
        <button onClick={() => setActiveTab("dados")} className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${activeTab === "dados" ? "bg-white/10 text-amber-400 border-t border-x border-white/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
          <FileText className="w-4 h-4" /> Dados do Contrato
        </button>
        <button onClick={() => setActiveTab("documentos")} className={`px-5 py-2.5 text-sm font-medium rounded-t-lg transition-all flex items-center gap-2 ${activeTab === "documentos" ? "bg-white/10 text-amber-400 border-t border-x border-white/10" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
          <Upload className="w-4 h-4" /> Documentos {uploadedFile && <span className="w-2 h-2 bg-emerald-400 rounded-full" />}
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
        {activeTab === "dados" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelClass}>Número do Contrato *</label>
              <input type="text" required placeholder="CNT-2025-001" value={form.contractNumber} onChange={(e) => setForm({ ...form, contractNumber: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Tipo de Contrato *</label>
              <select required value={form.contractType} onChange={(e) => setForm({ ...form, contractType: e.target.value })} className={inputClass}>
                <option value="">Selecionar tipo...</option>
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
              <textarea required rows={3} placeholder="Descrição detalhada do objeto do contrato..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Valor Total (Kz) *</label>
              <input
                type="text"
                required
                placeholder="0,00"
                value={form.totalValue}
                onChange={(e) => setForm({ ...form, totalValue: formatKzInput(e.target.value) })}
                className={inputClass}
              />
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
          </div>
        )}

        {activeTab === "documentos" && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-400" />
                Upload do Contrato (PDF)
              </h3>
              <p className="text-white/50 text-sm mb-4">Anexe o contrato assinado em formato PDF</p>
            </div>

            {!uploadedFile ? (
              <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-amber-400/50 hover:bg-white/5 transition-all">
                <Upload className="w-10 h-10 text-white/30 mb-3" />
                <p className="text-white/60 text-sm font-medium">Clique para selecionar o PDF</p>
                <p className="text-white/40 text-xs mt-1">Apenas ficheiros PDF (max. 10MB)</p>
                <input type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
              </label>
            ) : (
              <div className="glass-dark p-5 rounded-xl flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium text-sm">{uploadedFile.name}</p>
                  <p className="text-white/40 text-xs">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button type="button" onClick={removeFile} className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-400/10 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {form.contractFile && (
              <div className="glass-card p-4">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Ficheiro Anexado</p>
                <p className="text-amber-400 text-sm font-medium">{form.contractFile}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
          <button type="submit" disabled={createMutation.isPending} className="btn-3d px-6 py-2.5 text-sm flex items-center gap-2">
            <Save className="w-4 h-4" />
            {createMutation.isPending ? "A guardar..." : "Guardar Contrato"}
          </button>
          <Link to="/contratos" className="btn-3d-secondary px-6 py-2.5 text-sm">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
