const dotEnv = require('dotenv')
dotEnv.config()
const mongoose = require('mongoose')
// const mongooseURI = 

mongoose.set('strictQuery',false)


// Connecting to our database
const connect = ()=>{
    mongoose.connect(process.env.MONGO_URI).then((res)=>{
        console.log("Successfully connected to database")
    }).catch((err)=>{
        console.log(err)
        process.exit(1)
    })
}

module.exports = connect;