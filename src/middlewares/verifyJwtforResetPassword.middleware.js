import jwt from 'jsonwebtoken';
import APIResponse from '../utils/apiResponse.js';


export function verifyResetPasswordToken(request,response,next){
    try {
        if(request.headers["authorization"]){
            let mainToken = request.header("Authorization").split(" ")[1];
            let isVerified = jwt.verify(mainToken,process.env.RESET_PASSWORD_SECREATE)
            console.log(isVerified);
            if(!isVerified){
                return response.status(403).json(new APIResponse(403,{},"Invalid Access Token !"));
            }

            request.user_id = isVerified.userID;
            next();
        }else{
            return response.status(403).json(new APIResponse(403,{},"Please Provide Authorization Token !"));
        }
    } catch (error) {
        console.log("Reset Password Verify JWT Error : " , error);
        return response.status(405).json( new APIResponse(405,{},"Reset Password Verify JWT Middleware Error ."));
    }
}