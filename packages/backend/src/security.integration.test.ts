import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { StartedMySqlContainer } from "@testcontainers/mysql";
import { sql } from "kysely";

const integration =
  process.env.API_MYSQL_TESTS === "1" ? describe : describe.skip;
integration("authentication and ownership security with MySQL", () => {
  let container: StartedMySqlContainer;
  let db: typeof import("./database.js").db;
  let tokens: InstanceType<
    typeof import("./interfaces/infra/RefreshTokensInfra.js").default
  >;
  let auth: InstanceType<
    typeof import("./applications/usecases/AuthUseCase.js").default
  >;
  beforeAll(async () => {
    const { MySqlContainer } = await import("@testcontainers/mysql");
    container = await new MySqlContainer("mysql:9.1")
      .withDatabase("security_test")
      .start();
    process.env.DATABASE_URL = container.getConnectionUri(true);
    process.env.JWT_SECRET_KEY = "test-secret-".repeat(4);
    process.env.ACCESS_TOKEN_DURATION_MINUTE = "15";
    const dir = await mkdtemp(path.join(os.tmpdir(), "iqbe-security-"));
    try {
      await writeFile(
        path.join(dir, "schema.prisma"),
        await readFile(new URL("../prisma/schema.prisma", import.meta.url)),
      );
      execFileSync(
        process.execPath,
        [
          "node_modules/prisma/build/index.js",
          "db",
          "push",
          "--skip-generate",
          "--schema",
          path.join(dir, "schema.prisma"),
        ],
        { env: process.env, stdio: "pipe" },
      );
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
    ({ db } = await import("./database.js"));
    // Validate the deployment migration, not just Prisma's generated schema.
    await db.schema.dropTable("registration_lock").execute();
    const migration = await readFile(
      new URL(
        "../prisma/migrations/20261027000000_registration_lock/migration.sql",
        import.meta.url,
      ),
      "utf8",
    );
    for (const statement of migration.split(";").filter((s) => s.trim()))
      await sql.raw(statement).execute(db);
    const { default: Manager } = await import(
      "./interfaces/infra/kysely/KyselyClientManager.js"
    );
    const { default: Tokens } = await import(
      "./interfaces/infra/RefreshTokensInfra.js"
    );
    const { default: Transactions } = await import(
      "./interfaces/infra/kysely/KyselyTransactionManager.js"
    );
    const { default: Users } = await import("./interfaces/infra/UserInfra.js");
    const { default: Invites } = await import(
      "./interfaces/infra/InviteCodeInfra.js"
    );
    const { default: Auth } = await import(
      "./applications/usecases/AuthUseCase.js"
    );
    const { default: AuthService } = await import(
      "./domains/Auth/AuthService.js"
    );
    const manager = new Manager();
    tokens = new Tokens(manager);
    auth = new Auth(
      new Transactions(manager),
      new Invites(manager),
      tokens,
      new Users(manager),
    );
    await db
      .insertInto("users")
      .values({
        id: 1,
        uid: "security-user",
        username: "tester",
        email: "test@example.com",
        passwd: await new AuthService().generateHashedPassword("password"),
        created: new Date(),
        modified: new Date(),
      })
      .execute();
  }, 120000);
  beforeEach(async () => {
    process.env.REQUIRE_INVITE_CODE = "true";
    await db.deleteFrom("refresh_tokens").execute();
    await db.deleteFrom("workbooks").execute();
    await db.deleteFrom("profile").execute();
    await db.deleteFrom("users").where("uid", "!=", "security-user").execute();
    await db.deleteFrom("invite_codes").execute();
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });
  afterAll(async () => {
    if (db) await db.destroy();
    if (container) await container.stop();
  }, 30000);

  const token = "11111111-1111-4111-8111-111111111111";
  async function seed(expDate: Date, expired = 0) {
    await db
      .insertInto("refresh_tokens")
      .values({
        user_id: 1,
        token: Buffer.from(token.replaceAll("-", ""), "hex"),
        expDate,
        expired,
      })
      .execute();
  }
  it.each(["expired", "revoked", "valid"])(
    "handles %s refresh tokens",
    async (state) => {
      await seed(
        new Date(Date.now() + (state === "expired" ? -60000 : 60000)),
        state === "revoked" ? 1 : 0,
      );
      if (state === "valid") {
        expect((await auth.getToken("security-user", token)).user.uid).toBe(
          "security-user",
        );
      } else {
        await expect(auth.getToken("security-user", token)).rejects.toThrow();
      }
    },
  );
  it("revokes existing tokens and allows a fresh password login", async () => {
    await seed(new Date(Date.now() + 60000));
    await tokens.revokeByUid("security-user");
    await expect(auth.getToken("security-user", token)).rejects.toThrow();
    const session = await auth.loginUser("tester", "password");
    expect(session.refreshToken.toLowerCase()).not.toBe(token);
    expect(
      (await auth.getToken("security-user", session.refreshToken)).user.uid,
    ).toBe("security-user");
    await expect(auth.getToken("security-user", token)).rejects.toThrow();
  });
  it("logs out using a refresh credential without an access token and rejects replay", async () => {
    await seed(new Date(Date.now() + 60000));
    const { createApp } = await import("./app.js");
    const app = createApp({
      webRoot: process.cwd(),
      publicRoot: process.cwd(),
    });
    const logout = (refreshToken: string) =>
      app.request("/api/auth/logout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid: "security-user", refreshToken }),
      });
    expect((await logout("22222222-2222-4222-8222-222222222222")).status).toBe(
      204,
    );
    expect((await auth.getToken("security-user", token)).user.uid).toBe(
      "security-user",
    );
    expect((await logout(token)).status).toBe(204);
    await expect(auth.getToken("security-user", token)).rejects.toThrow();
    expect((await logout(token)).status).toBe(204);
  });
  it("rejects invalid invitations before hashing passwords", async () => {
    const { default: AuthService } = await import(
      "./domains/Auth/AuthService.js"
    );
    const hash = vi.spyOn(AuthService.prototype, "generateHashedPassword");
    await expect(
      auth.signupUser("uninvited", "password", "", "invalid"),
    ).rejects.toThrow();
    expect(hash).not.toHaveBeenCalled();
  });
  it("allows only one registration to consume a single invitation concurrently", async () => {
    await db.insertInto("invite_codes").values({ code: "once" }).execute();
    const results = await Promise.allSettled([
      auth.signupUser("invite-a", "password", "", "once"),
      auth.signupUser("invite-b", "password", "", "once"),
    ]);
    expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    expect(results.filter((r) => r.status === "rejected")).toHaveLength(1);
    expect(
      (results.find((r) => r.status === "rejected") as PromiseRejectedResult)
        .reason.schema.title,
    ).toBe("USED_INVITE_CODE");
    expect(
      (
        await db
          .selectFrom("invite_codes")
          .select("used")
          .where("code", "=", "once")
          .executeTakeFirstOrThrow()
      ).used,
    ).toBe(1);
  });
  it("restricts workbook deletion by owner at the database boundary", async () => {
    const { default: Manager } = await import(
      "./interfaces/infra/kysely/KyselyClientManager.js"
    );
    const { default: Workbooks } = await import(
      "./interfaces/infra/WorkbookInfra.js"
    );
    await db
      .insertInto("workbooks")
      .values({ wid: "owned", name: "Owned", creator_id: 1 })
      .execute();
    const repo = new Workbooks(new Manager());
    expect(await repo.delete("owned", "other-user")).toBe(false);
    expect(await repo.findByWid("owned", "security-user")).not.toBeNull();
    expect(await repo.delete("owned", "security-user")).toBe(true);
  });
  it("creates only one administrator during simultaneous first registrations", async () => {
    await db.deleteFrom("users").execute();
    process.env.REQUIRE_INVITE_CODE = "false";
    const results = await Promise.all([
      auth.signupUser("first-a", "password", ""),
      auth.signupUser("first-b", "password", ""),
    ]);
    expect(
      results.filter((r) => r.user.permission === "SUPER_USER"),
    ).toHaveLength(1);
    const admins = await db
      .selectFrom("users")
      .select("uid")
      .where("permission", "=", "SUPER_USER")
      .execute();
    expect(admins).toHaveLength(1);
  });
});
