import mongoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const questionSchema = new mongoose.Schema({
    title: { type: String },
    description: { type: String },
    link: { type: String },
    origin: { type: String },
    userDetails: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users'
    },
    comments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "questionComments"
    }]
});

const questionsCommentsSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users"
    },
    question: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "questions"
    },
    body: { type: String }
})

// To use Aggregation Pipeline within User Model
questionSchema.plugin(mongooseAggregatePaginate);
questionsCommentsSchema.plugin(mongooseAggregatePaginate);

export const questionsModel = mongoose.model('questions', questionSchema);
export const questionCommentsModel = mongoose.model('questionComments', questionsCommentsSchema);