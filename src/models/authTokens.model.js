import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const authTokenSchema = new mongoose.Schema({
    user_id : {type:mongoose.Schema.Types.ObjectId,required:true},
    device_token : { type : String,default : ''},
    fcm_token : { type : String ,default : ''},
    access_token : {type:String , default : ''},
    referesh_token : { type : String , default : ''}
} ,{
    strict : false
});

// Inject Plugin to use Mongoose Aggregate Queries  
authTokenSchema.plugin(mongooseAggregatePaginate);


export const authTokenModel = mongoose.model('authTokens',authTokenSchema);