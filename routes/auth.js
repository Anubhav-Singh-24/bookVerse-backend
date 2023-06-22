const express = require('express')
const router = express.Router()
const User = require('../models/Users')
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const fetchuser = require('../middlewares/fetchuser')
const dotEnv = require('dotenv')
dotEnv.config()

const jwtSecret = process.env.SECRET

//Route 1: Creating a user using Post at the endpoint "api/auth/createuser"
router.post('/createuser', [
    // Validating the requests
    body('email', 'Enter a valid email').isEmail(),
    body('name', 'Enter a valid name').isLength({ min: 5 }),
    body('password', 'Password should be minimum 5 characters').isLength({ min: 5 }),
], async (req, res) => {
    let success = false;
    // If their is some error return badrequest and the error
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({ success, error: error.array() })
    }

    // Using try and catch to handle any unecessary errors
    try {
        // Checking for the duplicate emails
        let user = await User.findOne({ email: req.body.email })
        if (user) {
            return res.status(400).json({ success, error: "This email id already exists!!" })
        }

        // Hashing the password
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hashSync(req.body.password, salt)

        // Creating a user with name, id and password
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        })

        // The data that needed to be sent in JWT token
        const data = {
            user: {
                id: user.id
            }
        }

        // Creating an authentication token
        const authToken = jwt.sign(data, jwtSecret)
        success = true;
        res.json({ success,authToken })

    } catch (error) {
        console.error(error)
        res.status(500).send("Some Error Occured")
    }

})



//Route 2:  Authenticating a user using Post at the endpoint "api/auth/login"
router.post('/login', [
    // Validating the requests
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    let success = false;
    // If their is some error return badrequest and the error
    const error = validationResult(req)
    if (!error.isEmpty()) {
        return res.status(400).json({ success,error: error.array() })
    }

    const { email, password } = req.body;
    try {
        let user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({success, error: "Invalid Credentials!!" })
        }

        const pswdCmp = await bcrypt.compare(password, user.password);
        if (!pswdCmp) {
            return res.status(400).json({success, error: "Invalid Credentials!!" })
        }

        const data = {
            user: {
                id: user.id
            }
        }

        success = true;
        // Creating an authentication token
        const authToken = jwt.sign(data, jwtSecret)
        res.json({success, authToken })


    } catch (error) {
        console.error(error.message)
        res.status(500).send("Some error occured")
    }

})


// Route 3: Get user details using Post at the endpoint "/api/auth/getuser"
router.post('/getuser', fetchuser, async(req,res)=>{
    let success=false;
    try {
        let userId = req.user.id;
        const user = await User.findById(userId).select("-password")
        success = true;
        res.json({success,user})
    } catch (error) {
        console.error(error.message);
        res.status(500).json({success,message:"Some error Occured"})
    }
})

module.exports = router;