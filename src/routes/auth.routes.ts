import {Router} from 'express'
import * as userController from '../controllers/auth.controller'

const router = Router();
router.post('/signin',userController.singIn)
router.post('/signup',userController.singUp)

export default router;

