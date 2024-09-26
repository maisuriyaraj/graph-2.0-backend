import { Router } from "express";
import { Login, LogoutUser, regenerateAccessToken, Registration } from "../controller/auth.controller.js";
import { verifyJWT } from "../middlewares/verifyJwt.middleware.js";

const authRoute = Router();

authRoute.route('/login').post(Login);
authRoute.route('/register').post(Registration);
authRoute.route('/refereshAccessToken').post(regenerateAccessToken);
/**
 * Secure Routes
 */

authRoute.route('/logout').post(verifyJWT,LogoutUser);

export {authRoute};

