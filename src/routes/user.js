import express from "express"
import UserController from '../controller/user.js'
const router= express.Router()
import Auth from "../common/auth.js"

router.get('/',(req,res)=>{
    res.status(200).send(`
    <h1>welcome to Password   user </h1>
    `)
})
router.post('/signup',UserController.create)

router.post('/login',UserController.login)
router.post('/reset-password',UserController.resetPassword)
router.post('/forget-password',UserController.forgetPassword)


export default router