import AuthUseCase from "@/applications/usecases/AuthUseCase.js";
import { ApiError } from "@/http/ApiError.js";
import type { ApiContext } from "@/http/context.js";
import {
  postAuthAvailable,
  postAuthLogin,
  postAuthLogout,
  postAuthRegister,
  postAuthSignup,
  postAuthToken,
} from "./schema.js";

export default class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  login() {
    return async (c: ApiContext<typeof postAuthLogin>) => {
      const body = c.req.valid("json");
      const username = body.username;
      const password = body.password;

      if (!username || !password) {
        throw new ApiError().invalidParams();
      }

      const data = await this.authUseCase.loginUser(username, password);

      return c.json(data, 200);
    };
  }

  signup() {
    return async (c: ApiContext<typeof postAuthSignup>) => {
      const body = c.req.valid("json");
      const username = body.username;
      const email = body.email || undefined;
      const password = body.password;
      const inviteCode = body.inviteCode || undefined;

      if (!username || !password) {
        throw new ApiError().invalidParams();
      }

      const data = await this.authUseCase.signupUser(
        username,
        password,
        email || "",
        inviteCode,
      );

      return c.json(data, 200);
    };
  }

  token() {
    return async (c: ApiContext<typeof postAuthToken>) => {
      const body = c.req.valid("json");
      const refreshToken = body.refreshToken;
      const uid = body.uid;

      if (!refreshToken || !uid) {
        throw new ApiError().invalidParams();
      }

      const { accessToken, user } = await this.authUseCase.getToken(
        uid,
        refreshToken,
      );

      return c.json({ accessToken, user }, 200);
    };
  }

  register() {
    return async (c: ApiContext<typeof postAuthRegister>) => {
      const body = c.req.valid("json");
      const email = body.email;
      const password = body.password;
      const username = body.username;

      if (!email || !password || !username) {
        throw new ApiError().invalidParams();
      }

      const data = await this.authUseCase.registerUser(
        username,
        email,
        password,
      );

      return c.json(
        {
          ...data,
        },
        200,
      );
    };
  }

  logout() {
    return async (c: ApiContext<typeof postAuthLogout>) => {
      const { uid, refreshToken } = c.req.valid("json");
      await this.authUseCase.logout(uid, refreshToken);
      return c.body(null, 204);
    };
  }

  available() {
    return async (c: ApiContext<typeof postAuthAvailable>) => {
      const body = c.req.valid("json");
      const username = body.username || undefined;

      if (!username) {
        throw new ApiError().invalidParams();
      }

      const available = await this.authUseCase.available(username);

      return c.json(
        {
          available,
        },
        200,
      );
    };
  }
}
