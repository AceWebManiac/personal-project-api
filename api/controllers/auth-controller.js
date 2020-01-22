const User = require('../models/user-model');
const Token = require('../models/token-model');

const Transporter = require('../middlewares/nodemailer-middleware');

exports.registerUser = (req, res) => {
    User
        .findOne({ email: req.body.email })
        .then(fetchedUser => {
            if (fetchedUser) { return res.status(409).json({ message: 'Double-check your information and try again later!' }); }
            const user = new User({ ...req.body });
            user
                .save()
                .then(() => {
                    sendEmail(user, req, res);
                })
                .catch(err => {
                    return res.status(500).json({ error: err.message });
                });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });

};

exports.loginUser = (req, res) => {
    User
        .findOne({ email: req.body.email })
        .then(fetchedUser => {
            if (!fetchedUser) { return res.status(409).json({ message: 'Double-check your information and try again later!' }); }

            if (!fetchedUser.comparePasswords(req.body.password)) { return res.status(401).json({ message: 'Authentication failed!' }); }

            if (!fetchedUser.isVerified) { return res.status(401).json({ type: 'not-verified', message: 'Your account has not been verified!' }); }

            res.status(200).json({ token: fetchedUser.generateJWT(), userId: fetchedUser._id, expiresIn: 3600 });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
};

exports.verifyUser = (req, res) => {
    if (!req.params.token) { return res.status(400).json({ message: 'We were unable to find a valid token!' }); }

    Token
        .findOne({ token: req.params.token })
        .then(fetchedToken => {
            if (!fetchedToken) { return res.status(400).json({ message: 'We were unable to find a valid token. Your token may have expired!' }); }

            User
                .findOne({ _id: fetchedToken.userId })
                .then(fetchedUser => {
                    if (!fetchedUser) { return res.status(409).json({ message: 'Double-check your information and try again later!' }); }

                    if (fetchedUser.isVerified) { return res.status(401).json({ message: 'Your account has already been verified!' }); }

                    fetchedUser.isVerified = true;
                    fetchedUser
                        .save()
                        .then(() => {
                            res.status(200).json({ message: 'The account has been verified. Please log in.' });
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

exports.resendToken = (req, res) => {
    User
        .findOne({ email: req.body.email })
        .then(fetchedUser => {
            if (!fetchedUser) { return res.status(409).json({ message: 'Double-check your information and try again later!' }); }

            if (fetchedUser.isVerified) { return res.status(401).json({ message: 'Your account has already been verified!' }); }

            sendEmail(fetchedUser, req, res);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
};

sendEmail = (user, req, res) => {
    const token = user.generateVerificationToken();

    token
        .save()
        .then(() => {
            let link = `https://${req.headers.host}/api/auth/verify/${token.token}`;

            const mailOptions = {
                to: user.email,
                from: process.env.FROM_EMAIL,
                subject: 'Project Account Verification',
                text: `Hi costumer: \n
                    Please click on the following link ${link} to verify your account. \n\n
                    if you did not request this, please ignore this email.\n`
            };

            Transporter.sendMail(mailOptions)
            .then(info => {
                res.status(201).json({ 
                    message: `A verification email has been sent to ${user.email}.`,
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
};