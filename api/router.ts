import { authRouter } from "./auth-router";
import {
  contractRouter,
  dashboardRouter,
  supplierRouter,
  departmentRouter,
  alertRouter,
  roleRouter,
  contractTypeRouter,
} from "./contract-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  contract: contractRouter,
  dashboard: dashboardRouter,
  supplier: supplierRouter,
  department: departmentRouter,
  role: roleRouter,
  alert: alertRouter,
  contractType: contractTypeRouter,
});

export type AppRouter = typeof appRouter;
