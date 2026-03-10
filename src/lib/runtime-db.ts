import fs from "node:fs";
import path from "node:path";

const TMP_DB_PATH = "/tmp/xiangtai-prod.db";

function getBundledDbCandidates() {
  return [
    path.join(process.cwd(), "prisma", "dev.db"),
    path.join(process.cwd(), ".next", "server", "prisma", "dev.db"),
    "/var/task/prisma/dev.db"
  ];
}

function resolveBundledDbPath() {
  return getBundledDbCandidates().find((p) => fs.existsSync(p));
}

export function prepareRuntimeDatabase() {
  if (process.env.NODE_ENV !== "production") return;
  const raw = process.env.DATABASE_URL ?? "";
  if (!raw.startsWith("file:")) return;

  const bundled = resolveBundledDbPath();
  if (!bundled) return;

  try {
    if (!fs.existsSync(TMP_DB_PATH)) {
      fs.copyFileSync(bundled, TMP_DB_PATH);
    }
    process.env.DATABASE_URL = `file:${TMP_DB_PATH}`;
  } catch {
    // Keep original DATABASE_URL if copy fails.
  }
}
