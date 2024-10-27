import jwt from 'jsonwebtoken';
import { authTokenModel } from "../models/authTokens.model.js";
import { userModel } from "../models/users.model.js";
import APIResponse from "../utils/apiResponse.js";
import { generateAccessToken, generateRefereshToken, generateResetPasswordToken } from "../utils/generateTokens.js";
import { forgotPasswordMailTemplate, Send2FAOTPMail } from '../utils/emailTemplates.js';
import { sendEmailService } from '../utils/emailService.js';
import { comparePassword, generateHashPassword } from '../utils/generateHashPassword.js';
import { otpVerificationModel } from '../models/otpVerification.model.js';
import { generateOTP } from '../utils/helperFunctions.js';

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
         * 5. If User has Enabled 2FA Authentication than send him OTP code to 2FA Authentication 
         * 6. If user Exists and password is Right than Generate Access token and Referesh token
         * 7. Send Access token and Referesh Token in cookie
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

        const isValidCredentials = await userDetails.isPasswordCorrect(password);

        if (!isValidCredentials) {
            return response.status(403).json(new APIResponse(403, {}, "Invalid credentials !, Please Check your credentials ."));
        }

        /**
         * 5. If User has Enabled 2FA Authentication than send him OTP code to 2FA Authentication 
         */

        if (!userDetails.TwoFAEnabled) {
            /**
       * 6. Generate Access Token and Referesh token
       */
            const access_token = await generateAccessToken(userDetails);
            const referesh_token = await generateRefereshToken(userDetails);

            const collectionToken = await authTokenModel.findOne({ user_id: userDetails._id });
            if (collectionToken) {
                await authTokenModel.findOneAndUpdate({ user_id: userDetails._id }, {
                    $set: {
                        access_token: access_token, referesh_token: referesh_token
                    }
                });
            } else {
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
        }

        if (userDetails.TwoFAEnabled) {

            let otp = generateOTP();
            let template = Send2FAOTPMail(userDetails,otp);

            /**
                 * Send Email to the User
             */

             sendEmailService(email, template);
             // Generate Hash of OTP and Save in Database
             let hashOTP = await generateHashPassword(otp);

            await otpVerificationModel.create({
                userId : userDetails._id,
                otp : hashOTP
            });

            return response.status(201).json(
                new APIResponse(201, {
                    TwoFAEnabled: true,user : userDetails._id
                }, "OTP Sent Successfully !")
            );
        }
    } catch (error) {
        console.log("Login Error : ", error);
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
        console.log("Registration error : ", error);
        return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}

/**
 * @description This Method is for Logout User
 * @param {*} request 
 * @param {*} response 
    @returns JSON RESPONSE TO USER
 */
