const sqlService = require('mssql');

const sqlConfig = {
    user: 'reporter',
    password: '12121212qw',
    server: 'localhost',
    database: 'TimbradorComercial_BEAT',
    connectionTimeout: 300000,
    requestTimeout: 300000,
    options: {
        encrypt: false,
        enableArithAbort: true
    },
    pool: {
        min: 1,
        max: 10,
        idleTimeoutMillis: 300000
    }
};

async function executeQuery(sqlStatement) {
    const sqlPool = new sqlService.ConnectionPool(sqlConfig, 'UTF-8');
    await sqlPool.connect();
    try {
        const sqlRequest = new sqlService.Request(sqlPool);
        const sqlResult = await sqlRequest.query(sqlStatement);
        return sqlResult;
    } catch(err) {
        throw err;
    } finally {
        sqlService.close();
    }
};

module.exports.executeQuery = executeQuery;