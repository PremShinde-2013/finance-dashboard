require('dotenv').config();

const app = require('./src/app');
const logger = require('./src/config/logger');

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
    logger.info(`Finance Dashboard API running on port ${port}`);
});
