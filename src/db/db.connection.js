import mongoose from "mongoose";


async function connectDatabase(){
    try {
        const dbconnection = await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongo Connected",dbconnection.connection.host);    
    } catch (error) {
        console.log("MONGO CONNECTION ERROR : " , error);
        process.exit(1);
    }
    
} 

export default connectDatabase;