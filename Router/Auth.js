// src/routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../Module/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Signup Route
router.post('/register', async (req, res) => {
    const { name, email, phone, pin, role } = req.body;
    try {
        const query = {
            email: email
        }
        let user = await User.findOne({ email });
        const userPhone = await User.findOne({ phone });
        console.log(userPhone);
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }
        if (userPhone) {
            return res.status(400).json({ message: 'User already exists' });
        }
        user = new User({
            name,
            email,
            phone,
            pin,
            role,
            status: 'pending'
        });
        user.pin = await bcrypt.hash(pin, 10)
        await user.save();
        res.status(201)
            .json({
                message: 'register successfully',
                success: true
            })
        // jwt.sign(
        //     {email:email},
        //     process.env.JWT_SECRET_TOKEN,
        //     { expiresIn: '1h' },
        //     (err, token) => {
        //         if (err) throw err;
        //         res.status(201).json({ message: 'register successsfully', token });
        //     }
        // );
    } catch (err) {
        res.status(500).send('Server error');
    }
});

// Signin Route
router.post('/login', async (req, res) => {
    const { email, pin } = req.body;
    try {
        let user = await User.findOne({ email });
        console.log(user, 'usersfind');
        if (!user) {
            return res.status(400).json({ message: 'Incorrect Email' });
        }
        console.log(user.pin, 'pin');
        if (user.status === 'pending') {
            return res.status(400).json({ message: "Admin has not active your account" });
        }
        const isMatch = await bcrypt.compare(pin, user.pin)
        console.log(isMatch);
        if (!isMatch) {
            return res.status(400).json({ message: 'Incorrected PIN' });
        }

        jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET_TOKEN,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) {
                    console.log('error 404040', err);
                }
                res.status(201).json({ message: 'login successsfully', token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
