import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, expect, test } from "vitest";

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

function fixture(existingConfig = true) {
  const directory = mkdtempSync(join(tmpdir(), "iqbe-entrypoint-"));
  directories.push(directory);
  const config = join(directory, ".env");
  const log = join(directory, "commands.jsonl");
  const entrypoint = join(directory, "entrypoint.sh");
  // Isolate the fixed container path; exercise the actual shell entrypoint.
  writeFileSync(
    entrypoint,
    readFileSync(
      new URL("../entrypoint.sh", import.meta.url),
      "utf8",
    ).replaceAll("/iQbe/.config", directory),
  );
  if (existingConfig) writeFileSync(config, "JWT_SECRET_KEY=existing-key\n");
  writeFileSync(log, "");
  writeFileSync(
    join(directory, "pnpm"),
    `#!${process.execPath}
const fs = require("node:fs");
const args = process.argv.slice(2);
fs.appendFileSync(process.env.TEST_COMMAND_LOG, JSON.stringify(args) + "\\n");
if (args[1] === "migrate:deploy") process.exit(Number(process.env.TEST_MIGRATE_EXIT || 0));
`,
    { mode: 0o755 },
  );
  return {
    config,
    run(args: string[], migrationExit = 0) {
      const result = spawnSync("sh", [entrypoint, ...args], {
        encoding: "utf8",
        env: {
          ...process.env,
          PATH: `${directory}:${process.env.PATH}`,
          TEST_COMMAND_LOG: log,
          TEST_MIGRATE_EXIT: String(migrationExit),
        },
      });
      const commands = readFileSync(log, "utf8")
        .trim()
        .split("\n")
        .filter(Boolean)
        .map((line) => JSON.parse(line));
      return { ...result, commands };
    },
  };
}

test("applies migrations before starting the app and preserves existing config", () => {
  const subject = fixture();
  const result = subject.run(["pnpm", "run", "start"]);
  expect(result.status, result.stderr).toBe(0);
  expect(result.commands).toEqual([
    ["run", "migrate:deploy"],
    ["run", "start"],
  ]);
  expect(readFileSync(subject.config, "utf8")).toBe(
    "JWT_SECRET_KEY=existing-key\n",
  );
});

test("does not start the app when a migration fails", () => {
  const result = fixture().run(["pnpm", "run", "start"], 17);
  expect(result.status).toBe(17);
  expect(result.commands).toEqual([["run", "migrate:deploy"]]);
});

test.each([
  ["pnpm", "run", "migrate:status"],
  ["pnpm", "run"],
])("runs maintenance commands without applying migrations: %j", (...args) => {
  const result = fixture().run(args);
  expect(result.status, result.stderr).toBe(0);
  expect(result.commands).toEqual([args.slice(1)]);
});

test("generates a secret on first startup before running migrations", () => {
  const subject = fixture(false);
  const result = subject.run(["pnpm", "run", "start"]);
  expect(result.status, result.stderr).toBe(0);
  expect(readFileSync(subject.config, "utf8")).toMatch(
    /^JWT_SECRET_KEY=[a-f0-9]{64}\n$/,
  );
  expect(result.commands).toEqual([
    ["run", "migrate:deploy"],
    ["run", "start"],
  ]);
});
