import mongoose from "mongoose";

const otpVerificationSchema = new mongoose.Schema({
    userId : {type:String},
    otp : {type:String}
},{timestamps : true});

export const otpVerificationModel = mongoose.model('otps',otpVerificationSchema);
