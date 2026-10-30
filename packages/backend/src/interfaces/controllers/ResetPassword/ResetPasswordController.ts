import ResetPasswordUseCase from "@/applications/usecases/ResetPasswordUseCase.js";
import { ApiError } from "@/http/ApiError.js";
import type { ApiContext } from "@/http/context.js";
import { postRequestResetPassword, postResetPassword } from "./schema.js";

export default class ResetPasswordController {
  constructor(private resetPasswordUseCase: ResetPasswordUseCase) {}

  reset() {
    return async (c: ApiContext<typeof postResetPassword>) => {
      const body = c.req.valid("json");
      const token = body.token;
      const newPassword = body.newPassword;
      const uid = c.get("user").uid;

      if (!token || !newPassword) {
        throw new ApiError().invalidParams();
      }

      await this.resetPasswordUseCase.resetPassword(token, newPassword, uid);

      return c.text("succeed resetting your password", 200);
    };
  }

  request() {
    return async (c: ApiContext<typeof postRequestResetPassword>) => {
      const body = c.req.valid("json");
      const email = body.email;
      const username = body.username;

      if (!email || !username) {
        throw new ApiError().invalidParams();
      }

      await this.resetPasswordUseCase.requestResetPassword(username, email);

      return c.text("requested resetting your password", 200);
    };
  }
}
