import express from 'express';
import { getUser,
         getUserById,
         addUser,
         updateUser,
         deleteUser
} from '../controller/UserController.js';
import { verifyUser, isAdmin } from '../middleware/CheckAuth.js';

const router = express.Router();

router.get('/user', verifyUser,isAdmin, getUser);
router.get('/user/:id', verifyUser,isAdmin, getUserById);
router.post('/user',verifyUser,isAdmin, addUser);
router.put('/user/:id',verifyUser,isAdmin, updateUser);
router.delete('/user/:id',verifyUser,isAdmin, deleteUser);

export default router;

