import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { StartedMySqlContainer } from "@testcontainers/mysql";

const integration =
  process.env.API_MYSQL_TESTS === "1" ? describe : describe.skip;
integration("refresh token security with MySQL", () => {
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
        passwd: new AuthService().generateHashedPassword("password"),
        created: new Date(),
        modified: new Date(),
      })
      .execute();
  }, 120000);
  beforeEach(async () => {
    await db.deleteFrom("refresh_tokens").execute();
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
});
