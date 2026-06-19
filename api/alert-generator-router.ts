import { createRouter, publicQuery } from "./middleware";
import { generateAlerts } from "./alert-generator";

export const alertGeneratorRouter = createRouter({
  check: publicQuery.query(async () => {
    const alerts = await generateAlerts();
    return {
      generated: alerts.length,
      alerts,
    };
  }),
});
