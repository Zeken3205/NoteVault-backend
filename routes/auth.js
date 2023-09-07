const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchuser = require('../middleware/fetchuser');
const JWT_SECRET = "zkkene";

// ROUTE-1: Create a USER using: POST "/api/auth/createuser". Doesn't require login
router.post('/createuser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
    const result = validationResult(req);
    let success = false;
    if (!result.isEmpty()) {
        return res.send({ success, errors: result.array() });
    }
    try {
        // Check if the user with the same email already exists
        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.status(400).json({ success, error: 'Email is already in use' });
        }

        // If the email is unique
        // using bcrypt to create salt and hashing
        const salt = await bcrypt.genSalt(10);
        const secPass = await bcrypt.hash(req.body.password, salt);

        // create the new user
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: secPass
        });

        // Create an authentication token (JWT) containing the user's ID
        const data = {
            user: {
                id: user.id
            }
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        success = true;
        res.json({ success, authtoken });
    } catch (error) {
        success = false;
        res.status(500).json({ success, error: 'Failed to create user' });
    }
});

// ROUTE-2: Authenticate a USER using: POST "/api/auth/login". Doesn't require login
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
    const result = validationResult(req);
    let Success = false;
    if (!result.isEmpty()) {
        return res.send({ errors: result.array() });
    }

    const { email, password } = req.body;
    try {
        // Find the user by email
        let user = await User.findOne({ email });
        if (!user) {
            Success = false;
            return res.status(400).json({ Success, error: "Wrong email or password" });
        }

        // Compare the provided password with the hashed password stored in the database
        const passwordcompare = await bcrypt.compare(password, user.password);
        if (!passwordcompare) {
            Success = false;
            return res.status(400).json({ Success, error: "Wrong email or password" });
        }

        // If the provided password is correct, create an authentication token (JWT) containing the user's ID
        const data = {
            user: {
                id: user.id
            }
        };
        const authtoken = jwt.sign(data, JWT_SECRET);
        Success = true;
        res.json({ Success, authtoken });
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// ROUTE-3: Get logged-in USER Details using: POST "/api/auth/getuser". Requires login
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        // Get the user's ID from the authenticated request (provided by the fetchuser middleware)
        const userid = req.user.id;

        // Fetch the user details from the database by the user's ID (excluding the password field)
        const user = await User.findById(userid).select("-password");
        res.send(user);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
