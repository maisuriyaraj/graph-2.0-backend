import dotenv from 'dotenv';
import app from "./app.js";
import connectDatabase from "./db/db.connection.js";

dotenv.config();

const port = process.env.PORT || 8080;

connectDatabase().then(()=>{
    app.listen(port,()=>{
        console.log("Server Started on PORT : " , port);
    });
}).catch((error)=>{
    console.log("CONNECTION ERROR  12093: ",error);
});