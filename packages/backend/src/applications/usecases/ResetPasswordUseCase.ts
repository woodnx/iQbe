import { ApiError } from 'api';
import { randomUUID } from 'crypto';

import ITransactionManager from '@/applications/shared/ITransactionManager';
import AuthService from '@/domains/Auth/AuthService';
import ResetPassword from '@/domains/ResetPassword';
import IResetPasswordRepository from '@/domains/ResetPassword/ResetPasswordRepository';
import ResetPasswordService from '@/domains/ResetPassword/ResetPasswordService';
import IUserRepository from '@/domains/User/IUserRepository';
import dayjs from '@/plugins/day';

export default class ResetPasswordUseCase {
  constructor(
    private transactionManager: ITransactionManager,
    private authService: AuthService,
    private resetPasswordService: ResetPasswordService,
    private resetPasswordRepository: IResetPasswordRepository,
    private userRepository: IUserRepository,
  ) {}

  async requestResetPassword(username: string, email: string) {
    const token = randomUUID();
    const expDate = dayjs().add(1, 'h').toDate();
   

    await this.transactionManager.begin(async () => {
      const user = await this.userRepository.findByUsername(username);
      if (!user) {
        throw new ApiError().noUser();
      }

      else if (user.email !== email) {
        throw new ApiError({
          title: 'NO_USER',
          detail: 'No matched your email',
          type: 'about:blank',
          status: 400
        });
      }
      
      const resetPassword = new ResetPassword(token, expDate, false, user.uid)
      
      await this.resetPasswordRepository.save(resetPassword)
      await this.resetPasswordRepository.request(resetPassword.token, email);

      return;
    });

    return;
  }

  async resetPassword(token: string, newPassword: string, uid: string) {
    await this.transactionManager.begin(async () => {
      const resetPassword = await this.resetPasswordRepository.findByToken(token);

      if (!resetPassword) {
        throw new ApiError().noToken();
      }

      this.resetPasswordService.available(resetPassword, uid);
  
      const passwd = this.authService.generateHashedPassword(newPassword);
      const user = await this.userRepository.findByUid(uid);

      if (!user) {
        throw new ApiError().noUser();
      }

      user.resetPasswd(passwd);
      resetPassword.use();

      await this.userRepository.update(user);
      await this.resetPasswordRepository.update(resetPassword);

      return;
    });

    return;
  }
}
