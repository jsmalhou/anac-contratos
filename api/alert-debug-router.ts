import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { contracts, alerts } from "@db/schema";
import { eq, and, lte, desc } from "drizzle-orm";
import { generateAlerts } from "./alert-generator";

export const alertDebugRouter = createRouter({
  // Forçar geração de alertas e retornar o que foi gerado
  forceGenerate: publicQuery.query(async () => {
    const generated = await generateAlerts();
    return {
      generated: generated.length,
      alerts: generated,
      timestamp: new Date().toISOString(),
    };
  }),

  // Verificar contratos expirados
  checkExpired: publicQuery.query(async () => {
    const db = getDb();
    const today = new Date().toISOString().split("T")[0];
    
    const expired = await db
      .select({
        id: contracts.id,
        contractNumber: contracts.contractNumber,
        endDate: contracts.endDate,
        status: contracts.status,
      })
      .from(contracts)
      .where(
        and(
          eq(contracts.status, "ativo"),
          lte(contracts.endDate, new Date())
        )
      );
    
    return {
      today,
      expiredCount: expired.length,
      expired,
    };
  }),

  // Listar todos os alertas com contractNumber
  listAll: publicQuery.query(async () => {
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
      .orderBy(desc(alerts.createdAt));
  }),
});
