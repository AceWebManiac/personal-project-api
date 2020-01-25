require('dotenv').config();

const helmet = require('helmet');
const morgan = require('morgan');
const express = require('express');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth-routes');
const graphicRoutes = require('./routes/graphics-routes');

const app = express();

app.use(helmet());
app.use(morgan('common'));

mongoose
    .connect(
        process.env.MONGO_LOCAL_URL, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useUnifiedTopology: true
        }
    )
    .then(() => {
        console.log(`The connection to ${mongoose.connection.name} has been successful!`);
    })
    .catch(() => {
        console.error(`The connection to ${mongoose.connection.name} has been failed!`);
    });

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// CORS Headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        return res.status(200);
    }
    next();
});

// REST API Routes
app.use('/api/auth', authRoutes);
app.use('/api/graphic', graphicRoutes);

// Error Handling
app.use((req, res, next) => {
    const error = new Error('Oopps, try again!');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.json({ error: error.message });
});

module.exports = app;