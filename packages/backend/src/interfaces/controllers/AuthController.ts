import { ApiError } from "api";

import AuthUseCase from "@/applications/usecases/AuthUseCase";
import { typedAsyncWrapper } from "@/utils";

export default class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  login() {
    return typedAsyncWrapper<"/auth/login", "post">(async (req, res) => {
      const username = req.body.username;
      const password = req.body.password;

      if (!username || !password) {
        throw new ApiError().invalidParams();
      }

      const data = await this.authUseCase.loginUser(username, password);

      res.status(200).send(data);
    });
  }

  signup() {
    return typedAsyncWrapper<"/auth/signup", "post">(async (req, res, next) => {
      const username = req.body.username;
      const email = req.body.email || undefined;
      const password = req.body.password;
      const inviteCode = req.body.inviteCode || undefined;

      if (!username || !password) {
        throw new ApiError().invalidParams();
      }

      const data = await this.authUseCase.signupUser(
        username,
        password,
        email || "",
        inviteCode,
      );

      res.status(200).send(data);
    });
  }

  token() {
    return typedAsyncWrapper<"/auth/token", "post">(async (req, res) => {
      const refreshToken = req.body.refreshToken;
      const uid = req.body.uid;

      if (!refreshToken || !uid) {
        throw new ApiError().invalidParams();
      }

      const { accessToken, user } = await this.authUseCase.getToken(
        uid,
        refreshToken,
      );

      res.status(200).send({ accessToken, user });
    });
  }

  register() {
    return typedAsyncWrapper<"/auth/register", "post">(async (req, res) => {
      const email = req.body.email;
      const password = req.body.password;
      const username = req.body.username;

      if (!email || !password || !username) {
        throw new ApiError().invalidParams();
      }

      const data = await this.authUseCase.registerUser(
        username,
        email,
        password,
      );

      res.status(200).send({
        ...data,
      });
    });
  }

  available() {
    return typedAsyncWrapper<"/auth/available", "post">(async (req, res) => {
      const username = req.body.username || undefined;

      if (!username) {
        throw new ApiError().invalidParams();
      }

      const available = await this.authUseCase.available(username);

      res.status(200).send({
        available,
      });
    });
  }
}
