const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');

const logger = require('./config/logger');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler.middleware');
const { globalRateLimiter } = require('./middleware/rateLimiter.middleware');
const { setupSwagger } = require('./config/swagger');
const { successResponse } = require('./utils/apiResponse');
const authRoutes = require('./modules/auth/auth.routes');
const usersRoutes = require('./modules/users/users.routes');
const categoriesRoutes = require('./modules/categories/categories.routes');
const transactionsRoutes = require('./modules/transactions/transactions.routes');
const dashboardRoutes = require('./modules/dashboard/dashboard.routes');

const app = express();

app.use(helmet());
app.use(
    cors({
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    })
);
app.use(morgan('combined', { stream: { write: (message) => logger.http(message.trim()) } }));
app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(globalRateLimiter);
setupSwagger(app);

app.get('/health', (_req, res) => {
    return successResponse(res, {
        message: 'API is running',
        data: {
            service: 'finance-dashboard-api',
            status: 'ok',
            notice: 'If the server was inactive, the first request may take 2-3 minutes while Render wakes it up.',
            timestamp: new Date().toISOString(),
        },
    });
});

app.get('/api/v1/health', (_req, res) => {
    return successResponse(res, {
        message: 'API v1 is running',
        data: {
            service: 'finance-dashboard-api',
            status: 'ok',
            version: 'v1',
            notice: 'If the server was inactive, the first request may take 2-3 minutes while Render wakes it up.',
            timestamp: new Date().toISOString(),
        },
    });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/transactions', transactionsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
