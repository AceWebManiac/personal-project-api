const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const Token = require('./token-model');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    resetPasswordToken: {
        type: String,
        required: false
    },
    resetPasswordExpires: {
        type: Date,
        required: false
    }
});

UserSchema.pre('save', function(next) {
    const user = this;

    if (!user.isModified('password')) { return next(); }

    bcrypt.genSalt(15, function(err, salt) {
        if (err) { return next(err); }

        bcrypt.hash(user.password, salt, function(err, hash) {
            if (err) { return next(err); }

            user.password = hash;
            next();
        });
    });
});

UserSchema.methods.comparePasswords = function(password) {
    return bcrypt.compareSync(password, this.password);
};

UserSchema.methods.generateJWT = function() {
    let payload = {
        id: this._id,
        email: this.email
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '1hr'
    });
};

UserSchema.methods.generatePasswordReset = function() {
    this.resetPasswordToken = crypto.randomBytes(25).toString('hex');
    this.resetPasswordExpires = Date.now() + 3600000;
};

UserSchema.methods.generateVerificationToken = function() {
    let payload = {
        userId: this._id,
        token: crypto.randomBytes(25).toString('hex')
    };

    return new Token(payload);
};

module.exports = mongoose.model('Users', UserSchema);