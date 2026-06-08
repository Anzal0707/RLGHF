#!/usr/bin/env node
/**
 * Force-remove or quarantine Next.js / Turbopack cache on Windows.
 * Usage: node scripts/clean-next-cache.mjs
 */
import { existsSync, mkdirSync, readdirSync, renameSync, rmSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const frontendRoot = join(fileURLToPath(new URL("..", import.meta.url)));
const nextDir = join(frontendRoot, ".next");
const cacheDir = join(nextDir, "dev", "cache");
const turbopackDir = join(cacheDir, "turbopack");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function stopPort3000() {
  if (process.platform !== "win32") {
    return;
  }

  spawnSync(
    "powershell",
    [
      "-NoProfile",
      "-Command",
      "Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }",
    ],
    { stdio: "ignore", windowsHide: true },
  );

  spawnSync("taskkill", ["/F", "/IM", "node.exe", "/T"], {
    stdio: "ignore",
    windowsHide: true,
  });
}

function robocopyMirrorDelete(targetDir) {
  if (!existsSync(targetDir)) {
    return true;
  }

  const emptyDir = join(frontendRoot, ".next-cache-empty");
  mkdirSync(emptyDir, { recursive: true });

  const result = spawnSync(
    "robocopy",
    [emptyDir, targetDir, "/MIR", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS"],
    { stdio: "ignore", windowsHide: true },
  );

  rmSync(emptyDir, { recursive: true, force: true });

  if (result.status !== 0 && result.status !== 1) {
    return false;
  }

  try {
    rmSync(targetDir, { recursive: true, force: true });
    return !existsSync(targetDir);
  } catch {
    return false;
  }
}

function quarantineDir(path, label) {
  if (!existsSync(path)) {
    return true;
  }

  const quarantinePath = `${path}.stale.${Date.now()}`;
  try {
    renameSync(path, quarantinePath);
    console.log(`quarantined ${label} -> ${quarantinePath}`);
    return true;
  } catch (error) {
    console.error(`failed to quarantine ${label}: ${error.message}`);
    return false;
  }
}

async function removePath(path, label) {
  if (!existsSync(path)) {
    console.log(`skip ${label} (not present)`);
    return true;
  }

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      rmSync(path, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
      if (!existsSync(path)) {
        console.log(`removed ${label}`);
        return true;
      }
    } catch (error) {
      console.warn(`attempt ${attempt}: rmSync failed for ${label}: ${error.message}`);
    }

    if (process.platform === "win32" && robocopyMirrorDelete(path)) {
      console.log(`removed ${label} (robocopy mirror)`);
      return true;
    }

    await sleep(300 * attempt);
  }

  if (quarantineDir(path, label)) {
    return true;
  }

  console.error(`failed to remove ${label}`);
  return false;
}

function removeStaleQuarantineDirs() {
  if (!existsSync(cacheDir)) {
    return;
  }

  for (const name of readdirSync(cacheDir)) {
    if (!name.startsWith("turbopack.stale.")) {
      continue;
    }
    const stalePath = join(cacheDir, name);
    try {
      rmSync(stalePath, { recursive: true, force: true });
      console.log(`removed old quarantine ${name}`);
    } catch {
      // locked by antivirus/IDE — harmless to leave
    }
  }
}

async function main() {
  console.log("Cleaning Next.js dev cache...");
  console.log(`Frontend root: ${frontendRoot}`);

  stopPort3000();
  await sleep(800);

  const targets = [
    [turbopackDir, ".next/dev/cache/turbopack"],
    [join(cacheDir, "webpack"), ".next/dev/cache/webpack"],
  ];

  let ok = true;
  for (const [path, label] of targets) {
    if (!(await removePath(path, label))) {
      ok = false;
    }
  }

  removeStaleQuarantineDirs();

  if (!ok) {
    console.error("");
    console.error("Could not clear cache. Close Cursor terminals and retry:");
    console.error("  cd backend");
    console.error("  clean-frontend-dev.bat");
    process.exit(1);
  }

  console.log("Cache cleared. Run: npm run dev");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
