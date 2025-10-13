const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    customerId: {
        type: String,
        required: [true, 'Customer ID is required'],
        unique: true,
        trim: true,
    },
    name: {
        type: String,
        required: [true, 'Please provide a name'],
        trim: true,
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    // --- New Field Added ---
    phone: {
        type: String,
        required: [true, 'Please provide a phone number'],
        unique: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please add a valid 10-digit phone number']
    },
    // --- New Field Added ---
    aadhar: {
        type: String,
        required: [true, 'Please provide an Aadhar number'],
        unique: true,
        trim: true,
        match: [/^[0-9]{12}$/, 'Please add a valid 12-digit Aadhar number']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 6,
        select: false,
    },
    role: {
        type: String,
        enum: ['customer', 'admin'],
        default: 'customer',
    },
    // --- New Object Added ---
    address: {
        street: String,
        city: String,
        pincode: String,
    },
    // --- New Object Added ---
    bankDetails: {
        upiId: String,
        accountHolderName: String,
        accountNumber: String,
        ifscCode: String
    }
}, { timestamps: true });

// Hash password before saving (no changes here)
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to compare entered password (no changes here)
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);