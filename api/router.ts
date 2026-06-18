import { authRouter } from "./auth-router";
import {
  contractRouter,
  dashboardRouter,
  supplierRouter,
  departmentRouter,
  alertRouter,
  roleRouter,
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
});

export type AppRouter = typeof appRouter;
