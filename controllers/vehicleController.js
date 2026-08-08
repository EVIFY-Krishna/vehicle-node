const asyncHandler = require('express-async-handler');
const Vehicle = require('../models/Vehicle');
const Fleet = require('../models/Fleet');

// @desc    Get all vehicles (with filtering & pagination)
// @route   GET /api/vehicles
// @access  Private
const getVehicles = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.limit) || 10;
    const page = Number(req.query.page) || 1;

    const keyword = req.query.keyword
        ? {
            registrationNumber: {
                $regex: req.query.keyword,
                $options: 'i',
            },
        }
        : {};

    const statusFilter = req.query.status ? { status: req.query.status } : {};
    const fleetFilter = req.query.fleet ? { fleet: req.query.fleet } : {};

    const query = { ...keyword, ...statusFilter, ...fleetFilter };

    const count = await Vehicle.countDocuments(query);
    const vehicles = await Vehicle.find(query)
        .populate('fleet', 'name')
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    res.json({ vehicles, page, pages: Math.ceil(count / pageSize) });
});

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
// @access  Private
const getVehicleById = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id).populate('fleet', 'name');

    if (vehicle) {
        res.json(vehicle);
    } else {
        res.status(404);
        throw new Error('Vehicle not found');
    }
});

// @desc    Create a vehicle
// @route   POST /api/vehicles
// @access  Private/Admin
const createVehicle = asyncHandler(async (req, res) => {
    let { name, description, images, registrationNumber, model, status, fleetId } = req.body;
    
    if (typeof images === 'string') {
        if (images.startsWith('[')) {
            try { images = JSON.parse(images); } catch(e) { images = []; }
        } else {
            images = [images];
        }
    }
    if (!images) images = [];

    // Add newly uploaded images from Cloudinary
    if (req.files && req.files.length > 0) {
        const uploadedImages = req.files.map(file => file.path);
        images = [...images, ...uploadedImages];
    }

    const vehicleExists = await Vehicle.findOne({ registrationNumber });

    if (vehicleExists) {
        res.status(400);
        throw new Error('Vehicle with this registration number already exists');
    }

    const fleet = await Fleet.findById(fleetId);
    if (!fleet) {
        res.status(404);
        throw new Error('Fleet not found');
    }

    const vehicle = new Vehicle({
        name,
        description,
        images: images || [],
        registrationNumber,
        model,
        status: status || 'active',
        fleet: fleetId
    });

    const createdVehicle = await vehicle.save();
    res.status(201).json(createdVehicle);
});

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private/Admin
const updateVehicle = asyncHandler(async (req, res) => {
    let { name, description, images, registrationNumber, model, status, fleetId } = req.body;

    if (typeof images === 'string') {
        if (images.startsWith('[')) {
            try { images = JSON.parse(images); } catch(e) { images = []; }
        } else {
            images = [images];
        }
    }

    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
        vehicle.name = name || vehicle.name;
        vehicle.description = description || vehicle.description;
        
        let newImages = images ? [...images] : [...vehicle.images];
        if (req.body.clearExistingImages === 'true') {
            newImages = [];
        }
        if (req.files && req.files.length > 0) {
            const uploadedImages = req.files.map(file => file.path);
            newImages = [...newImages, ...uploadedImages];
        }
        vehicle.images = newImages;
        vehicle.registrationNumber = registrationNumber || vehicle.registrationNumber;
        vehicle.model = model || vehicle.model;
        vehicle.status = status || vehicle.status;
        
        if (fleetId) {
            const fleet = await Fleet.findById(fleetId);
            if (!fleet) {
                res.status(404);
                throw new Error('Fleet not found');
            }
            vehicle.fleet = fleetId;
        }

        const updatedVehicle = await vehicle.save();
        res.json(updatedVehicle);
    } else {
        res.status(404);
        throw new Error('Vehicle not found');
    }
});

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private/Admin
const deleteVehicle = asyncHandler(async (req, res) => {
    const vehicle = await Vehicle.findById(req.params.id);

    if (vehicle) {
        await vehicle.deleteOne();
        res.json({ message: 'Vehicle removed' });
    } else {
        res.status(404);
        throw new Error('Vehicle not found');
    }
});

module.exports = {
    getVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    deleteVehicle
};
