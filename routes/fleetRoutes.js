const express = require('express');
const router = express.Router();
const { getFleets, createFleet, updateFleet, deleteFleet } = require('../controllers/fleetController');
const { protect, admin } = require('../middlewares/authMiddleware');

router.route('/')
    .get(protect, getFleets)
    .post(protect, admin, createFleet);

router.route('/:id')
    .put(protect, admin, updateFleet)
    .delete(protect, admin, deleteFleet);

module.exports = router;
