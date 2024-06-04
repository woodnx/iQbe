import ResetPassword from ".";
import ApiError from "../ApiError";
import dayjs from '@/plugins/day';

export default class ResetPasswordService {
  constructor() {}

  available(resetPassword: ResetPassword, uid: string) {
    const now = dayjs();

    console.log(resetPassword)

    if (now.isAfter(resetPassword.exp) || resetPassword.used) {
      throw new ApiError().invalidParams();
    }
    else if (resetPassword.requestedUid != uid) {
      throw new ApiError({
        title: 'INVALID_USER',
        detail: 'The user shown is different from the user who requested the password reset',
        type: 'about:blank',
        status: 400,
      });
    }

    return true
  }
}
