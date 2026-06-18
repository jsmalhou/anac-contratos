import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";
import { existsSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Get the directory where this config file is located
const __dirname = dirname(fileURLToPath(import.meta.url));

// Try multiple possible .env file locations (Windows compatible)
const possibleEnvFiles = [
  resolve(__dirname, ".env"),           // Same folder as drizzle.config.ts
  resolve(process.cwd(), ".env"),        // Current working directory
  resolve(__dirname, ".env.local"),     // .env.local alternative
  resolve(process.cwd(), ".env.local"),
];

let envLoaded = false;
for (const envPath of possibleEnvFiles) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    envLoaded = true;
    console.log(`Loaded env from: ${envPath}`);
    break;
  }
}

if (!envLoaded) {
  console.warn("No .env or .env.local file found. Checked locations:");
  possibleEnvFiles.forEach(p => console.warn(`  - ${p}`));
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    "DATABASE_URL is required to run drizzle commands.\n" +
    "Please create a .env file in the project root with:\n" +
    "  DATABASE_URL=mysql://root:root@localhost:3306/anac_contratos\n" +
    "\nOr set the environment variable:\n" +
    "  $env:DATABASE_URL=\"mysql://root:root@localhost:3306/anac_contratos\""
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
