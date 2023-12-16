import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const hashPassword = async(password)=>{
    let salt = await bcrypt.genSalt(Number(process.env.SALT_ROUNDS))
    let hash = await bcrypt.hash(password,salt)
    return hash
}

const hashCompare = async(password,hash)=>{
    return await bcrypt.compare(password,hash)
}

const createToken = async(payload)=>{
    const token = await jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:process.env.JWT_EXPIRE
    })
    return token
}

const decodeToken = async(token)=>{
    const payload = await jwt.decode(token)
    return payload
}


const validate = async(req,res,next)=>{
    // let token = await req.headers.authorization?.split(" ")[1]
    let token = await req.query.token
    console.log(req.query)
    console.log(token)
    if(token)
    {
        let payload = await decodeToken(token)
        let currentTime = (+new Date())/1000
        
        if(currentTime<payload.exp)
        {
            next()
        }
        else
            res.status(400).send({message:"Token Expired"})
    }
    else
    {
        res.status(400).send({message:"No Token Found"})
    }
}

export default{
    hashPassword,
    hashCompare,
    createToken,
    validate,
    decodeToken
   
}