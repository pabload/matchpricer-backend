import {Router} from 'express'
import * as userController from '../controllers/auth.controller'
import * as authVerification from '../middlewares/authjtw.middleware'

const router = Router();
router.post('/signin',userController.singIn);
router.post('/signup',userController.singUp);
router.get('/getuserinfo/:token',authVerification.verifyToken,userController.getUserInfo);
router.delete('/deleteaccount',authVerification.verifyToken,userController.deleteAccount);
router.put('/changepassword',authVerification.verifyToken,userController.changePassword);
export default router;

