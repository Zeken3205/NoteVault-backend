const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = "zkkene"

// Create a USER using: POST "/api/auth/createuser". Doesn't require auth
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
        return res.send({ errors: result.array() });
    }
    try {
        // Check if the user with the same email already exists
        const existingUser = await User.findOne({ email: req.body.email }); //returns a promise so we use await
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already in use' });
        }

        // If the email is unique
        // using bcrypt to create salt and hashing
        const salt = await bcrypt.genSalt(10);//returns a promise so we use await
        const secPass = await bcrypt.hash(req.body.password, salt);//returns a promise so we use await

        // create the new user
        const user = await User.create({//returns a promise so we use await
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });
        const data = {          //passing only id and with id i can access all the information
            user: {
                id: user.id
            }
        }
        const authtoken = jwt.sign(data, JWT_SECRET);//creation of auth token
        res.json({ authtoken });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
module.exports = router;
