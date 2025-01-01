import { ApiError } from 'api';

import ResetPasswordUseCase from '@/applications/usecases/ResetPasswordUseCase';
import { typedAsyncWrapper } from '@/utils';

export default class ResetPasswordController {
  constructor(
    private resetPasswordUseCase: ResetPasswordUseCase,
  ) {}

  reset() {
    return typedAsyncWrapper<"/reset-password", "post">(async (req, res, next) => {
      const token = req.body.token;
      const newPassword = req.body.newPassword;
      const uid = req.user.uid;
  
      if (!token || !newPassword) {
        throw new ApiError().invalidParams();
      }

      await this.resetPasswordUseCase.resetPassword(token, newPassword, uid);

      res.status(200).send('succeed resetting your password');
    });
  }

  request() {
    return typedAsyncWrapper<"/request-reset-password", "post">(async (req, res) => {
      const email = req.body.email;
      const username = req.body.username;
      
      if (!email || !username) {
        throw new ApiError().invalidParams();
      }

      await this.resetPasswordUseCase.requestResetPassword(username, email);

      res.status(200).send('requested resetting your password');
    })
  }
}
