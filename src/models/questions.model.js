import mongoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const questionSchema = new mongoose.Schema({
    title : {type:String},
    description : {type : String},
    link : { type : String},
    origin : { type:String }
});

const questionsModel = mongoose.model('questions',questionSchema);

export default questionsModel;