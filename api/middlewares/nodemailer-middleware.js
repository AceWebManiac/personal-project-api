const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'SendinBlue',
    auth: {
        user: process.env.SENDINBLUE_USERNAME,
        pass: process.env.SENDINBLUE_PASSWORD
    }
});

module.exports = transporter;