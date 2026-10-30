import { spawnSync } from "node:child_process";
import fs from "node:fs";

const run = (args) => {
  const result = spawnSync("pnpm", args, { stdio: "inherit" });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
};
run(["run", "clean"]);
run(["--filter", "./packages/backend", "run", "build"]);
run(["--filter", "./packages/frontend", "run", "build"]);
fs.cpSync("./packages/frontend/dist", "./packages/backend/dist/web", {
  recursive: true,
});
