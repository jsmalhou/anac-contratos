import { getDb } from "./queries/connection";
import { contracts, alerts } from "@db/schema";
import { eq, and, lte, gte, sql } from "drizzle-orm";

/**
 * Gera alertas automaticamente para contratos que:
 * 1. Já expiraram (endDate < hoje) -> alerta "expirado"
 * 2. Expiram em 30 dias -> alerta "renovacao_7"
 * 3. Expiram em 15 dias -> alerta "liquidacao_15"
 * 4. Expiram em 7 dias -> alerta "renovacao_7"
 * 5. Expiram em 3 dias -> alerta "critico_3"
 */
export async function generateAlerts() {
  const db = getDb();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const alertsGenerated = [];

  // 1. Contratos já expirados (endDate < hoje) e ainda ativos
  const expiredContracts = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      endDate: contracts.endDate,
      description: contracts.description,
    })
    .from(contracts)
    .where(
      and(
        eq(contracts.status, "ativo"),
        lte(contracts.endDate, sql`CURDATE()`)
      )
    );

  for (const c of expiredContracts) {
    // Verificar se já existe alerta para este contrato
    const existing = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.contractId, c.id),
          eq(alerts.alertType, "expirado")
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(alerts).values({
        contractId: c.id,
        alertType: "expirado",
        message: `O contrato ${c.contractNumber} terminou no dia ${new Date(c.endDate).toLocaleDateString("pt-PT")}. Estado: Expirado.`,
        status: "pendente",
      } as any);

      alertsGenerated.push({
        contractId: c.id,
        type: "expirado",
        message: `Contrato ${c.contractNumber} expirado!`,
      });
    }
  }

  // 2. Contratos que expiram em 30 dias
  const expiring30 = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      endDate: contracts.endDate,
    })
    .from(contracts)
    .where(
      and(
        eq(contracts.status, "ativo"),
        lte(contracts.endDate, sql`DATE_ADD(CURDATE(), INTERVAL 30 DAY)`),
        gte(contracts.endDate, sql`DATE_ADD(CURDATE(), INTERVAL 15 DAY)`)
      )
    );

  for (const c of expiring30) {
    const existing = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.contractId, c.id),
          eq(alerts.alertType, "pagamento_30")
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(alerts).values({
        contractId: c.id,
        alertType: "pagamento_30",
        message: `O contrato ${c.contractNumber} expira em 30 dias (${new Date(c.endDate).toLocaleDateString("pt-PT")}).`,
        status: "pendente",
      } as any);

      alertsGenerated.push({
        contractId: c.id,
        type: "pagamento_30",
        message: `Contrato ${c.contractNumber} expira em 30 dias!`,
      });
    }
  }

  // 3. Contratos que expiram em 7 dias
  const expiring7 = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      endDate: contracts.endDate,
    })
    .from(contracts)
    .where(
      and(
        eq(contracts.status, "ativo"),
        lte(contracts.endDate, sql`DATE_ADD(CURDATE(), INTERVAL 7 DAY)`),
        gte(contracts.endDate, sql`CURDATE()`)
      )
    );

  for (const c of expiring7) {
    const existing = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.contractId, c.id),
          eq(alerts.alertType, "renovacao_7")
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(alerts).values({
        contractId: c.id,
        alertType: "renovacao_7",
        message: `ALERTA: O contrato ${c.contractNumber} expira em 7 dias (${new Date(c.endDate).toLocaleDateString("pt-PT")})!`,
        status: "pendente",
      } as any);

      alertsGenerated.push({
        contractId: c.id,
        type: "renovacao_7",
        message: `Contrato ${c.contractNumber} expira em 7 dias!`,
      });
    }
  }

  // 4. Contratos que expiram em 3 dias (crítico)
  const expiring3 = await db
    .select({
      id: contracts.id,
      contractNumber: contracts.contractNumber,
      endDate: contracts.endDate,
    })
    .from(contracts)
    .where(
      and(
        eq(contracts.status, "ativo"),
        lte(contracts.endDate, sql`DATE_ADD(CURDATE(), INTERVAL 3 DAY)`),
        gte(contracts.endDate, sql`CURDATE()`)
      )
    );

  for (const c of expiring3) {
    const existing = await db
      .select()
      .from(alerts)
      .where(
        and(
          eq(alerts.contractId, c.id),
          eq(alerts.alertType, "critico_3")
        )
      )
      .limit(1);

    if (existing.length === 0) {
      await db.insert(alerts).values({
        contractId: c.id,
        alertType: "critico_3",
        message: `CRÍTICO: O contrato ${c.contractNumber} expira em 3 dias (${new Date(c.endDate).toLocaleDateString("pt-PT")})! Ação imediata necessária.`,
        status: "pendente",
      } as any);

      alertsGenerated.push({
        contractId: c.id,
        type: "critico_3",
        message: `Contrato ${c.contractNumber} expira em 3 dias!`,
      });
    }
  }

  return alertsGenerated;
}
