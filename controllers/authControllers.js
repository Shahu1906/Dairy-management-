const User = require('../models/User');
const jwt = require('jsonwebtoken');

// generateToken function remains the same
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user (customer) by an Admin
exports.register = async (req, res) => {
    // Destructure all the new fields from the request body
    const { 
        customerId, 
        name, 
        email, 
        password, 
        phone, 
        aadhar,
        address,
        bankDetails 
    } = req.body;

    try {
        const userExists = await User.findOne({ $or: [{ email }, { customerId }, { phone }, { aadhar }] });

        if (userExists) {
            return res.status(400).json({ success: false, message: 'User with this email, customer ID, phone, or Aadhar already exists' });
        }

        // Create the user with all the new fields
        const user = await User.create({
            customerId,
            name,
            email,
            password,
            phone,
            aadhar,
            address,
            bankDetails
        });

        // We don't need to return all the sensitive details, just a success message
        res.status(201).json({
            success: true,
            message: 'Customer registered successfully',
            user: { _id: user._id, name: user.name, email: user.email }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// @desc    Register an admin user (for initial setup)
// We'll update this too, although some fields might be optional for an admin
exports.registerAdmin = async (req, res) => {
    const { 
        customerId, 
        name, 
        email, 
        password,
        phone,
        aadhar 
    } = req.body;

    try {
        const adminExists = await User.findOne({ role: 'admin' });
        if (adminExists) {
            return res.status(400).json({ success: false, message: 'An admin user already exists.' });
        }

        await User.create({
            customerId, name, email, password, phone, aadhar, role: 'admin',
        });
        
        res.status(201).json({ success: true, message: 'Admin user created successfully.' });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};

// login function
exports.login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    try {
        const user = await User.findOne({ email }).select('+password');

        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user._id);

        res.status(200).json({ 
            success: true, 
            token, 
            role: user.role,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                customerId: user.customerId,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error', error: error.message });
    }
};