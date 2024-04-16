import { findRefreshToken } from "@/models/RefreshTokens";
import { createError } from "@/plugins/createError";
import { searchRefreshToken } from "@/services/RefreshTokensService";
import { existInviteCode } from "@/services/InviteCodeService";
import { createUser, editUser, findSendUser, generateUid } from "@/services/UsersService";
import { checkPassword, generateAccessToken, generateHashedPassword, typedAsyncWrapper } from "@/utils";

export const login = typedAsyncWrapper<"/auth/login", "post">(async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    next(createError.invalidParams());
    return;
  }

  let dbUser = await findSendUser({ username });

  if (!dbUser) {
    const emailUser = await findSendUser({ email: username });

    if (!!emailUser && !emailUser.passwd) {
      next(createError.create({
        title: "REQUIRE_REREGISTRATION",
        type: "about:blank",
        status: 400,
        detail: "You need reregistragion."
      }));
      return;
    } 
    else if (!emailUser){
      next(createError.noUser());
      return;
    }

    dbUser = emailUser;
  }

  const { id, passwd, ...user } = dbUser;

  const checked = checkPassword(password, passwd);
  if (!checked) {
    next(createError.noUser());
    return;
  }

  const accessToken = await generateAccessToken(user);
  const refreshToken = await searchRefreshToken(id);

  if (!refreshToken) {
    next(createError.noUser());
    return;
  }

  res.status(200).send({ accessToken, refreshToken, user });
});

const signup = typedAsyncWrapper<"/auth/signup", "post">(async (req, res, next) => {
    const username = req.body.username;
    const email = req.body.email || undefined;
    const password = req.body.password;
    const inviteCode = req.body.inviteCode || undefined;
  
    const uid = await generateUid();
    const passwd = generateHashedPassword(password);
  
    if (!username || !password) {
      next(createError.noUser());
    }
  
    // 招待コードの検証
    if (process.env.REQUIRE_INVITE_CODE) {
      if (!inviteCode || !inviteCode.trim()) {
        next(createError.create({
          title: "NO_INVITE_CODE",
          type: "about:blank",
          status: 401,
          detail: "This server is required invite code. Please set invite code."
        }));

        return;
      }

      const codeChecked = await existInviteCode(inviteCode);
      
      // エラー処理
      if (codeChecked == 0) {
        next(createError.create({
          title: "USED_INVITE_CODE",
          type: "about:blank",
          status: 401,
          detail: "This invite code is used. Please set another invite code."
        }));

        return;
      } 
      else if (codeChecked == -1) {
        next(createError.create({
          title: "INVALID_INVITE_CODE",
          type: "about:blank",
          status: 401,
          detail: "This invite code is invalid. Please set another invite code."
        }));

        return;
      }
    }
  
    const data = await createUser({
      uid,
      username,
      passwd,
      inviteCode,
      email,
    });
  
    if (!data) {
      next(createError.create({
        title: "NO_USER",
        type: "about:blank",
        status: 401,
        detail: "No user with such a user name and password."
      }));
      return;
    }
    
    const accessToken = await generateAccessToken(data.user);
  
    res.status(200).send({
      ...data,
      accessToken,
    });
  });

export const token = typedAsyncWrapper<"/auth/token", "post">(async (req, res, next) => {
  const refreshToken= req.body.refreshToken;
  const uid = req.body.uid;

  if (!refreshToken && !uid) {
    next(createError.noToken());
    return;
  }

  const dbUser = await findSendUser({ uid });

  if (!dbUser) {
    next(createError.noUser());
    return;
  }

  const { id, passwd, ...user } = dbUser;
  const token = await findRefreshToken(id);
  const accessToken = await generateAccessToken(user);

  if (!token) {
    next(createError.noToken());
    return;
  }
  if (token.expired) {
    next(createError.expiredToken());
    return;
  }
  if (refreshToken.localeCompare(token.token, undefined, { sensitivity: 'base' }) || token.expired) {
    next(createError.invalidToken());
    return;
  }

  res.status(200).send({ accessToken, user });
});

export const register = typedAsyncWrapper<"/auth/register", "post">(async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;

  if (!email || !password || !username) {
    next(createError.invalidParams());
    return;
  }

  const dbUser = await findSendUser({ email });

  if (!dbUser) {
    next(createError.create({
      title: "NO_EMAIL",
      type: "about:blank",
      status: 401,
      detail: "No email with such a user name and password."
    }));
    return;
  }

  const uid = await generateUid(dbUser.id);
  const passwd = generateHashedPassword(password);

  const data = await editUser(uid, {
    username,
    passwd,
    email,
  });

  if (!data) {
    next(createError.create({
      title: "NO_USER",
      type: "about:blank",
      status: 401,
      detail: "No user with such a user name and password."
    }));
    return;
  }

  const accessToken = await generateAccessToken(data.user);

  res.status(200).send({
    ...data,
    accessToken,
  });
});

export const available = typedAsyncWrapper<"/auth/available", "post">(async (req, res, next) => {
  const username = req.body.username || undefined;

  if (!username) {
    next(createError.invalidParams());
    return;
  }

  const user = await findSendUser({ username });

  res.status(200).send({
    available: !user
  });
});

export default {
  login,
  signup,
  token,
  register,
  available,
}