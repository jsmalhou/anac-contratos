import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import {
  contracts,
  payments,
  amendments,
  suppliers,
  departments,
  alerts,
  auditLog,
  users,
  roles,
} from "@db/schema";
import { eq, desc, like, and, lte, sql, count } from "drizzle-orm";

export const contractRouter = createRouter({
  list: publicQuery
    .input(
      z
        .object({
          search: z.string().optional(),
          status: z.string().optional(),
          type: z.string().optional(),
          departmentId: z.number().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      const conditions = [];

      if (input?.search) {
        conditions.push(like(contracts.contractNumber, `%${input.search}%`));
      }
      if (input?.status) {
        conditions.push(eq(contracts.status, input.status as any));
      }
      if (input?.type) {
        conditions.push(eq(contracts.contractType, input.type as any));
      }
      if (input?.departmentId) {
        conditions.push(eq(contracts.departmentId, input.departmentId));
      }

      const where = conditions.length > 0 ? and(...conditions) : undefined;

      const results = await db
        .select({
          id: contracts.id,
          contractNumber: contracts.contractNumber,
          contractType: contracts.contractType,
          description: contracts.description,
          totalValue: contracts.totalValue,
          paidValue: contracts.paidValue,
          status: contracts.status,
          signingDate: contracts.signingDate,
          endDate: contracts.endDate,
          supplierName: suppliers.name,
          departmentName: departments.name,
          pcaName: users.name,
          createdAt: contracts.createdAt,
        })
        .from(contracts)
        .leftJoin(suppliers, eq(contracts.supplierId, suppliers.id))
        .leftJoin(departments, eq(contracts.departmentId, departments.id))
        .leftJoin(users, eq(contracts.pcaId, users.id))
        .where(where)
        .orderBy(desc(contracts.createdAt));

      return results;
    }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();

      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, input.id));

      if (!contract) return null;

      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, contract.supplierId));

      const [department] = await db
        .select()
        .from(departments)
        .where(eq(departments.id, contract.departmentId));

      const [pca] = await db
        .select()
        .from(users)
        .where(eq(users.id, contract.pcaId));

      const paymentsList = await db
        .select()
        .from(payments)
        .where(eq(payments.contractId, input.id))
        .orderBy(desc(payments.paymentDate));

      const amendmentsList = await db
        .select()
        .from(amendments)
        .where(eq(amendments.contractId, input.id))
        .orderBy(desc(amendments.createdAt));

      return {
        ...contract,
        supplier,
        department,
        pca,
        payments: paymentsList,
        amendments: amendmentsList,
      };
    }),

  create: publicQuery
    .input(
      z.object({
        contractNumber: z.string().min(1),
        contractType: z.enum([
          "aquisicao",
          "servicos",
          "obras",
          "locacao",
          "outros",
        ]),
        description: z.string().optional(),
        totalValue: z.string(),
        supplierId: z.number(),
        signingDate: z.string(),
        startDate: z.string(),
        endDate: z.string(),
        renewalDate: z.string().optional(),
        pcaId: z.number(),
        departmentId: z.number(),
        createdBy: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(contracts).values({
        contractNumber: input.contractNumber,
        contractType: input.contractType,
        description: input.description,
        totalValue: input.totalValue,
        paidValue: "0.00",
        supplierId: input.supplierId,
        signingDate: new Date(input.signingDate),
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
        renewalDate: input.renewalDate ? new Date(input.renewalDate) : null,
        status: "ativo",
        pcaId: input.pcaId,
        departmentId: input.departmentId,
        createdBy: input.createdBy,
      } as any);

      await db.insert(auditLog).values({
        action: "create",
        entityType: "contract",
        entityId: String(result[0].insertId),
        details: { contractNumber: input.contractNumber },
      } as any);

      return { id: result[0].insertId };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        contractNumber: z.string().min(1).optional(),
        contractType: z
          .enum(["aquisicao", "servicos", "obras", "locacao", "outros"])
          .optional(),
        description: z.string().optional(),
        totalValue: z.string().optional(),
        supplierId: z.number().optional(),
        departmentId: z.number().optional(),
        pcaId: z.number().optional(),
        signingDate: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        renewalDate: z.string().optional(),
        status: z
          .enum([
            "ativo",
            "concluido",
            "rescindido",
            "em_renovacao",
            "em_aditamento",
          ])
          .optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      const updateData: any = { ...data };
      if (data.signingDate) updateData.signingDate = new Date(data.signingDate);
      if (data.startDate) updateData.startDate = new Date(data.startDate);
      if (data.endDate) updateData.endDate = new Date(data.endDate);
      if (data.renewalDate) updateData.renewalDate = new Date(data.renewalDate);
      await db.update(contracts).set(updateData).where(eq(contracts.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(contracts).where(eq(contracts.id, input.id));
      return { success: true };
    }),

  addPayment: publicQuery
    .input(
      z.object({
        contractId: z.number(),
        amount: z.string(),
        paymentDate: z.string(),
        description: z.string().optional(),
        createdBy: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(payments).values({
        contractId: input.contractId,
        amount: input.amount,
        paymentDate: new Date(input.paymentDate),
        description: input.description,
        createdBy: input.createdBy,
      } as any);

      const [contract] = await db
        .select()
        .from(contracts)
        .where(eq(contracts.id, input.contractId));

      if (contract) {
        const currentPaid = parseFloat(contract.paidValue || "0");
        const newPaid = currentPaid + parseFloat(input.amount);
        await db
          .update(contracts)
          .set({ paidValue: newPaid.toFixed(2) })
          .where(eq(contracts.id, input.contractId));
      }

      return { success: true };
    }),

  addAmendment: publicQuery
    .input(
      z.object({
        contractId: z.number(),
        amendmentType: z.enum(["valor", "prazo", "objeto"]),
        description: z.string().optional(),
        valueChange: z.string().optional(),
        newEndDate: z.string().optional(),
        createdBy: z.number(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.insert(amendments).values({
        contractId: input.contractId,
        amendmentType: input.amendmentType,
        description: input.description,
        valueChange: input.valueChange,
        newEndDate: input.newEndDate ? new Date(input.newEndDate) : null,
        createdBy: input.createdBy,
      } as any);

      if (input.valueChange) {
        const [contract] = await db
          .select()
          .from(contracts)
          .where(eq(contracts.id, input.contractId));
        if (contract) {
          const newTotal =
            parseFloat(contract.totalValue) + parseFloat(input.valueChange);
          await db
            .update(contracts)
            .set({
              totalValue: newTotal.toFixed(2),
              status: "em_aditamento",
            })
            .where(eq(contracts.id, input.contractId));
        }
      }

      return { success: true };
    }),
});

export const dashboardRouter = createRouter({
  kpis: publicQuery.query(async () => {
    const db = getDb();

    const [totalContracts] = await db
      .select({ count: count() })
      .from(contracts);

    const [activeContracts] = await db
      .select({ count: count() })
      .from(contracts)
      .where(eq(contracts.status, "ativo"));

    const [totalValueResult] = await db
      .select({ total: sql<string>`SUM(${contracts.totalValue})` })
      .from(contracts);

    const [paidValueResult] = await db
      .select({ total: sql<string>`SUM(${contracts.paidValue})` })
      .from(contracts);

    const [expiringContracts] = await db
      .select({ count: count() })
      .from(contracts)
      .where(
        and(
          eq(contracts.status, "ativo"),
          lte(
            contracts.endDate,
            sql`DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
          )
        )
      );

    const totalVal = parseFloat(totalValueResult?.total || "0");
    const paidVal = parseFloat(paidValueResult?.total || "0");

    return {
      totalContracts: totalContracts.count,
      activeContracts: activeContracts.count,
      totalValue: totalVal.toFixed(2),
      paidValue: paidVal.toFixed(2),
      pendingValue: (totalVal - paidVal).toFixed(2),
      expiringContracts: expiringContracts.count,
    };
  }),

  charts: publicQuery.query(async () => {
    const db = getDb();

    const byType = await db
      .select({
        type: contracts.contractType,
        count: count(),
      })
      .from(contracts)
      .groupBy(contracts.contractType);

    const byStatus = await db
      .select({
        status: contracts.status,
        count: count(),
      })
      .from(contracts)
      .groupBy(contracts.status);

    const recent = await db
      .select({
        month: sql<string>`DATE_FORMAT(${contracts.createdAt}, '%Y-%m')`,
        count: count(),
      })
      .from(contracts)
      .groupBy(sql`DATE_FORMAT(${contracts.createdAt}, '%Y-%m')`)
      .orderBy(desc(sql`DATE_FORMAT(${contracts.createdAt}, '%Y-%m')`))
      .limit(6);

    return { byType, byStatus, recent };
  }),

  recentContracts: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        contractType: contracts.contractType,
        totalValue: contracts.totalValue,
        status: contracts.status,
        endDate: contracts.endDate,
        supplierName: suppliers.name,
      })
      .from(contracts)
      .leftJoin(suppliers, eq(contracts.supplierId, suppliers.id))
      .orderBy(desc(contracts.createdAt))
      .limit(10);
  }),

  expiringContracts: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        description: contracts.description,
        endDate: contracts.endDate,
        totalValue: contracts.totalValue,
        supplierName: suppliers.name,
      })
      .from(contracts)
      .leftJoin(suppliers, eq(contracts.supplierId, suppliers.id))
      .where(
        and(
          eq(contracts.status, "ativo"),
          lte(
            contracts.endDate,
            sql`DATE_ADD(CURDATE(), INTERVAL 30 DAY)`
          )
        )
      )
      .orderBy(contracts.endDate);
  }),
});

export const supplierRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(suppliers).orderBy(suppliers.name);
  }),

  getById: publicQuery
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = getDb();
      const [result] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, input.id));
      return result || null;
    }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        nif: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        contactPerson: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(suppliers).values(input);
      return { id: result[0].insertId };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        nif: z.string().optional(),
        address: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        contactPerson: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(suppliers).set(data).where(eq(suppliers.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(suppliers).where(eq(suppliers.id, input.id));
      return { success: true };
    }),
});

export const departmentRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(departments).orderBy(departments.name);
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        budgetLimit: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(departments).values({
        name: input.name,
        budgetLimit: input.budgetLimit || "0.00",
        description: input.description,
      });
      return { id: result[0].insertId };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        budgetLimit: z.string().optional(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(departments).set(data).where(eq(departments.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(departments).where(eq(departments.id, input.id));
      return { success: true };
    }),
});

export const roleRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db.select().from(roles).orderBy(roles.name);
  }),

  create: publicQuery
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        canInsert: z.number().default(1),
        canUpdate: z.number().default(1),
        canDelete: z.number().default(0),
        canPrint: z.number().default(1),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(roles).values(input);
      return { id: result[0].insertId };
    }),

  update: publicQuery
    .input(
      z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        description: z.string().optional(),
        canInsert: z.number().optional(),
        canUpdate: z.number().optional(),
        canDelete: z.number().optional(),
        canPrint: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const { id, ...data } = input;
      await db.update(roles).set(data).where(eq(roles.id, id));
      return { success: true };
    }),

  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(roles).where(eq(roles.id, input.id));
      return { success: true };
    }),
});

export const alertRouter = createRouter({
  list: publicQuery.query(async () => {
    const db = getDb();
    return db
      .select({
        id: alerts.id,
        contractId: alerts.contractId,
        alertType: alerts.alertType,
        message: alerts.message,
        status: alerts.status,
        createdAt: alerts.createdAt,
        contractNumber: contracts.contractNumber,
      })
      .from(alerts)
      .leftJoin(contracts, eq(alerts.contractId, contracts.id))
      .orderBy(desc(alerts.createdAt))
      .limit(50);
  }),

  markAsRead: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db
        .update(alerts)
        .set({ status: "lido" })
        .where(eq(alerts.id, input.id));
      return { success: true };
    }),
});
