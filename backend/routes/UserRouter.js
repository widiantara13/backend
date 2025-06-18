import express from 'express';
import { getUser,
         getUserById,
         addUser,
         updateUser,
         deleteUser
} from '../controller/UserController.js';


const router = express.Router();

router.get('/user', getUser);
router.get('/user/:id', getUserById);
router.post('/user', addUser);
router.put('/user/:id', updateUser);
router.delete('/user/:id', deleteUser);

export default router;

