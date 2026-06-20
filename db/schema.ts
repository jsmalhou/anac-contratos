import {
  mysqlTable,
  mysqlEnum,
  serial,
  varchar,
  text,
  timestamp,
  decimal,
  bigint,
  int,
  date,
  json,
} from "drizzle-orm/mysql-core";

// ─── Roles (Funções) ───
export const roles = mysqlTable("roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  canInsert: int("canInsert").default(1),
  canUpdate: int("canUpdate").default(1),
  canDelete: int("canDelete").default(0),
  canPrint: int("canPrint").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Role = typeof roles.$inferSelect;

// ─── Contract Types (Tipos de Contrato) ───
export const contractTypes = mysqlTable("contractTypes", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ContractType = typeof contractTypes.$inferSelect;

// ─── Users (auth + app users) ───
export const users = mysqlTable("users", {
  id: serial("id").primaryKey(),
  unionId: varchar("unionId", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 320 }),
  avatar: text("avatar"),
  phone: varchar("phone", { length: 50 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  appRole: mysqlEnum("appRole", [
    "admin",
    "pca",
    "finance_manager",
    "operator",
    "viewer",
  ]).default("viewer"),
  roleId: bigint("roleId", { mode: "number", unsigned: true }),
  departmentId: bigint("departmentId", {
    mode: "number",
    unsigned: true,
  }).default(0),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignInAt: timestamp("lastSignInAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── App Users (Utilizadores da aplicação - CRUD) ───
export const appUsers = mysqlTable("appUsers", {
  id: serial("id").primaryKey(),
  fullName: varchar("fullName", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  avatar: text("avatar"),
  password: varchar("password", { length: 255 }),
  appRole: mysqlEnum("appRole", [
    "admin",
    "pca",
    "gestor",
    "financeiro",
    "operador",
    "visualizador",
  ]).default("visualizador").notNull(),
  roleId: bigint("roleId", { mode: "number", unsigned: true }),
  departmentId: bigint("departmentId", {
    mode: "number",
    unsigned: true,
  }),
  isActive: int("isActive").default(1),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type AppUser = typeof appUsers.$inferSelect;

// ─── Departments ───
export const departments = mysqlTable("departments", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  budgetLimit: decimal("budgetLimit", { precision: 15, scale: 2 }).default(
    "0.00"
  ),
  description: text("description"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Department = typeof departments.$inferSelect;

// ─── Suppliers ───
export const suppliers = mysqlTable("suppliers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  nif: varchar("nif", { length: 50 }),
  address: text("address"),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 320 }),
  contactPerson: varchar("contactPerson", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Supplier = typeof suppliers.$inferSelect;

// ─── Contracts ───
export const contracts = mysqlTable("contracts", {
  id: serial("id").primaryKey(),
  contractNumber: varchar("contractNumber", { length: 100 }).notNull().unique(),
  contractType: varchar("contractType", { length: 100 }).notNull(),
  description: text("description"),
  totalValue: decimal("totalValue", { precision: 15, scale: 2 }).notNull(),
  paidValue: decimal("paidValue", { precision: 15, scale: 2 }).default("0.00"),
  supplierId: bigint("supplierId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  signingDate: date("signingDate").notNull(),
  startDate: date("startDate").notNull(),
  endDate: date("endDate").notNull(),
  renewalDate: date("renewalDate"),
  status: mysqlEnum("status", [
    "ativo",
    "concluido",
    "rescindido",
    "em_renovacao",
    "em_aditamento",
  ])
    .default("ativo")
    .notNull(),
  contractFile: varchar("contractFile", { length: 500 }),
  pcaId: bigint("pcaId", { mode: "number", unsigned: true }).notNull(),
  departmentId: bigint("departmentId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export type Contract = typeof contracts.$inferSelect;
export type InsertContract = typeof contracts.$inferInsert;

// ─── Amendments (Aditamentos) ───
export const amendments = mysqlTable("amendments", {
  id: serial("id").primaryKey(),
  contractId: bigint("contractId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  amendmentType: mysqlEnum("amendmentType", ["valor", "prazo", "objeto"])
    .notNull(),
  description: text("description"),
  valueChange: decimal("valueChange", { precision: 15, scale: 2 }).default(
    "0.00"
  ),
  newEndDate: date("newEndDate"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Amendment = typeof amendments.$inferSelect;

// ─── Payments ───
export const payments = mysqlTable("payments", {
  id: serial("id").primaryKey(),
  contractId: bigint("contractId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  amount: decimal("amount", { precision: 15, scale: 2 }).notNull(),
  paymentDate: date("paymentDate").notNull(),
  description: text("description"),
  createdBy: bigint("createdBy", { mode: "number", unsigned: true }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Payment = typeof payments.$inferSelect;

// ─── Alerts ───
export const alerts = mysqlTable("alerts", {
  id: serial("id").primaryKey(),
  contractId: bigint("contractId", {
    mode: "number",
    unsigned: true,
  }).notNull(),
  alertType: mysqlEnum("alertType", [
    "pagamento_30",
    "liquidacao_15",
    "renovacao_7",
    "critico_3",
    "irregularidade",
    "expirado",
  ]).notNull(),
  message: text("message"),
  status: mysqlEnum("status", ["pendente", "enviado", "lido"])
    .default("pendente")
    .notNull(),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Alert = typeof alerts.$inferSelect;

// ─── Email Logs ───
export const emailLogs = mysqlTable("emailLogs", {
  id: serial("id").primaryKey(),
  recipientEmail: varchar("recipientEmail", { length: 320 }).notNull(),
  recipientName: varchar("recipientName", { length: 255 }),
  subject: varchar("subject", { length: 500 }).notNull(),
  body: text("body"),
  alertType: mysqlEnum("alertType", [
    "pagamento_30",
    "liquidacao_15",
    "renovacao_7",
    "critico_3",
    "irregularidade",
    "expirado",
    "personalizado",
  ]).default("personalizado"),
  contractId: bigint("contractId", { mode: "number", unsigned: true }),
  status: mysqlEnum("status", ["pendente", "enviado", "erro"])
    .default("pendente")
    .notNull(),
  errorMessage: text("errorMessage"),
  sentAt: timestamp("sentAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type EmailLog = typeof emailLogs.$inferSelect;

// ─── Audit Log ───
export const auditLog = mysqlTable("auditLog", {
  id: serial("id").primaryKey(),
  userId: bigint("userId", { mode: "number", unsigned: true }),
  action: mysqlEnum("action", [
    "create",
    "update",
    "delete",
    "login",
    "logout",
    "export",
  ]).notNull(),
  entityType: varchar("entityType", { length: 50 }),
  entityId: varchar("entityId", { length: 50 }),
  details: json("details"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLog.$inferSelect;
