import { execSync, spawnSync } from "child_process";
import fs from "fs";

try {
  //clean dist
  spawnSync("pnpm", ["run", "clean"], { stdio: "inherit" });

  // build frontend
  spawnSync("pnpm", ["--filter", "./packages/api", "run", "build"], {
    stdio: "inherit",
  });

  // build frontend
  spawnSync("pnpm", ["--filter", "./packages/frontend", "run", "build"], {
    stdio: "inherit",
  });

  // build backend
  spawnSync("pnpm", ["--filter", "./packages/backend", "run", "build"], {
    stdio: "inherit",
  });

  // check existing directory
  if (!fs.existsSync("./packages/backend/dist/web")) {
    execSync("mkdir ./packages/backend/dist/web");
  }

  // copy build frontend file
  execSync("cp -f -r ./packages/frontend/dist/* ./packages/backend/dist/web");
} catch (e) {
  console.error(e);
  process.exit(1);
}
