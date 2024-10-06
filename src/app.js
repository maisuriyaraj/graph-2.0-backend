import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();


app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true
}));

app.use(express.json({limit:'20kb'}));
app.use(urlencoded({extended:true,limit:'20kb'}));
app.use(express.static("public"));
app.use(cookieParser());

import { authRoute } from './routes/auth.routes.js';

app.use('/api/v1',authRoute);


export default app;