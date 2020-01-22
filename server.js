const fs = require('fs');
const https = require('https');
const debug = require('debug')('https');

const sslOptions = {
    key: fs.readFileSync('./security/localhost.key'),
    cert: fs.readFileSync('./security/localhost.crt'),
    dhparam: fs.readFileSync('./security/dh-strong.pem')
};

const app = require('./api/app');

const normalizePort = val => {
    let port = parseInt(val, 10);

    // Named Pipes
    if (isNaN(port)) { return val; }

    // Port Number
    if (port >= 0) { return port; }

    return false;
};

const onError = error => {
    if (error.syscall !== 'listening') { throw error; }

    const bind = typeof addr === 'string' ? 'port ' + addr : 'port ' + port;
    switch(error.code) {
        case 'EACCES':
            console.error(`${bind} requires elevated privileges`);
            break;
        case 'ADDREINUSE':
            console.error(`${bind} is already in use`);
            break;
        default:
            throw error;
    }
};

const onListening = () => {
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'port ' + addr : 'port ' + port;
    debug(`Listening on ${bind}`);
};

const port = normalizePort(process.env.PORT || '8000');
app.set('port', port);

const server = https.createServer(sslOptions, app);
server.on('error', onError);
server.on('listening', onListening);
server.listen(port);