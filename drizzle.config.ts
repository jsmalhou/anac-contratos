import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { existsSync } from "fs";

// Load .env or .env.local
const envFile = existsSync(".env") ? ".env" : ".env.local";
config({ path: envFile });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required to run drizzle commands.\n" +
    "Please create a .env file with: DATABASE_URL=mysql://user:pass@host:port/db\n" +
    "Or run: Copy-Item .env.local .env"
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString,
  },
});
