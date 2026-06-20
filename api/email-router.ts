import { z } from "zod";
import { createRouter, publicQuery } from "./middleware";
import { getDb } from "./queries/connection";
import { emailLogs, contracts, appUsers } from "@db/schema";
import { eq, desc, and, gte, lte } from "drizzle-orm";

// Email configuration - in production, use environment variables
const EMAIL_CONFIG = {
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: parseInt(process.env.SMTP_PORT || "587"),
  smtpUser: process.env.SMTP_USER || "",
  smtpPass: process.env.SMTP_PASS || "",
  fromEmail: process.env.FROM_EMAIL || "noreply@anac.ao",
  fromName: process.env.FROM_NAME || "ANAC - Gestao de Contratos",
};

async function sendEmailViaAPI(
  to: string,
  subject: string,
  htmlBody: string,
  textBody: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // For now, log the email attempt. In production, integrate with:
    // - SendGrid API
    // - Mailgun API
    // - AWS SES
    // - or any SMTP service
    console.log(`[EMAIL] To: ${to} | Subject: ${subject}`);
    
    // Example with a generic HTTP API endpoint:
    // const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${EMAIL_CONFIG.smtpPass}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     personalizations: [{ to: [{ email: to }] }],
    //     from: { email: EMAIL_CONFIG.fromEmail, name: EMAIL_CONFIG.fromName },
    //     subject,
    //     content: [
    //       { type: 'text/plain', value: textBody },
    //       { type: 'text/html', value: htmlBody },
    //     ],
    //   }),
    // });
    
    // Simulating success for now
    return { success: true };
  } catch (error: any) {
    console.error("[EMAIL ERROR]", error);
    return { success: false, error: error.message };
  }
}

