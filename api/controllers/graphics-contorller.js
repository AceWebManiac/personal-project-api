const databasePool = require('../middlewares/database-pool-middleware');

exports.dailyValues = (req, res) => {
    const sqlStatement = `
        SELECT DATEADD(WEEKDAY, DATEDIFF(WEEKDAY, 0, [stampDate]), 0) AS [DATE_TRUNCATED],
            COUNT(1) AS [RECORD_COUNT]
        FROM tb_cfdi
        GROUP BY DATEADD(WEEKDAY, DATEDIFF(WEEKDAY, 0, [stampDate]), 0)
        UNION
        SELECT DATEADD(WEEKDAY, DATEDIFF(WEEKDAY, 0, [stampDate]), 0) AS [DATE_TRUNCATED],
            COUNT(1) AS [RECORD_COUNT]
        FROM tb_retcfdi
        GROUP BY DATEADD(WEEKDAY, DATEDIFF(WEEKDAY, 0, [stampDate]), 0)
        ORDER BY [DATE_TRUNCATED] ASC;
    `;
    databasePool.executeQuery(sqlStatement)
    .then(results => {
        const resultArray = [];
        const resultSet = results.recordset;
        resultSet.forEach(result => {
            let dateValue = Date.parse(result.DATE_TRUNCATED);
            let countValue = result.RECORD_COUNT;
            resultArray.push([dateValue, countValue]);
        });
        res.status(200).send(resultArray);
    })
    .catch(err => {
        res.status(500).json({ error: err.message });
    })
};

