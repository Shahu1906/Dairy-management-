const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    customer: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    amount: {
        type: Number,
        required: true,
    },
    notes: {
        type: String,
        trim: true,
    }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);