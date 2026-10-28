import ResetPasswordUseCase from "./applications/usecases/ResetPasswordUseCase.js";
import AuthService from "./domains/Auth/AuthService.js";
import ResetPassword from "./domains/ResetPassword/index.js";
import ResetPasswordService from "./domains/ResetPassword/ResetPasswordService.js";
import User from "./domains/User/index.js";
import CategoryController from "./interfaces/controllers/Category/CategoryController.js";
import { validateJwtSecret } from "./plugins/validateJwtSecret.js";

it.each([undefined, "", "dummy", "short", " ".repeat(32)])(
  "rejects unsafe JWT secrets: %s",
  (secret) => {
    expect(() => validateJwtSecret(secret)).toThrow("JWT_SECRET_KEY");
  },
);
it("accepts a generated signing secret", () => {
  expect(() => validateJwtSecret("a1".repeat(32))).not.toThrow();
});

it.each([false, true])(
  "category deletion checks administrator permission (%s)",
  async (isSuperUser) => {
    const execute = vi
      .fn<(...args: any[]) => Promise<void>>()
      .mockResolvedValue(undefined);
    const controller = new CategoryController(
      null as any,
      null as any,
      null as any,
      null as any,
      { execute } as any,
      null as any,
      null as any,
    );
    const context = {
      req: { valid: () => ({ id: 4 }) },
      get: () => ({ isSuperUser }),
      body: vi.fn(),
    } as any;
    if (isSuperUser) {
      await controller.delete()(context);
      expect(execute).toHaveBeenCalledWith({ id: 4 });
    } else {
      await expect(controller.delete()(context)).rejects.toThrow();
      expect(execute).not.toHaveBeenCalled();
    }
  },
);

it("revokes refresh tokens when resetting a password", async () => {
  const user = new User(
    "uid",
    "old-hash",
    "tester",
    "test@example.com",
    new Date(),
    new Date(),
  );
  const reset = new ResetPassword(
    "reset-token",
    new Date(Date.now() + 60000),
    false,
    "uid",
  );
  const revokeByUid = vi
    .fn<(uid: string) => Promise<void>>()
    .mockResolvedValue(undefined);
  const update = vi
    .fn<(...args: any[]) => Promise<void>>()
    .mockResolvedValue(undefined);
  const useCase = new ResetPasswordUseCase(
    { begin: async (callback: () => Promise<any>) => callback() },
    new AuthService(),
    new ResetPasswordService(),
    { findByToken: async () => reset, update } as any,
    { findByUid: async () => user, update } as any,
    { revokeByUid } as any,
  );
  const log = vi.spyOn(console, "log").mockImplementation(() => {});
  try {
    await useCase.resetPassword("reset-token", "new-password", "uid");
    expect(
      await new AuthService().checkPassword("new-password", user.passwd),
    ).toBe(true);
    expect(log).not.toHaveBeenCalled();
    expect(reset.used).toBe(true);
    expect(revokeByUid).toHaveBeenCalledWith("uid");
  } finally {
    log.mockRestore();
  }
});
