const { readFileSync } = require("fs");
const { execSync } = require("child_process");
const path = require("path");

const root = process.cwd();
const envPath = path.join(root, ".env");

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

try {
  loadEnv(envPath);
} catch (e) {
  console.warn("No .env found");
}

const direct = process.env.DIRECT_DATABASE_URL;
if (direct) process.env.DATABASE_URL = direct;

execSync("npx tsx prisma/seed.ts", { stdio: "inherit", env: process.env, cwd: root });
