import fs from "node:fs";
import path from "node:path";

export function ensureIntegrationEnv() {
  if (!process.env.DATABASE_URL) {
    const envPath = path.join(process.cwd(), ".env.local");

    if (!fs.existsSync(envPath)) {
      return;
    }

    const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);

    for (const line of lines) {
      const trimmed = line.trim();

      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex === -1) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      if (!key || process.env[key]) {
        continue;
      }

      let value = trimmed.slice(separatorIndex + 1).trim();
      value = value.replace(/^['"]|['"]$/g, "");
      process.env[key] = value;
    }
  }

  if (!process.env.TOKEN_ENCRYPTION_KEY) {
    process.env.TOKEN_ENCRYPTION_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";
  }
}

export function canRunIntegrationDbTests(): boolean {
  const databaseUrl = process.env.DATABASE_URL ?? "";
  const looksLikePlaceholder = databaseUrl.includes("johndoe");

  return Boolean(databaseUrl) && !looksLikePlaceholder;
}
