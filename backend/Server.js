import express from 'express';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import fileUpload from 'express-fileupload'; 
import db from './config/Config.js';
import SequelizeStore from 'connect-session-sequelize';
import UserRouter from './routes/UserRouter.js';
import ProductRouter from './routes/ProductRouter.js';
import AuthRouter from './routes/AuthRouter.js';


dotenv.config();

const app = express();

const sessionStore = SequelizeStore(session.Store);

const store = new sessionStore({
    db:db
});
(
    async () => {
        await db.sync();
        store.sync()
        console.log("Create database and tables");
    }
)();

app.use(session({
    secret: process.env.SESS_SECR,
    resave: false,
    saveUninitialized:true,
    store:store,
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
app.use(AuthRouter);
app.listen(process.env.APP_PORT, () => {
    console.log("Server is running")
});
