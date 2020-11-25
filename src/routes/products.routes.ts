import {Router} from 'express'
import * as productController from '../controllers/products.controller'

import * as authVerification from '../middlewares/authjtw.middleware'

const router = Router();

router.post('/searchproduct',authVerification.verifyToken,productController.searchProduct);
router.post('/trackedproducts',authVerification.verifyToken,productController.gettrackedProducts);
router.post('/tracknewproduct',authVerification.verifyToken,productController.trackProduct);
router.post('/gettrackedproduct',authVerification.verifyToken,productController.gettrackedProductById);
router.put('/updateinfotracker',authVerification.verifyToken,productController.updateTrackedInfoById);
router.delete('/deletetrackedproduct',authVerification.verifyToken,productController.deleteTrackedProductById);

export default router;