export async function LogoutUser(request, response) {
    try {
        const expireAuthToken = await authTokenModel.findOneAndUpdate({ user_id: request.user_id }, {
            $set: {
                referesh_token: null
            }
        }, {
            new: true
        });
        return response.status(200).clearCookie("access_token", CookieOptions).clearCookie("referesh_token", CookieOptions).json(new APIResponse(200, {}, "User Loggedout Successfully !"));
    } catch (error) {
        console.log("Logout User Error : ", error);
        return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}

/**
 * @description Regenerate Access token 
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */
export async function regenerateAccessToken(request, response) {
    try {
        const incomingRefereshToken = request?.body?.referesh_token;
        if (!incomingRefereshToken) {
            return response.status(403).json(new APIResponse(403, {}, "Please Provide Referesh Token !"));
        }

        let varifiedToken = jwt.verify(incomingRefereshToken, process.env.REFERESH_TOKEN_SECREATE);

        if (!varifiedToken) {
            return response.status(403).json(new APIResponse(403, {}, "Unauthorized Request !"));
        }

        let user = await userModel.findOne({ _id: varifiedToken.userID }).select("-password");

        if (!user) {
            return response.status(403).json(new APIResponse(403, {}, "Unauthorized Access !"));
        }

        let newAccessToken = await generateAccessToken(user);

        let collection = await authTokenModel.findOneAndUpdate({ user_id: user._id }, { $set: { access_token: newAccessToken } }, { new: true });

        return response.status(201).cookie("access_token", newAccessToken, CookieOptions).cookie("referesh_token", collection.referesh_token, CookieOptions).json(new APIResponse(201, {
            access_token: newAccessToken,

        }, "New Access Token Generated Successfully !"));


    } catch (error) {
        console.log("Regenerate Access Token Error : ", error);
        return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}

/**
 * @description Send ResetPassword link to user
 * @param {*} request 
 * @param {*} response 
 * @returns @returns JSON RESPONSE TO USER
 */
export async function forgotPasswordMail(request, response) {
    try {

        // Get user Email from req.body
        // Check the Email is Registered or not 
        // If teh email is Registered than Send Link for Reset password Via Email

        const { email } = request.body;
        if (!email) {
            return response.status(403).json(new APIResponse(403, {}, "Email is Required !"));
        }
        const registeredUser = await userModel.findOne({ email: email }).select('-password -groups -communities -posts -queries');

        if (!registeredUser) {
            return response.status(403).json(new APIResponse(403, {}, "User is Not Registered !"));
        }

        const resetPasswordToken = await generateResetPasswordToken(registeredUser._id);

        const authTokens = await authTokenModel.findOneAndUpdate({ user_id: registeredUser._id },{$set : {resetPasswordToken : resetPasswordToken}},{upsert : true});
        const payload = {
            userName: registeredUser.userName,
            resetPasswordToken: resetPasswordToken
        }

        let emailTemplate = forgotPasswordMailTemplate(payload);

        /**
         * Send Email to the User
         */

        sendEmailService(email, emailTemplate);

        return response.status(201).json(new APIResponse(201, {}, "Email Sent Successfully !"));

    } catch (error) {
        console.log("Regenerate Access Token Error : ", error);
        return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}

/**
 * @description To Reset user Password
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */
export async function resetPassword(request, response) {
    try {
        const { new_password } = request.body;
        if (request.user_id) {
            let hash = await generateHashPassword(new_password);
            let resetPassword = await userModel.findByIdAndUpdate(request.user_id, {
                $set: {
                    password: hash
                }
            });

            const authTokens = await authTokenModel.findOne({ user_id:request.user_id  });

            // Use the `unset` method to remove the field
            authTokens.unset('fieldNameToRemove');

            await authTokens.save();



            response.status(201).json(new APIResponse(201, {}, "Password Updated Successfully !"));
        }
    } catch (error) {
        console.log("Resetpassword Error : ", error);
        return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}


/**
 * @description Verify 2FA OTP
 * @param {*} request 
 * @param {*} response 
 * @returns JSON RESPONSE TO USER
 */

export async function Verify2FAOtp(request, response) {
    try {
        const {userId,otp} = request.body;
        if(!otp || otp == undefined){
            return response.status(401).json(new APIResponse(401,{},"OTP can not be Empty"));
        }

        let otpDetails = await otpVerificationModel.findOne({userId : userId});

        if(otpDetails){
            if(otpDetails.createdAt){
                if (Date(otpDetails.createdAt) < Date.now()) {
                    return response.status(401).json(new APIResponse(401,{},"OTP is Expired !")); // OTP is expired
                }
                
                let isVerifiedPassword = await comparePassword(otp,otpDetails.otp);
    
                if(!isVerifiedPassword){
                    return response.status(401).json(new APIResponse(401,{},"Invalid OTP ! Please Check your inbox !"));
                }
    
                const mainUserDetails = await userModel.findById(userId).select("-password -groups -communities -queries -posts -bio -background_cover -profile_picture -phone_number -googleAccount");
    
    
                const access_token = await generateAccessToken(mainUserDetails);
                const referesh_token = await generateRefereshToken(mainUserDetails);
    
                const collectionToken = await authTokenModel.findOne({ user_id: mainUserDetails._id });
                if (collectionToken) {
                    await authTokenModel.findOneAndUpdate({ user_id: mainUserDetails._id }, {
                        $set: {
                            access_token: access_token, referesh_token: referesh_token
                        }
                    });
                } else {
                    const collection = await authTokenModel.create({ user_id: mainUserDetails._id, access_token: access_token, referesh_token: referesh_token });
                    const result = await collection.save();
                }
    
                await otpVerificationModel.deleteMany({userId : userId});
    
                return response.status(201).cookie("access_token", access_token, CookieOptions).cookie("referesh_token", referesh_token, CookieOptions).json(
                    new APIResponse(201, {
                        user: mainUserDetails,
                        access_token,
                        referesh_token
                    })
                );
    
            } 
        }else{
            return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));    
        }
    } catch (error) {
        console.log("Verify OTP Error : ", error);
        return response.status(405).json(new APIResponse(405, {}, "Something went Wrong !"));
    }
}

/**
 * @description Resend OTP
 * 
 */

export async function ResendOtp(request,response){
    try {
        const {userId} = request.body;

        const userDetails = await userModel.findById(userId);

        if(!userDetails){
            return response.status(401).json(new APIResponse(401,{},"user Not Exists !"));
        }

        await otpVerificationModel.deleteMany({userId : userId});

        let otp = generateOTP();
        let template = Send2FAOTPMail(userDetails,otp);

        /**
             * Send Email to the User
         */

         sendEmailService(userDetails.email, template);
         // Generate Hash of OTP and Save in Database
         let hashOTP = await generateHashPassword(otp);

        await otpVerificationModel.create({
            userId : userDetails._id,
            otp : hashOTP
        });

        return response.status(201).json(
            new APIResponse(201, {
                TwoFAEnabled: true,user : userDetails._id
            }, "OTP Sent Successfully !")
        );

    } catch (error) {
        
    }
}