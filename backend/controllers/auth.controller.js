import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import generateToken from '../utils/generateToken.js';

export const signup = async (req,res) => {
    try{
        const { userName, fullName, email, password } = req.body;
        const emailRegex = /^[^\s@]+@[^\@]+\.[^\s@]+$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({error: "Invalid email format"})
        }
        const existingEmail = await User.findOne({email: email})
        const existingUsername = await User.findOne({userName}) // the propertyname and the variable name is same so we can give any of it here

        if(existingEmail || existingUsername){
            return res.status(400).json({error : "Email or Username already exists"})
        }

        if(password.length < 6){
            return res.status(400).json({error: "Minimum length of password should be 6"})
        }

        //hashing password
        const salt = await bcrypt.genSalt(10) //hash 10 time to make it unbreakable
        const hashedpassword = await bcrypt.hash(password, salt)

        const newUser = new User({
            userName,
            fullName,
            email,
            password: hashedpassword
        })

        if(newUser){
            generateToken(newUser._id, res)
            await newUser.save();
            res.status(200).json({
                _id : newUser._id,
                userName: newUser.userName,
                fullName: newUser.fullName,
                email: newUser.email,
                followers: newUser.followers,
                following: newUser.following,
                profileImg: newUser.profileImg,
                coverImg: newUser.coverImg,
                bio: newUser.bio,
                link: newUser.link
            })
        }else{
            res.status(400).json({error: "Invalid user data"})
        }

    }catch(error){
        console.log(`Error in signup controller : ${error}`)
        res.status(500).json({error: "Internal Server Error"})
    }
} 
export const login = async (req,res) => {
    try{
        const { userName , password } = req.body
        const user = await User.findOne({userName})
        const  isPasswordCorrect = await bcrypt.compare(password, user?.password || '')

        if(!user || !isPasswordCorrect){
            return res.status(400).json({error: 'Invalid user or password'})
        }

        generateToken(user._id,res)

        res.status(200).json(
            {
                _id : user._id,
                userName: user.userName,
                fullName: user.fullName,
                email: user.email,
                followers: user.followers,
                following: user.following,
                profileImg: user.profileImg,
                coverImg: user.coverImg,
                bio: user.bio,
                link: user.link
            }
        )
    }catch(error){
        console.log(`Error in login controller ${error}`)
        res.status(500).json({error: "Internal server error"})
    }
} 

export const logout = async (req,res) => {
    try {
        res.cookie('jwt',"",{ maxAge: 0}) // deleting the cookie
        res.status(200).json({message : "Logout successfully"})
    } catch (error) {
        console.log(`Error in logout controller ${error}`)
        res.status(500).json({error: "Internal server error"})
    }
} 

export const getMe =async (req, res) => {
    try {
        const user = await User.findOne({_id: req.user._id}).select("-password")
        res.status(200).json(user)

    } catch (error) {
        console.log(`Error in getMe controller ${error}`)
        res.status(500).json({error: "Internal server error"})
    }
}