function generateEmailTemplate(
  recipientName: string,
  contractNumber: string,
  contractDescription: string,
  alertType: string,
  message: string,
  daysRemaining?: number
): { html: string; text: string } {
  const alertTypeLabels: Record<string, string> = {
    pagamento_30: "Alerta de Pagamento - 30 dias",
    liquidacao_15: "Alerta de Liquidacao - 15 dias",
    renovacao_7: "Alerta de Renovacao - 7 dias",
    critico_3: "Alerta Critico - 3 dias",
    irregularidade: "Alerta de Irregularidade",
    expirado: "Contrato Expirado",
    personalizado: "Notificacao ANAC",
  };

  const urgencyColor = daysRemaining && daysRemaining <= 3 
    ? "#dc2626" 
    : daysRemaining && daysRemaining <= 7 
    ? "#f59e0b" 
    : "#2563eb";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #1e3a5f 0%, #0d2137 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h1 { margin: 0; font-size: 24px; }
    .content { background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0; }
    .alert-box { background: ${urgencyColor}15; border-left: 4px solid ${urgencyColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .alert-box h3 { color: ${urgencyColor}; margin-top: 0; }
    .contract-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .contract-info table { width: 100%; }
    .contract-info td { padding: 8px 0; }
    .contract-info td:first-child { font-weight: bold; color: #64748b; width: 40%; }
    .footer { text-align: center; padding: 20px; color: #94a3b8; font-size: 12px; }
    .btn { display: inline-block; background: #d97706; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ANAC Angola</h1>
      <p>Sistema de Gestao de Contratos</p>
    </div>
    <div class="content">
      <p>Exmo(a). <strong>${recipientName}</strong>,</p>
      
      <div class="alert-box">
        <h3>${alertTypeLabels[alertType] || alertType}</h3>
        <p>${message}</p>
        ${daysRemaining !== undefined ? `<p><strong>Dias restantes:</strong> ${daysRemaining}</p>` : ""}
      </div>
      
      <div class="contract-info">
        <h4>Informacoes do Contrato</h4>
        <table>
          <tr><td>Numero:</td><td>${contractNumber}</td></tr>
          <tr><td>Descricao:</td><td>${contractDescription}</td></tr>
        </table>
      </div>
      
      <p>Por favor, aceda ao sistema para mais detalhes e acoes necessarias.</p>
      
      <center>
        <a href="#" class="btn">Aceder ao Sistema</a>
      </center>
    </div>
    <div class="footer">
      <p>Este email foi enviado automaticamente pelo Sistema de Gestao de Contratos da ANAC.</p>
      <p>Para mais informacoes, contacte o departamento de TI.</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
ANAC ANGOLA - Sistema de Gestao de Contratos

Exmo(a). ${recipientName},

${alertTypeLabels[alertType] || alertType}
${message}
${daysRemaining !== undefined ? `Dias restantes: ${daysRemaining}` : ""}

Contrato: ${contractNumber}
Descricao: ${contractDescription}

Por favor, aceda ao sistema para mais detalhes.

---
Este email foi enviado automaticamente pelo Sistema de Gestao de Contratos da ANAC.
  `;

  return { html, text };
}

export const emailRouter = createRouter({
  // List all email logs
  list: publicQuery
    .input(
      z.object({
        status: z.enum(["pendente", "enviado", "erro"]).optional(),
        alertType: z.string().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }).optional()
    )
    .query(async ({ input }) => {
      const db = getDb();
      let query = db.select().from(emailLogs).orderBy(desc(emailLogs.createdAt));
      
      // Apply filters if provided
      if (input?.status) {
        return db
          .select()
          .from(emailLogs)
          .where(eq(emailLogs.status, input.status))
          .orderBy(desc(emailLogs.createdAt));
      }
      
      return query;
    }),

  // Send a single email
  send: publicQuery
    .input(
      z.object({
        recipientEmail: z.string().email(),
        recipientName: z.string().optional(),
        subject: z.string().min(1),
        body: z.string().optional(),
        alertType: z.enum([
          "pagamento_30",
          "liquidacao_15",
          "renovacao_7",
          "critico_3",
          "irregularidade",
          "expirado",
          "personalizado",
        ]).default("personalizado"),
        contractId: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      
      // Get contract info if contractId provided
      let contractInfo = { contractNumber: "N/A", description: "N/A" };
      if (input.contractId) {
        const [contract] = await db
          .select()
          .from(contracts)
          .where(eq(contracts.id, input.contractId));
        if (contract) {
          contractInfo = {
            contractNumber: contract.contractNumber,
            description: contract.description || "Sem descricao",
          };
        }
      }

      // Generate email template
      const { html, text } = generateEmailTemplate(
        input.recipientName || "Gestor de Contratos",
        contractInfo.contractNumber,
        contractInfo.description,
        input.alertType,
        input.body || "Por favor, verifique o estado do contrato.",
      );

      // Send email
      const result = await sendEmailViaAPI(
        input.recipientEmail,
        input.subject,
        html,
        text
      );

      // Log the email
      const logResult = await db.insert(emailLogs).values({
        recipientEmail: input.recipientEmail,
        recipientName: input.recipientName || null,
        subject: input.subject,
        body: input.body || null,
        alertType: input.alertType,
        contractId: input.contractId || null,
        status: result.success ? "enviado" : "erro",
        errorMessage: result.error || null,
        sentAt: result.success ? new Date() : null,
      } as any);

      return {
        success: result.success,
        logId: Number(logResult[0].insertId),
        error: result.error,
      };
    }),

  // Send bulk emails to contract managers
  sendBulk: publicQuery
    .input(
      z.object({
        contractIds: z.array(z.number()),
        subject: z.string().min(1),
        body: z.string().optional(),
        alertType: z.enum([
          "pagamento_30",
          "liquidacao_15",
          "renovacao_7",
          "critico_3",
          "irregularidade",
          "expirado",
          "personalizado",
        ]).default("personalizado"),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const results: Array<{
        contractId: number;
        success: boolean;
        recipient?: string;
        error?: string;
      }> = [];

      for (const contractId of input.contractIds) {
        // Get contract info
        const [contract] = await db
          .select()
          .from(contracts)
          .where(eq(contracts.id, contractId));

        if (!contract) {
          results.push({ contractId, success: false, error: "Contrato nao encontrado" });
          continue;
        }

        // Get PCA (contract manager) email
        const [manager] = await db
          .select()
          .from(appUsers)
          .where(eq(appUsers.id, Number(contract.pcaId)));

        const recipientEmail = manager?.email || contract.managerEmail;
        const recipientName = manager?.fullName || "Gestor de Contratos";

        if (!recipientEmail) {
          results.push({ contractId, success: false, error: "Email do gestor nao encontrado" });
          continue;
        }

        // Generate and send email
        const { html, text } = generateEmailTemplate(
          recipientName,
          contract.contractNumber,
          contract.description || "Sem descricao",
          input.alertType,
          input.body || `Por favor, verifique o estado do contrato ${contract.contractNumber}.`,
        );

        const sendResult = await sendEmailViaAPI(
          recipientEmail,
          input.subject,
          html,
          text
        );

        // Log email
        await db.insert(emailLogs).values({
          recipientEmail,
          recipientName,
          subject: input.subject,
          body: input.body || null,
          alertType: input.alertType,
          contractId,
          status: sendResult.success ? "enviado" : "erro",
          errorMessage: sendResult.error || null,
          sentAt: sendResult.success ? new Date() : null,
        } as any);

        results.push({
          contractId,
          success: sendResult.success,
          recipient: recipientEmail,
          error: sendResult.error,
        });
      }

      const successCount = results.filter((r) => r.success).length;
      return {
        total: input.contractIds.length,
        success: successCount,
        failed: input.contractIds.length - successCount,
        details: results,
      };
    }),

  // Get email statistics
  stats: publicQuery.query(async () => {
    const db = getDb();
    const allLogs = await db.select().from(emailLogs);
    
    const sent = allLogs.filter((l) => l.status === "enviado").length;
    const pending = allLogs.filter((l) => l.status === "pendente").length;
    const error = allLogs.filter((l) => l.status === "erro").length;
    
    // Group by alert type
    const byType: Record<string, number> = {};
    for (const log of allLogs) {
      const type = log.alertType || "personalizado";
      byType[type] = (byType[type] || 0) + 1;
    }
    
    return {
      total: allLogs.length,
      sent,
      pending,
      error,
      byType,
    };
  }),

  // Delete email log
  delete: publicQuery
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.delete(emailLogs).where(eq(emailLogs.id, input.id));
      return { success: true };
    }),
});
