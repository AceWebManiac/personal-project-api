const mongoose = require('mongoose');

const TokenSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Users'
    },
    token: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now,
        expires: 43200
    }
});

module.exports = mongoose.model('Tokens', TokenSchema);