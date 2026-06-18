import { getDb } from "../api/queries/connection";
import {
  departments,
  suppliers,
  users,
  contracts,
  payments,
  amendments,
  alerts,
  auditLog,
} from "./schema";

async function cleanAndSeed() {
  const db = getDb();
  console.log("Cleaning tables...");

  await db.delete(alerts);
  await db.delete(amendments);
  await db.delete(payments);
  await db.delete(contracts);
  await db.delete(suppliers);
  await db.delete(departments);
  await db.delete(auditLog);
  // Don't delete OAuth users - just update them

  console.log("Tables cleaned. Run seed.ts now.");
}

cleanAndSeed().catch((err) => {
  console.error("Clean error:", err);
  process.exit(1);
});
