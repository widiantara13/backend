import express from 'express';
import { getProduct,
         getProductById,
         addProduct,
         updateProduct,
         deleteProduct
} from '../controller/ProductController.js';
import { verifyUser } from '../middleware/CheckAuth.js';


const router = express.Router();

router.get('/product', verifyUser, getProduct);
router.get('/product/:id', verifyUser, getProductById);
router.post('/product',verifyUser, addProduct);
router.put('/product/:id',verifyUser, updateProduct);
router.delete('/product/:id',verifyUser, deleteProduct);

export default router;

