const asyncHandler = require('express-async-handler');
const Fleet = require('../models/Fleet');

// @desc    Get all fleets
// @route   GET /api/fleets
// @access  Private
const getFleets = asyncHandler(async (req, res) => {
    const fleets = await Fleet.find({});
    res.json(fleets);
});

// @desc    Create a fleet
// @route   POST /api/fleets
// @access  Private/Admin
const createFleet = asyncHandler(async (req, res) => {
    const { name } = req.body;
    const fleetExists = await Fleet.findOne({ name });
    
    if (fleetExists) {
        res.status(400);
        throw new Error('Fleet name already exists');
    }

    const fleet = await Fleet.create({ name });
    res.status(201).json(fleet);
});

// @desc    Update a fleet
// @route   PUT /api/fleets/:id
// @access  Private/Admin
const updateFleet = asyncHandler(async (req, res) => {
    const fleet = await Fleet.findById(req.params.id);
    
    if (fleet) {
        fleet.name = req.body.name || fleet.name;
        const updatedFleet = await fleet.save();
        res.json(updatedFleet);
    } else {
        res.status(404);
        throw new Error('Fleet not found');
    }
});

// @desc    Delete a fleet
// @route   DELETE /api/fleets/:id
// @access  Private/Admin
const deleteFleet = asyncHandler(async (req, res) => {
    const fleet = await Fleet.findById(req.params.id);
    
    if (fleet) {
        await Fleet.deleteOne({ _id: fleet._id });
        res.json({ message: 'Fleet removed' });
    } else {
        res.status(404);
        throw new Error('Fleet not found');
    }
});

module.exports = { getFleets, createFleet, updateFleet, deleteFleet };
