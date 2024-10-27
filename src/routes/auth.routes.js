import { Router } from "express";
import { forgotPasswordMail, Login, LogoutUser, regenerateAccessToken, Registration, ResendOtp, resetPassword, Verify2FAOtp } from "../controller/auth.controller.js";
import { verifyJWT } from "../middlewares/verifyJwt.middleware.js";
import { verifyResetPasswordToken } from "../middlewares/verifyJwtforResetPassword.middleware.js";

const authRoute = Router();

authRoute.route('/login').post(Login);
authRoute.route('/register').post(Registration);
authRoute.route('/refereshAccessToken').post(regenerateAccessToken);
authRoute.route('/forgotPasswordMail').post(forgotPasswordMail);
authRoute.route('/verifyOtp').post(Verify2FAOtp);
authRoute.route('/resendOtp').post(ResendOtp);
/**
 * Secure Routes
 */

authRoute.route('/logout').post(verifyJWT,LogoutUser);
authRoute.route('/resetPassword').post(verifyResetPasswordToken,resetPassword);

export {authRoute};

