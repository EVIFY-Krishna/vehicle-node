const asyncHandler = require('express-async-handler');
const User = require('../models/User');
const Role = require('../models/Role');
const socket = require('../utils/socket');

// @desc    Get all users (non-admin)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const adminRole = await Role.findOne({ name: 'Admin' });
    const users = await User.find({ role: { $ne: adminRole?._id } }).populate('role', 'name');
    res.json(users);
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).populate('role');

    if (user) {
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role.name,
            profileImage: user.profileImage
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        
        if (req.body.password) {
            user.password = req.body.password;
        }

        if (req.file) {
            user.profileImage = req.file.path; // Cloudinary URL
        } else if (req.body.removeProfileImage === 'true') {
            user.profileImage = '';
        }

        const updatedUser = await user.save();
        socket.getIO().emit('data-updated', { entity: 'user', action: 'update' });

        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            profileImage: updatedUser.profileImage,
        });
    } else {
        res.status(404);
        throw new Error('User not found');
    }
});

module.exports = {
    getUsers,
    getUserProfile,
    updateUserProfile
};
