const User = require('../models/user-model');

const Transporter = require('../middlewares/nodemailer-middleware');

exports.recoverToken = (req, res) => {
    User
        .findOne({ email: req.body.email })
        .then(fetchedUser => {
            if (!fetchedUser) { return res.status(409).json({ message: 'Double-check your information and try again later!' }); }

            fetchedUser.generatePasswordReset();

            fetchedUser
                .save()
                .then(() => {
                    let link = `https://${req.headers.host}/api/auth/reset/${fetchedUser.resetPasswordToken}`;

                    const mailOptions = {
                        to: fetchedUser.email,
                        from: process.env.FROM_EMAIL,
                        subject: 'Password Reset Token',
                        text: `Hi costumer: \n
                            Please click on the following link ${link} to reset your password. \n\n
                            if you did not request this, please ignore this email.\n`
                    };

                    Transporter.sendMail(mailOptions)
                    .then(info => {
                        res.status(201).json({ 
                            message: `A reset email has been sent to ${fetchedUser.email}.`,
                            maiInfo: info
                        });
                    })
                    .catch(err => {
                        res.status(500).json({ error: err.message });
                    });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
};

exports.resetPassword = (req, res) => {
    User
        .findOne({ resetPasswordToken: req.params.resetToken, resetPasswordExpires: {$gt: Date.now()} })
        .then(fetchedUser => {
            if (!fetchedUser) { return res.status(401).json({ message: 'We were unable to find a valid token. Your token may have expired!' }) }

            fetchedUser.password = req.body.password;
            fetchedUser.resetPasswordToken = undefined;
            fetchedUser.resetPasswordExpires = undefined;
            fetchedUser.isVerified = true;

            fetchedUser
                .save()
                .then(() => {
                    let link = `https://${req.headers.host}/api/auth/reset/${fetchedUser.resetPasswordToken}`;

                    const mailOptions = {
                        to: fetchedUser.email,
                        from: process.env.FROM_EMAIL,
                        subject: 'Your Password has been changed',
                        text: `Hi costumer: \n
                        his is a confirmation that the password for your account ${fetchedUser.email} has just been changed.\n`
                    };

                    Transporter.sendMail(mailOptions)
                    .then(info => {
                        res.status(201).json({ 
                            message: `A reset email has been sent to ${fetchedUser.email}.`,
                            maiInfo: info
                        });
                    })
                    .catch(err => {
                        res.status(500).json({ error: err.message });
                    });
                })
                .catch(err => {
                    res.status(500).json({ error: err.message });
                });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
};