const dotEnv = require('dotenv')
dotEnv.config()
const connectDB = require('./db.js')
const express = require('express')
var cors = require('cors')

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(cors())

app.use('/api/auth',require('./routes/auth.js'))
app.use('/api/books',require('./routes/books.js'))


app.listen(PORT,()=>{
    console.log(`Server listening at port ${PORT}`)
})