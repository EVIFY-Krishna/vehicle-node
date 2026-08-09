const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Role = require('../models/Role');
const generateToken = require('../utils/generateToken');
const socket = require('../utils/socket');

// @desc    Register a new user (operator)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, roleName } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }
    
    // Find role
    let role = await Role.findOne({ name: roleName || 'Operator' });
    if (!role) {
        // Create default role if it doesn't exist
        role = await Role.create({ name: roleName || 'Operator' });
    }

    const user = await User.create({
        name,
        email,
        password,
        role: role._id
    });

    if (user) {
        socket.getIO().emit('data-updated', { entity: 'user', action: 'create' });
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: role.name,
            token: generateToken(user._id),
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate('role');

    if (user && (await user.matchPassword(password))) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role ? user.role.name : 'Unknown',
            profileImage: user.profileImage,
            token: generateToken(user._id),
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

module.exports = {
    registerUser,
    authUser
};
