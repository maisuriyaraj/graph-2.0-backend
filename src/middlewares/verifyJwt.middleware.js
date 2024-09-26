import jwt from 'jsonwebtoken';
import APIResponse from '../utils/apiResponse.js';


export function verifyJWT(request,response,next){
    try {
        if(request.headers["authorization"]){
            let mainToken = request?.cookies?.accessToken ||  request.header("Authorization").split(" ")[1];
            let isVerified = jwt.verify(mainToken,process.env.ACCESS_TOKEN_SECREATE)
            if(!isVerified){
                return response.status(403).json(new APIResponse(403,{},"Invalid Access Token !"));
            }

            request.user_id = isVerified._id;
            next();
        }else{
            return response.status(403).json(new APIResponse(403,{},"Please Provide Authorization Token !"));
        }
    } catch (error) {
        console.log("Verify JWT Error : " , error);
        return response.status(405).json( new APIResponse(405,{},"Verify JWT Middleware Error ."));
    }
}