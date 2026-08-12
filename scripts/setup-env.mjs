import { randomBytes } from "crypto";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const root = process.cwd();
const envPath = join(root, ".env");
const examplePath = join(root, ".env.example");

function generateSecret() {
  return randomBytes(32).toString("base64");
}

function parseEnv(content) {
  const vars = new Map();
  for (const line of content.split("\n")) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match) vars.set(match[1], match[2]);
  }
  return vars;
}

function serializeEnv(content, updates) {
  const lines = content.split("\n");
  const updatedKeys = new Set();

  const result = lines.map((line) => {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (match && updates.has(match[1])) {
      updatedKeys.add(match[1]);
      return `${match[1]}=${updates.get(match[1])}`;
    }
    return line;
  });

  for (const [key, value] of updates) {
    if (!updatedKeys.has(key)) {
      result.push(`${key}=${value}`);
    }
  }

  return result.join("\n");
}

let content = existsSync(envPath)
  ? readFileSync(envPath, "utf8")
  : existsSync(examplePath)
    ? readFileSync(examplePath, "utf8")
    : "";

if (!content) {
  console.error("No .env or .env.example found.");
  process.exit(1);
}

const vars = parseEnv(content);
const updates = new Map();

if (!vars.get("NEXTAUTH_SECRET")?.replace(/"/g, "").trim()) {
  const secret = generateSecret();
  updates.set("NEXTAUTH_SECRET", `"${secret}"`);
  console.log("Generated NEXTAUTH_SECRET");
}

if (!vars.get("AUTH_SECRET")?.replace(/"/g, "").trim()) {
  const secret =
    updates.get("NEXTAUTH_SECRET")?.replace(/"/g, "") ?? generateSecret();
  updates.set("AUTH_SECRET", `"${secret}"`);
}

writeFileSync(envPath, serializeEnv(content, updates));
writeFileSync(join(root, ".env.local"), readFileSync(envPath, "utf8"));

console.log(`Wrote ${envPath} and .env.local`);
console.log("Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env, then restart the dev server.");
