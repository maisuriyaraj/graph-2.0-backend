import { userModel } from "../models/users.model.js";
import APIResponse from "../utils/apiResponse.js";

export async function Login(request,response){
    try {
        return response.status(403).json(
            new APIResponse(403,{text : "I am Working"},"Welcome to Graph Community")
        );
    } catch (error) {
        response.status(200).send({status:false,error:error});
    }
} 

export async function Registration(request,response){
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

        const { userName,email,password } = request.body;

        /**
         * 2.  Validation 
         */
        if(!userName){
           return response.status(403).json(new APIResponse(403,{},"Username is Required !"));
        }
        if(!email){
           return response.status(403).json(new APIResponse(403,{},"Email is Required !"));
        }
        if(!password){
            return response.status(403).json(new APIResponse(403,{},"Password is Required !"));
        }

        /**
         * 3. Check us is Exists or not
         */

        const userExists = await userModel.findOne({$or : [{userName},{email}]});

        if(userExists != null){ 
            return response.status(401).json( new APIResponse(401,{},"User is Already Exists !") );
        }

        /**
         * 4. Save Valid Values in Database
         */

        const collection = await userModel.create({userName,email,password});
        // const result = await collection.save();
        return response.status(201).json(new APIResponse(201,{},"User Created Successfully !"));
    } catch (error) {
        return response.status(403).json(new APIResponse(403,{},"User Registration Error ."));
    }
}