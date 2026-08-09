const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Role = require('./models/Role');
const User = require('./models/User');
const Fleet = require('./models/Fleet');
const Vehicle = require('./models/Vehicle');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const fleetNames = [
    'North Zone Fleet',
    'South Zone Fleet',
    'East Zone Fleet',
    'West Zone Fleet',
    'Downtown Express Fleet',
    'Airport Shuttle Fleet',
    'Corporate Fleet',
    'Delivery Fleet',
    'Long Haul Fleet',
    'Reserve Fleet'
];

const vehicleModels = [
    'Tesla Model 3', 'Tata Nexon EV', 'MG ZS EV', 'Hyundai Kona Electric',
    'Mahindra XUV400', 'BYD Atto 3', 'Kia EV6', 'Ford F-150 Lightning',
    'Ola S1 Pro', 'Ather 450X'
];

const statuses = ['active', 'charging', 'maintenance'];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateRegistrationNumber(index) {
    const stateCodes = ['GJ', 'MH', 'DL', 'KA', 'TN'];
    const state = randomFrom(stateCodes);
    const rtoCode = String(Math.floor(Math.random() * 99)).padStart(2, '0');
    const letters = String.fromCharCode(65 + Math.floor(Math.random() * 26)) +
        String.fromCharCode(65 + Math.floor(Math.random() * 26));
    const number = String(1000 + index).padStart(4, '0');
    return `${state}-${rtoCode}-${letters}-${number}`;
}

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

        const fleetDocs = fleetNames.map(name => ({ name }));
        const fleets = await Fleet.insertMany(fleetDocs);
        console.log(`Inserted ${fleets.length} fleets`);

        const vehicleDocs = [];
        let vehicleCounter = 1;

        fleets.forEach((fleet, fleetIndex) => {
            for (let i = 0; i < 2; i++) {
                const model = randomFrom(vehicleModels);
                vehicleDocs.push({
                    name: `${model} - Unit ${vehicleCounter}`,
                    description: `${model} assigned to ${fleet.name}, used for daily operations.`,
                    images: [
                        `https://picsum.photos/seed/vehicle${vehicleCounter}a/600/400`,
                        `https://picsum.photos/seed/vehicle${vehicleCounter}b/600/400`
                    ],
                    registrationNumber: generateRegistrationNumber(vehicleCounter),
                    model: model,
                    status: randomFrom(statuses),
                    fleet: fleet._id
                });
                vehicleCounter++;
            }
        });

        const vehicles = await Vehicle.insertMany(vehicleDocs);
        console.log(`Inserted ${vehicles.length} vehicles`);

        console.log('Data Imported!');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

importData();
