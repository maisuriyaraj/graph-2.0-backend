import { Router } from "express";
import { forgotPasswordMail, Login, LogoutUser, regenerateAccessToken, Registration, resetPassword } from "../controller/auth.controller.js";
import { verifyJWT } from "../middlewares/verifyJwt.middleware.js";

const authRoute = Router();

authRoute.route('/login').post(Login);
authRoute.route('/register').post(Registration);
authRoute.route('/refereshAccessToken').post(regenerateAccessToken);
authRoute.route('/forgotPasswordMail').post(forgotPasswordMail);
/**
 * Secure Routes
 */

authRoute.route('/logout').post(verifyJWT,LogoutUser);
authRoute.route('/resetPassword').post(verifyJWT,resetPassword);

export {authRoute};

