const express = require('express');
const router = express.Router();
const { getVehicles, getVehicleById, createVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .get(protect, getVehicles)
    .post(protect, admin, upload.array('images', 5), createVehicle);

router.route('/:id')
    .get(protect, getVehicleById)
    .put(protect, admin, upload.array('images', 5), updateVehicle)
    .delete(protect, admin, deleteVehicle);

module.exports = router;
