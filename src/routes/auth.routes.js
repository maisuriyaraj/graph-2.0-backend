import { Router } from "express";
import { Login, LogoutUser, Registration } from "../controller/auth.controller.js";
import { verifyJWT } from "../middlewares/verifyJwt.middleware.js";

const authRoute = Router();

authRoute.route('/login').post(Login);
authRoute.route('/register').post(Registration);

/**
 * Secure Routes
 */

authRoute.route('/logout').post(verifyJWT,LogoutUser)

export {authRoute};

