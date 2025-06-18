import express from 'express';
import { getProduct,
         getProductById,
         addProduct,
         updateProduct,
         deleteProduct
} from '../controller/ProductController.js';


const router = express.Router();

router.get('/product', getProduct);
router.get('/product/:id', getProductById);
router.post('/product', addProduct);
router.put('/product/:id', updateProduct);
router.delete('/product/:id', deleteProduct);

export default router;

