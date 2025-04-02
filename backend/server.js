import express from 'express'
import dotenv from 'dotenv'
import cookieParser from "cookie-parser"
import cloudinary from 'cloudinary'
import cors from 'cors'
import path from 'path'

import authRoute from './routes/auth.route.js'
import connectDB from './db/connectDB.js'
import userRoute from './routes/user.route.js'
import postRoute from './routes/post.route.js'
import notificationRoute from './routes/notification.route.js'

dotenv.config()
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key :  process.env.CLOUDINARY_API_KEY ,
    api_secret :  process.env.CLOUDINARY_API_SECRET
})
const __dirname = path.resolve();

const app = express();
const PORT = process.env.PORT

app.use(cors({
    origin: "http://localhost:3000",
    credentials : true
}))
app.use(express.json({
    limit : "5mb"  //default value is 100kb, we increased it to 5mb
}))  //this is to match json keys to variables
app.use(cookieParser()) // to read cookie
app.use(express.urlencoded({
    extended: true
}))

app.use('/api/auth',authRoute)
app.use('/api/users', userRoute)
app.use('/api/posts', postRoute)
app.use('/api/notifications', notificationRoute)

if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname,"/frontend/dist")))
    app.use("*",(req, res) => {
        res.sendFile(path.resolve(__dirname,"frontend","dist","index.html"))
    })
}

app.listen(PORT,()=> {
    console.log(`Server is running on ${PORT}`)
    connectDB()
})
