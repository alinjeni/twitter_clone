import mongoose from 'mongoose'

const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URL)
        console.log('Connected to MongoDB')
    } catch (error){
        console.log(`Error in connecting to DB: ${error}`)
    }
}

export default connectDB