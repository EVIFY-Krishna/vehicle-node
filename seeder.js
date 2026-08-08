const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const User = require('./models/User');
const Fleet = require('./models/Fleet');
const Vehicle = require('./models/Vehicle');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const importData = async () => {
    try {
        await Role.deleteMany();
        await User.deleteMany();
        await Fleet.deleteMany();
        await mongoose.connection.collection('vehicles').deleteMany({});

        const adminRole = await Role.create({ name: 'Admin' });
        const operatorRole = await Role.create({ name: 'Operator' });

        await User.create({
            name: 'Admin User',
            email: 'admin@gmail.com',
            password: 'Admin@123',
            role: adminRole._id
        });

        // Add a demo operator
        await User.create({
            name: 'Demo Operator',
            email: 'operator@gmail.com',
            password: 'Operator@123',
            role: operatorRole._id
        });

        const createdFleets = await Fleet.insertMany([
            { name: 'Downtown Fleet' },
            { name: 'Uptown Fleet' },
            { name: 'Suburban Fleet' }
        ]);

        await Vehicle.create({
            name: 'EV Delivery Van',
            description: 'Standard electric delivery van used in downtown area.',
            images: [],
            registrationNumber: 'EV-1001',
            model: 'Ford E-Transit',
            status: 'active',
            fleet: createdFleets[0]._id
        });

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
