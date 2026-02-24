const { readFileSync } = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const root = process.cwd();
const envPaths = [
  path.join(root, ".env"),
  path.join(path.resolve(__dirname, ".."), ".env"),
];

function loadEnv(filePath) {
  let env = readFileSync(filePath, "utf8");
  if (env.charCodeAt(0) === 0xfeff) env = env.slice(1);
  env.replace(/\r\n/g, "\n").split("\n").forEach((line) => {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim().replace(/\r$/, "");
      let val = match[2].trim().replace(/\r$/, "");
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'")))
        val = val.slice(1, -1);
      process.env[key] = val;
    }
  });
}

for (const envPath of envPaths) {
  try {
    loadEnv(envPath);
    break;
  } catch (e) {
    // try next path
  }
}

const direct = process.env.DIRECT_DATABASE_URL;
if (!direct) {
  console.error("DIRECT_DATABASE_URL is not set in .env");
  const hasDirect = envPaths.some((p) => {
    try {
      const c = readFileSync(p, "utf8");
      return /^\s*DIRECT_DATABASE_URL\s*=/m.test(c.replace(/\r\n/g, "\n"));
    } catch {
      return false;
    }
  });
  if (hasDirect) console.error("(Found DIRECT_DATABASE_URL in file - check for spaces, quotes, or encoding)");
  process.exit(1);
}

process.env.DATABASE_URL = direct;
execSync("npx prisma db push", { stdio: "inherit", env: process.env, cwd: root });
