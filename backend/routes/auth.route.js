import express from 'express'
const router = express.Router()
import { signup,login,logout,getMe } from '../controllers/auth.controller.js'
import protectRoute from '../middleware/protectRoute.js'

router.post('/signup', signup)
router.post('/login', login)
router.post('/logout', logout)
router.get('/me', protectRoute, getMe)    //check if the current user is available in db and chek if it the right user

export default router;