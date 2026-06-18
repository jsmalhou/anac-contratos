// @ts-nocheck
import { getDb } from "../api/queries/connection";
import {
  departments,
  suppliers,
  users,
  contracts,
  payments,
  amendments,
  alerts,
} from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed departments
  await db.insert(departments).values([
    { name: "Direção Geral", budgetLimit: "500000000.00" },
    { name: "Departamento Financeiro", budgetLimit: "300000000.00" },
    { name: "Departamento de Operações", budgetLimit: "200000000.00" },
    { name: "Departamento Jurídico", budgetLimit: "100000000.00" },
    { name: "Departamento de Infraestruturas", budgetLimit: "400000000.00" },
  ]);
  console.log("Departments seeded");

  // Seed suppliers
  await db.insert(suppliers).values([
    {
      name: "Construções Angola, Lda",
      nif: "5000123456",
      address: "Luanda, Talatona",
      phone: "+244923456789",
      email: "contato@construcoesangola.ao",
    },
    {
      name: "TecnoServiços, S.A.",
      nif: "5000789012",
      address: "Luanda, Maianga",
      phone: "+244912345678",
      email: "geral@tecnoservicos.ao",
    },
    {
      name: "Fornecedores Gerais de Angola",
      nif: "5000345678",
      address: "Luanda, Kilamba",
      phone: "+244934567890",
      email: "vendas@fga.ao",
    },
    {
      name: "Aviação Civil Supplies",
      nif: "5000567890",
      address: "Luanda, Viana",
      phone: "+244945678901",
      email: "info@acsupplies.ao",
    },
    {
      name: "Segurança & Tecnologia, Lda",
      nif: "5000678901",
      address: "Luanda, Cazenga",
      phone: "+244956789012",
      email: "contacto@setec.ao",
    },
  ]);
  console.log("Suppliers seeded");

  // Seed users (app users with appRole) - skip if already exist
  const existingUsers = await db.select().from(users);
  if (existingUsers.length === 0) {
    await db.insert(users).values([
      {
        unionId: "anac_admin_001",
        name: "Administrador do Sistema",
        email: "admin@anac.ao",
        role: "admin",
        appRole: "admin",
        phone: "+244900000001",
        departmentId: 1,
        isActive: 1,
      },
      {
        unionId: "anac_pca_001",
        name: "Dr. Manuel dos Santos",
        email: "pca@anac.ao",
        role: "user",
        appRole: "pca",
        phone: "+244900000002",
        departmentId: 1,
        isActive: 1,
      },
      {
        unionId: "anac_fin_001",
        name: "Eng.ª Maria Fernandes",
        email: "financeiro@anac.ao",
        role: "user",
        appRole: "finance_manager",
        phone: "+244900000003",
        departmentId: 2,
        isActive: 1,
      },
      {
        unionId: "anac_op_001",
        name: "Carlos Mendes",
        email: "operacoes@anac.ao",
        role: "user",
        appRole: "operator",
        phone: "+244900000004",
        departmentId: 3,
        isActive: 1,
      },
    ]);
    console.log("Users seeded");
  } else {
    console.log("Users already exist, skipping");
  }

  // Seed contracts
  await db.insert(contracts).values([
    {
      contractNumber: "CNT-2024-001",
      contractType: "obras",
      description:
        "Construção da nova torre de controlo do aeroporto internacional 4 de Fevereiro",
      totalValue: "250000000.00",
      paidValue: "150000000.00",
      supplierId: 1,
      signingDate: "2024-01-15",
      startDate: "2024-02-01",
      endDate: "2025-06-30",
      renewalDate: null,
      status: "ativo",
      pcaId: 2,
      departmentId: 5,
      createdBy: 1,
    },
    {
      contractNumber: "CNT-2024-002",
      contractType: "servicos",
      description:
        "Prestação de serviços de consultoria em sistemas de navegação aérea",
      totalValue: "45000000.00",
      paidValue: "22500000.00",
      supplierId: 2,
      signingDate: "2024-03-10",
      startDate: "2024-04-01",
      endDate: "2025-03-31",
      renewalDate: "2025-03-01",
      status: "ativo",
      pcaId: 2,
      departmentId: 3,
      createdBy: 1,
    },
    {
      contractNumber: "CNT-2024-003",
      contractType: "aquisicao",
      description: "Aquisição de equipamentos de radar meteorológico",
      totalValue: "180000000.00",
      paidValue: "90000000.00",
      supplierId: 4,
      signingDate: "2024-05-20",
      startDate: "2024-06-01",
      endDate: "2025-05-31",
      renewalDate: null,
      status: "ativo",
      pcaId: 2,
      departmentId: 3,
      createdBy: 1,
    },
    {
      contractNumber: "CNT-2024-004",
      contractType: "servicos",
      description: "Manutenção preventiva dos sistemas de comunicação VHF",
      totalValue: "25000000.00",
      paidValue: "25000000.00",
      supplierId: 2,
      signingDate: "2024-02-01",
      startDate: "2024-02-01",
      endDate: "2025-01-31",
      renewalDate: null,
      status: "concluido",
      pcaId: 2,
      departmentId: 3,
      createdBy: 1,
    },
    {
      contractNumber: "CNT-2024-005",
      contractType: "aquisicao",
      description: "Aquisição de viaturas operacionais para inspeção aeroportuária",
      totalValue: "35000000.00",
      paidValue: "17500000.00",
      supplierId: 3,
      signingDate: "2024-06-15",
      startDate: "2024-07-01",
      endDate: "2025-06-15",
      renewalDate: null,
      status: "ativo",
      pcaId: 2,
      departmentId: 2,
      createdBy: 1,
    },
    {
      contractNumber: "CNT-2024-006",
      contractType: "locacao",
      description: "Arrendamento das instalações administrativas provisórias",
      totalValue: "15000000.00",
      paidValue: "10000000.00",
      supplierId: 3,
      signingDate: "2024-01-01",
      startDate: "2024-01-01",
      endDate: "2025-12-31",
      renewalDate: "2025-11-01",
      status: "ativo",
      pcaId: 2,
      departmentId: 1,
      createdBy: 1,
    },
    {
      contractNumber: "CNT-2024-007",
      contractType: "obras",
      description: "Reabilitação da pista principal do aeroporto de Lubango",
      totalValue: "320000000.00",
      paidValue: "96000000.00",
      supplierId: 1,
      signingDate: "2024-08-01",
      startDate: "2024-09-01",
      endDate: "2026-03-31",
      renewalDate: null,
      status: "ativo",
      pcaId: 2,
      departmentId: 5,
      createdBy: 1,
    },
    {
      contractNumber: "CNT-2024-008",
      contractType: "servicos",
      description: "Serviços de formação de controladores de tráfego aéreo",
      totalValue: "18000000.00",
      paidValue: "6000000.00",
      supplierId: 5,
      signingDate: "2024-09-15",
      startDate: "2024-10-01",
      endDate: "2025-09-30",
      renewalDate: null,
      status: "ativo",
      pcaId: 2,
      departmentId: 3,
      createdBy: 1,
    },
  ]);
  console.log("Contracts seeded");

  // Seed payments
  await db.insert(payments).values([
    {
      contractId: 1,
      amount: "50000000.00",
      paymentDate: "2024-02-15",
      description: "Primeira tranche - início das obras",
      createdBy: 3,
    },
    {
      contractId: 1,
      amount: "50000000.00",
      paymentDate: "2024-06-15",
      description: "Segunda tranche - fundações concluídas",
      createdBy: 3,
    },
    {
      contractId: 1,
      amount: "50000000.00",
      paymentDate: "2024-10-15",
      description: "Terceira tranche - estrutura principal",
      createdBy: 3,
    },
    {
      contractId: 2,
      amount: "22500000.00",
      paymentDate: "2024-04-15",
      description: "Pagamento semestral",
      createdBy: 3,
    },
    {
      contractId: 3,
      amount: "90000000.00",
      paymentDate: "2024-07-01",
      description: "Entrega e instalação dos equipamentos",
      createdBy: 3,
    },
  ]);
  console.log("Payments seeded");

  // Seed amendments
  await db.insert(amendments).values([
    {
      contractId: 1,
      amendmentType: "prazo",
      description: "Prorrogação de 3 meses devido a condições climatéricas",
      valueChange: "0.00",
      newEndDate: "2025-06-30",
      createdBy: 2,
    },
    {
      contractId: 3,
      amendmentType: "valor",
      description: "Adição de módulo de previsão meteorológica avançada",
      valueChange: "30000000.00",
      createdBy: 2,
    },
  ]);
  console.log("Amendments seeded");

  // Seed alerts
  await db.insert(alerts).values([
    {
      contractId: 2,
      alertType: "renovacao_7",
      message:
        "O contrato CNT-2024-002 está a 7 dias do prazo de renovação.",
      status: "pendente",
    },
    {
      contractId: 5,
      alertType: "pagamento_30",
      message:
        "O contrato CNT-2024-005 tem pagamento pendente nos próximos 30 dias.",
      status: "pendente",
    },
    {
      contractId: 8,
      alertType: "liquidacao_15",
      message:
        "O contrato CNT-2024-008 requer atenção para liquidação em 15 dias.",
      status: "enviado",
    },
  ]);
  console.log("Alerts seeded");

  console.log("Seed completed successfully!");
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
