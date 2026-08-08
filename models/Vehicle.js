const mongoose = require('mongoose');

const vehicleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    images: [{
        type: String
    }],
    registrationNumber: {
        type: String,
        required: true,
        unique: true
    },
    model: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['active', 'charging', 'maintenance'],
        default: 'active'
    },
    fleet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fleet',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
