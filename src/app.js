import express, { urlencoded } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();

mongoose.set('debug',true);

app.use(cors({
    origin: 'http://localhost:3000',
    credentials:true
}));

app.use(express.json({limit:'20kb'}));
// TO encord URL
app.use(urlencoded({extended:true,limit:'20kb'}));
// Share Files To server
app.use(express.static("public"));
// To Parse Cookies
app.use(cookieParser());

import { authRoute } from './routes/auth.routes.js';
import mongoose from 'mongoose';
import { fetchRoute } from './routes/fetch.routes.js';

app.use('/api/v1',authRoute);
app.use('/api/fetch',fetchRoute);


export default app;