import { ApiError } from 'api';
import { components } from 'api/schema';
import AccessToken from '@/domains/AccessToken';
import AuthService from '@/domains/Auth/AuthService';
import InviteCode from '@/domains/InviteCode';
import IInviteCodeRepository from '@/domains/InviteCode/IInviteCodeRepository';
import InviteCodeService from '@/domains/InviteCode/InviteCodeService';
import RefreshToken from '@/domains/RefreshToken';
import IRefreshTokenRepository from '@/domains/RefreshToken/IRefreshTokenRepository';
import RefreshTokenService from '@/domains/RefreshToken/RefreshTokenService';
import User from '@/domains/User';
import IUserRepository from '@/domains/User/IUserRepository';
import UsersService from '@/domains/User/UserService';
import dayjs, { format } from '@/plugins/day';

import ITransactionManager from '../shared/ITransactionManager';

type TokenDTO = components["responses"]["AuthResponse"]["content"]["application/json"];
type AuthDTO = components["responses"]["AuthResponseWithRefreshToken"]["content"]["application/json"];

export default class AuthUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private authService: AuthService,
    private inviteCodeService: InviteCodeService,
    private inviteCodeRepository: IInviteCodeRepository,
    private refreshTokenService: RefreshTokenService,
    private refreshTokensRepostiory: IRefreshTokenRepository,
    private userService: UsersService,
    private userRepository: IUserRepository,
  ) {}

  async loginUser(
    username: string,
    password: string
  ): Promise<AuthDTO> {
    const user = await this.userRepository.findByUsername(username);

    if (!user) {
      const noRegisratedUser = await this.userRepository.findByEmail(username);

      if (!!noRegisratedUser && !noRegisratedUser.passwd) {
        throw new ApiError({
          title: "REQUIRE_REREGISTRATION",
          type: "about:blank",
          status: 400,
          detail: "You need reregistragion."
        });
      } 
      else if (await this.userService.checkFirstStart()) {
        throw new ApiError({
          title: "NO_ANY_USERS",
          detail: "This instance is first start",
          status: 400,
          type: "about:blank"
        })
      }
      else {
        throw new ApiError().noUser();
      }
    }

    const checked = this.authService.checkPassword(password, user.passwd);

    if (!checked) throw new ApiError().noUser();
    
    const accessToken = await new AccessToken(user);
    const refreshToken = await this.refreshTokensRepostiory.findByUid(user.uid);

    if (!refreshToken) throw new ApiError().noUser();

    return { 
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        modified: format(user.modified),
        created: format(user.created),
        permission: user.permission,
        photoURL: user.photoUrl,
      },
      refreshToken: refreshToken.token, 
      accessToken: accessToken.toToken(),
    };
  }

  async signupUser(
    username: string,
    password: string,
    email: string,
    inviteCode?: string,
  ): Promise<AuthDTO> {
    const uid = this.userService.generateUid();
    const passwd = this.authService.generateHashedPassword(password);
    const created = dayjs().toDate();

    const user = new User(uid, passwd, username, email, created, created);
    const refreshToken = new RefreshToken(this.refreshTokenService.generateToken(), uid);
    const accessToken = new AccessToken(user);

    const requiredInviteCode = (process.env.REQUIRE_INVITE_CODE !== 'false') ? true : false;
    const isFirstUser = await this.userService.checkFirstStart();

    await this.transactionManager.begin(async () => {      
      if (requiredInviteCode && !isFirstUser) {
        if (!inviteCode || !inviteCode.trim()) {
          throw new ApiError({
            title: "NO_INVITE_CODE",
            type: "about:blank",
            status: 401,
            detail: "This server is required invite code. Please set invite code."
          });
        }

        const code = new InviteCode(inviteCode);
        const available = await this.inviteCodeService.checkAvailable(code);
        
        // エラー処理
        if (!available) {
          throw new ApiError({
            title: "USED_INVITE_CODE",
            type: "about:blank",
            status: 401,
            detail: "This invite code is used. Please set another invite code."
          });
        }
        
        code.markUsed();
        await this.inviteCodeRepository.update(code);
      }

      if (isFirstUser) {
        user.reconstruct(
          uid,
          passwd,
          username,
          email,
          user.created,
          user.modified,
          undefined,
          'SUPER_USER',
        );
      }

      await this.userRepository.save(user);
      await this.refreshTokensRepostiory.save(refreshToken);
    });

    return { 
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        modified: format(user.modified),
        created: format(user.created),
        permission: user.permission,
        photoURL: user.photoUrl,
      },
      refreshToken: refreshToken.token, 
      accessToken: accessToken.toToken(),
    };
  }

  async getToken(
    uid: string,
    refreshToken: string,
  ): Promise<TokenDTO>  {
    const user = await this.userRepository.findByUid(uid);

    if (!user) { 
      if (await this.userService.checkFirstStart()) {
        throw new ApiError({
          title: "NO_ANY_USERS",
          detail: "This instance is first start",
          status: 400,
          type: "about:blank"
        });
      }
      else {
        throw new ApiError().noUser();
      }
    };

    const token = await this.refreshTokensRepostiory.findByUid(user.uid);
    const accessToken = new AccessToken(user);

    if (!token) 
      throw new ApiError().noToken();
    if (refreshToken.localeCompare(token.token, undefined, { sensitivity: 'base' }))
      throw new ApiError().invalidToken();
    
    return { 
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        modified: format(user.modified),
        created: format(user.created),
        permission: user.permission,
        photoURL: user.photoUrl,
      },
      accessToken: accessToken.toToken(),
    };
  }

  async registerUser(
    username: string,
    email: string,
    password: string,
  ): Promise<AuthDTO> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new ApiError({
        title: "NO_EMAIL",
        type: "about:blank",
        status: 401,
        detail: "No email with such a user name and password."
      });
    }

    const userId = await this.userRepository.findUserIdByEmail(email);
    if (!userId) throw new ApiError().noUser();

    const uid = this.userService.generateUid();
    const passwd = this.authService.generateHashedPassword(password);

    user.reconstruct(
      uid,
      passwd,
      username,
      email,
      user.created,
      user.modified,
    );

    const accessToken = new AccessToken(user);
    const refreshToken = new RefreshToken(this.refreshTokenService.generateToken(), uid);

    await this.transactionManager.begin(async () => {
      this.userRepository.update(user);
      this.refreshTokensRepostiory.save(refreshToken);  
    });
    
    return{
      user: {
        uid: user.uid,
        username: user.username,
        email: user.email,
        nickname: user.nickname,
        modified: format(user.modified),
        created: format(user.created),
        permission: user.permission,
      },
      refreshToken: refreshToken.token,
      accessToken: accessToken.toToken(),
    };
  }

  async available(username: string): Promise<boolean> {
    const user = this.userRepository.findByUsername(username);

    return !user;
  }
}
