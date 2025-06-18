import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload'; 
import db from './config/Config.js';
import UserRouter from './routes/UserRouter.js';
import ProductRouter from './routes/ProductRouter.js';


dotenv.config();

const app = express();

(
    async () => {
        await db.sync();
        console.log("Create database and tables");
    }
)();

app.use(session({
    secret: process.env.SESS_SECR,
    resave: false,
    saveUninitialized:true,
    cookie:{
        secure: 'auto'
    }
}))

app.use(cors({
    credentials: true,
    origin: process.env.CLIENT_URL
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
}));

app.use(express.static("public")); 
app.use(UserRouter);
app.use(ProductRouter);
app.listen(process.env.APP_PORT, () => {
    console.log("Server is running")
});
