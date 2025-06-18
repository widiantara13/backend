import express from 'express';
import { Login,
         Logout,
         isLogin
} from '../controller/AuthController.js';

const router = express.Router();

router.post("/login", Login);
router.delete("/logout", Logout);
router.get("/islogin", isLogin);

export default router;