const mongoose = require('mongoose');

const roleSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true, // e.g., 'Admin', 'Operator'
    }
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);
