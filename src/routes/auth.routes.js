import { Router } from "express";
import { Login, Registration } from "../controller/auth.controller.js";

const authRoute = Router();

authRoute.route('/auth').post(Login);
authRoute.route('/register').post(Registration);

export {authRoute};

