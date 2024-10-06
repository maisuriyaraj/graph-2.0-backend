import jwt from 'jsonwebtoken';
import { authTokenModel } from "../models/authTokens.model.js";
import { userModel } from "../models/users.model.js";
import APIResponse from "../utils/apiResponse.js";
import { generateAccessToken, generateRefereshToken } from "../utils/generateTokens.js";
import { forgotPasswordMailTemplate } from '../utils/emailTemplates.js';
import { sendEmailService } from '../utils/emailService.js';
import { generateHashPassword } from '../utils/generateHashPassword.js';

const CookieOptions = {
    httpOnly: false, // It is Modifiable only from server
    secure: false // It is Modifiable only from server
}

/**
 * @description This Method is for Login
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */
export async function Login(request, response) {
    try {
        /**
         * Login Flow Algorithm 
         * 1. Get username or email and password from request.body
         * 2. check Fields Vaidation
         * 3. check user is exists or not
         * 4. Check password 
         * 5. If user Exists and password is Right than Generate Access token and Referesh token
         * 6. Send Access token and Referesh Token in cookie
         */

        /**
         * 1 . Get username or email and password from request.body
         */

        const { userName, email, password } = request.body;

        /**
         * 2.  check Fields Vaidation
         */
        if (!userName && !email) {
            return response.status(403).json(new APIResponse(403, {}, "Please Provide User\'s Username or Email ."));
        }

        if (!password) {
            return response.status(403).json(new APIResponse(403, {}, "Password is Required field."));
        }

        /**
         * 3.check user is exists or not
         */

        const userDetails = await userModel.findOne({ $or: [{ userName }, { email }] });

        if (!userDetails) {
            return response.status(403).json(new APIResponse(403, {}, "User Does not exists ."));
        }

        /**
         * 4. Check User Password
         */

        const isValidCredentials = await  userDetails.isPasswordCorrect(password);

        if (!isValidCredentials) {
            return response.status(403).json(new APIResponse(403, {}, "Invalid credentials !, Please Check your credentials ."));
        }

        /**
         * 5. Generate Access Token and Referesh token
         */

        const access_token = await generateAccessToken(userDetails);
        const referesh_token = await generateRefereshToken(userDetails);

        const collectionToken = await authTokenModel.findOne({user_id: userDetails._id});
        if(collectionToken){
            await authTokenModel.findOneAndUpdate({user_id: userDetails._id},{$set:{
                access_token: access_token, referesh_token: referesh_token
            }});
        }else{
            const collection = await authTokenModel.create({ user_id: userDetails._id, access_token: access_token, referesh_token: referesh_token });
            const result = await collection.save();
        }

        // Send Cookies 
        // 1. Generate Options
       

        const mainUserDetails = await userModel.findById(userDetails._id).select("-password -groups -communities -queries -posts -bio -background_cover -profile_picture -phone_number -googleAccount");

        return response.status(201).cookie("access_token", access_token, CookieOptions).cookie("referesh_token", referesh_token, CookieOptions).json(
            new APIResponse(201, {
                user: mainUserDetails,
                access_token,
                referesh_token
            })
        );

    } catch (error) {
        console.log("Login Error : ",error);
        response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}

/**
 * @description This Method is for Registration User
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */
export async function Registration(request, response) {
    try {
        /**
         *  Algorithm for Registration Function flow
         */
        // Get username,email,password from req.body
        // Put Validation on it
        // Check User is Already Exists or not 
        // If values are valid than save it Database

        /**
         *  1 .  Get username,email,password from req.body
         */

        const { userName, email, password } = request.body;

        /**
         * 2.  Validation 
         */
        if (!userName) {
            return response.status(403).json(new APIResponse(403, {}, "Username is Required !"));
        }
        if (!email) {
            return response.status(403).json(new APIResponse(403, {}, "Email is Required !"));
        }
        if (!password) {
            return response.status(403).json(new APIResponse(403, {}, "Password is Required !"));
        }

        /**
         * 3. Check us is Exists or not
         */

        const userExists = await userModel.findOne({ $or: [{ userName }, { email }] });

        if (userExists != null) {
            return response.status(401).json(new APIResponse(401, {}, "User is Already Exists !"));
        }

        /**
         * 4. Save Valid Values in Database
         */

        const collection = await userModel.create({ userName, email, password });
        // const result = await collection.save();
        return response.status(201).json(new APIResponse(201, {}, "User Created Successfully !"));
    } catch (error) {
        console.log("Registration error : " , error);
        return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}

/**
 * @description This Method is for Logout User
 * @param {*} request 
 * @param {*} response 
    @returns JSON RESPONSE TO USER
 */
export async function LogoutUser(request,response){
    try {
        const expireAuthToken = await authTokenModel.findOneAndUpdate({user_id : request.user_id},{$set : {
            referesh_token : null
        }},{
            new : true
        });
        return response.status(200).clearCookie("access_token",CookieOptions).clearCookie("referesh_token",CookieOptions).json( new APIResponse(200,{},"User Loggedout Successfully !"));
    } catch (error) {
        console.log("Logout User Error : " , error);
        return response.status(405).json(new APIResponse(405,{},"Something went Wrong !"));
    }
}

/**
 * @description Regenerate Access token 
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */
export async function regenerateAccessToken(request,response){
    try {
        const incomingRefereshToken =  request?.body?.referesh_token ;
        if(!incomingRefereshToken){
            return response.status(403).json(new APIResponse(403,{},"Please Provide Referesh Token !"));
        }

        let varifiedToken = jwt.verify(incomingRefereshToken,process.env.REFERESH_TOKEN_SECREATE);

        if(!varifiedToken){
            return response.status(403).json(new APIResponse(403,{},"Unauthorized Request !"));
        }

        let user = await userModel.findOne({_id:varifiedToken.userID}).select("-password");

        if(!user){
            return response.status(403).json(new APIResponse(403,{},"Unauthorized Access !"));
        }

        let newRefereshToken = await generateRefereshToken(user);
        let newAccessToken = await generateAccessToken(user);

        let collection = await authTokenModel.findOneAndUpdate({user_id:user._id},{$set:{access_token:newAccessToken}},{new : true});

        return response.status(201).cookie("access_token", newAccessToken, CookieOptions).cookie("referesh_token", collection.referesh_token, CookieOptions).json(new APIResponse(201,{
            access_token : newAccessToken,
            
        },"New Access Token Generated Successfully !"));

      
    } catch (error) {
        console.log("Regenerate Access Token Error : " , error);
        return response.status(405).json(new APIResponse(405,{},"Something went Wrong !"));
    }
}

/**
 * @description Send ResetPassword link to user
 * @param {*} request 
 * @param {*} response 
 * @returns @returns JSON RESPONSE TO USER
 */
export async function forgotPasswordMail(request,response){
    try {
        
        // Get user Email from req.body
        // Check the Email is Registered or not 
        // If teh email is Registered than Send Link for Reset password Via Email

        const {email} = request.body;
        if(!email){
            return response.status(403).json(new APIResponse(403,{},"Email is Required !"));
        }
        const registeredUser = await userModel.findOne({email:email}).select('-password -groups -communities -posts -queries');

        if(!registeredUser){
            return response.status(403).json(new APIResponse(403,{},"User is Not Registered !"));
        }

        const authTokens = await authTokenModel.findOne({user_id : registeredUser._id});
        console.log(authTokens);
        const payload = {
            userName : registeredUser.userName,
            access_token : authTokens.access_token
        }

        let emailTemplate = forgotPasswordMailTemplate(payload);

        /**
         * Send Email to the User
         */

        sendEmailService(email,emailTemplate);

        return response.status(201).json(new APIResponse(201,{},"Email Sent Successfully !"));

    } catch (error) {
        console.log("Regenerate Access Token Error : " , error);
        return response.status(405).json(new APIResponse(405,{},"Something went Wrong !"));
    }
}

/**
 * @description To Reset user Password
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */
export async function resetPassword(request,response){
    try {
        const {new_password} = request.body;
        if(request.user_id){
            let hash = await generateHashPassword(new_password);
            let resetPassword = await userModel.findByIdAndUpdate(request.user_id,{$set : {
                password : hash
            }});
            response.status(201).json(new APIResponse(201,{},"Password Updated Successfully !"));
        }
    } catch (error) {
        console.log("Resetpassword Error : " , error);
        return response.status(405).json(new APIResponse(405,{},"Something went Wrong !"));
    }
}

/**
 * @description Send 2FA OTP mail
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */

export async function Send2FAOTPMail(request,response){
    try {
        
    } catch (error) {
        
    }
}

/**
 * @description Verify 2FA OTP
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */

export async function Verify2FAOtp(request,response){
    try {
        
    } catch (error) {
        
    }
}