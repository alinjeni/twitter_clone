import User from '../models/user.model.js'
import Notification from '../models/notification.model.js'
import bcrypt from 'bcryptjs'
import cloudinary from 'cloudinary'

export const getProfile = async (req,res) => {
    try {

        const { userName } = req.params;
        const user = await User.findOne({userName})

        if(!userName){
            return res.status(404).json({error: "User not found"})
        }
        res.status(200).json(user)

    } catch (error) {
        console.log(`Error in getProfile controller : ${error}`)
        res.status(500).json({error: "Internal server error"})
    }
}

export const followUnfollowUser = async (req,res) => {
    try {
        const { id } = req.params;
        const userToModify = await User.findById({_id : id })
        const currentUser = await User.findById({_id : req.user._id})

        if( id === req.user.id){
            return res.status(400).json({error: "You can't follow or unflollow yourself"})
        }

        if(!userToModify || !currentUser){
            return res.status(404).json({error: "User not found"})
        }

        const isFollowing = currentUser.following.includes(id);  //checks if the id is present in the current user's following list

        if(isFollowing){
            //unfollow
            await User.findByIdAndUpdate({_id:id}, {$pull:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id: req.user._id}, {$pull:{following:id}})
            res.status(200).json({message: "Unfollowed successfully"})
        }else{
            //follow
            await User.findByIdAndUpdate({_id:id}, {$push:{followers:req.user._id}})
            await User.findByIdAndUpdate({_id: req.user._id}, {$push:{following:id}})

            const newNotification = new Notification({
                type: "follow",
                from: req.user.id,
                to: id
            })

            await newNotification.save();

            res.status(200).json({message: "Followed successfully"})
        }

    } catch (error) {
        console.log(`Error in followUnfollowUser controller : ${error}`)
        res.status(500).json({error: "Internal server error"})
    }
}

export const getSuggestedUsers = async (req, res ) => {
    try {
        const userId = req.user._id
        const userFollwedByme = await User.findById({_id : userId}).select("-password")

        const users = await User.aggregate([
         {
            $match: {
                _id : { $ne : userId}
            }
         },
         {
            $sample: {
                size:10
            }
         }
        ])
        
        const filterdUser = users.filter(user => !userFollwedByme.following.includes(user._id))
        const suggestedUsers = filterdUser.slice(0,4)

        suggestedUsers.forEach(user => user.password = null)
        res.status(200).json(suggestedUsers);
        
    } catch (error) {
        console.log(`Error in getSuggestedUsers controller : ${error}`)
        res.status(500).json({error: "Internal server error"})
    }
}

export const updateUser = async (req, res) => {
    try {
        const userId = req.user._id
        const { userName, fullName, email, currentPassword, newPassword, bio, link} = req.body
        let { profileImg, coverImg }= req.body
        let user = await User.findOne({_id:userId})
        if(!user){
            return res.status(404).json({error: "User not found"})
        } 
        if((!newPassword && currentPassword) || (!currentPassword && newPassword)){
            return res.status(400).json({error: "Please provide both new and current password"})
        }

        if(currentPassword && newPassword){
            const isMatch = await bcrypt.compare(currentPassword, user.password)
            if(!isMatch){
                return res.status(400).json({error: "Incorrect password"})
            }
            if(newPassword.length < 6){
                return res.status(400).json({error: "Password length should be atleast 6"})
            }

            const salt = await bcrypt.genSalt(10)
            user.password = await bcrypt.hash(newPassword,salt)
        }

        if(profileImg) {
            if(user.profileImg){
                // https://www.rtghj/rtyyfgh/rtyyfgh/rtyyfghb/sample-img.jpeg
                await cloudinary.uploader.destroy(user.profileImg.split("/").pop().split(".")[0]) // this logic is to get only 'sample-img' from the image url;
            }
            const uploadedResponse = await cloudinary.uploader.upload(profileImg)
            profileImg = uploadedResponse.secure_url;
        }
        if(coverImg) {
            if(user.coverImg){
                // https://www.rtghj/rtyyfgh/rtyyfgh/rtyyfghb/sample-img.jpeg
                await cloudinary.uploader.destroy(user.coverImg.split("/").pop().split(".")[0]) // this logic is to get only 'sample-img' from the image url;
            }
            const uploadedResponse = await cloudinary.uploader.upload(coverImg)
            coverImg = uploadedResponse.secure_url;
        }

        user.fullName = fullName || user.fullName
        user.email = email || user.email
        user.userName = userName || user.userName
        user.bio = bio || user.bio
        user.link = link || user.link
        user.profileImg = profileImg || user.profileImg
        user.coverImg = coverImg || user.coverImg

        user = await user.save()
        user.password =  null
        return res.status(200).json(user)

    } catch (error) {
        console.log(`Error in updateUser controller : ${error}`)
        res.status(500).json({error: "Internal server error"})
    }
}