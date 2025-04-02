import jwt from "jsonwebtoken"
import User from '../models/user.model.js'

const protectRoute = async (req,res,next) => {
    try {
        const token = req.cookies.jwt;
        if(!token){
            return res.status(400).json({error: "Unauthorized : No token Provided"})
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)  //check if the token has the jwt_secret key in it

        if (!decoded){
            return res.status(400).json({error: "Unauthorized : Invalid token"})
        }

        const user = await User.findOne({_id: decoded.userId}).select("-password")  // select("-password"), this os to not get the password from the mongoDB

        if(!user){
            return res.status(400).json({erroe: "User not found"})
        }

        req.user=user
        next();
        
    } catch (error) {
        console.log(`Error in protectRoute middleware: ${error}`)
        res.status(500).json({error: 'Internal server error'})
    }
}

export default protectRoute;