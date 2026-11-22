import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");

console.log("[JanSawaal] Starting Full-Stack Dev Environment (Backend + Frontend)...");

// Spawn Server
const server = spawn("npm", ["run", "dev"], {
  cwd: path.join(rootDir, "server"),
  shell: true,
  stdio: "inherit"
});

// Spawn Client
const client = spawn("npm", ["run", "dev"], {
  cwd: path.join(rootDir, "client"),
  shell: true,
  stdio: "inherit"
});

const cleanup = () => {
  try { server.kill("SIGTERM"); } catch (e) {}
  try { client.kill("SIGTERM"); } catch (e) {}
  process.exit();
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
