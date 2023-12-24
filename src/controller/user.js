import userModel from '../models/user.js'
import EmailService from '../common/emailService.js'

import Auth from '../common/auth.js'

const create = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email})
        if(!user){
            req.body.password = await Auth.hashPassword(req.body.password)
            await userModel.create(req.body)
            res.status(201).send({
                message:"User Created Successfully"
             })
        }
        else
        {
            res.status(400).send({message:`User with ${req.body.email} already exists`})
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}

const login = async(req,res)=>{
    try {
        let user = await userModel.findOne({email:req.body.email})
        if(user)
        {
            let hashCompare = await Auth.hashCompare(req.body.password,user.password)
            if(hashCompare)
            {
                let token = await Auth.createToken({
                    id:user._id,
                    Name:user.Name,
                    email:user.email,
                    role:user.role
                })
                let userData = await userModel.findOne({email:req.body.email},{_id:0,password:0,status:0,createdAt:0})
                res.status(200).send({
                    message:"Login Successfull",
                    token,
                    userData
                })
            }
            else
            {
                res.status(400).send({
                    message:`Invalid Password`
                })
            }
        }
        else
        {
            res.status(400).send({
                message:`Account with ${req.body.email} does not exists!`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}
const forgetPassword = async(req,res)=>{
    try {
       
        let user = await userModel.find({email:req.body.email},{password:0})
        
        if(user.length===1)
        {
            //create a token and send the reset url via mail
            let token = await Auth.createToken({
                email:user[0].email,
                Name:user[0].Name,
                 id:user[0]._id
            })
            let url = `http://localhost:5173/resetpassword?token=${token}`
        //  await EmailService.forgetPassword({name:`${user[0].Name} `,email:'prabhashok2501@gmail.com',url})
             await EmailService.forgetPassword({name:`${user[0].Name}`,email:user[0].email,url})
            res.status(200).send({
                message:"Reset Password Link Sent",
                url
            })
        }
        else
        {
            res.status(400).send({
                message:`Account with ${req.body.email} does not exists`
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}
const resetPassword = async(req,res)=>{
    try {
        // let token = req.headers.authorization?.split(" ")[1]

   
        let token = await req.body.tokens
        console.log("token",token)
         let data = await Auth.decodeToken(token)
         

         if(req.body.newpassword === req.body.confirmpassword)
         {
            let user = await userModel.findOne({email:data.email})
            user.password = await Auth.hashPassword(req.body.newpassword)
            await user.save()

            res.status(200).send({
                message:"Password Updated Successfully",
            })
         }
         else
         {
            res.status(400).send({
                message:"Password Does Not match",
            })
        }
    } catch (error) {
        res.status(500).send({
            message:"Internal Server Error",
            error:error.message
        })
    }
}
export default {
    create,
    login,
    forgetPassword,
    resetPassword
}