const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const path = require('path');

const deployedServerUrl = process.env.API_BASE_URL || process.env.RENDER_EXTERNAL_URL;
const normalizedServerUrl = deployedServerUrl ? deployedServerUrl.replace(/\/$/, '') : null;

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Finance Dashboard API',
      version: '1.0.0',
      description: [
        'Backend API docs for Finance Dashboard (Auth, Users, Categories, Transactions, Dashboard).',
        '',
        'Swagger URL: https://finance-dashboard-7cno.onrender.com/api/docs/',
        'Frontend URL: https://finance-dashboard-web.vercel.app/login',
        '',
        '## Demo Accounts',
        '- Admin: admin@finance.dev / Password: Admin@1234',
        '- Analyst: analyst@finance.dev / Password: Analyst@1234',
        '- Viewer: viewer@finance.dev / Password: Viewer@1234',
        '',
        '## How To Use Bearer Authorization',
        '1. Open `POST /api/v1/auth/login` and login with one of the demo accounts.',
        '2. Copy the `token` value from the response.',
        '3. Click the **Authorize** button at the top of Swagger UI.',
        '4. Enter: `Bearer <token>` and click **Authorize**.',
        '5. Call protected endpoints. Re-login when token expires.',
      ].join('\n'),
    },
    servers: [
      ...(normalizedServerUrl
        ? [
          {
            url: normalizedServerUrl,
            description: 'Deployed server',
          },
        ]
        : []),
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        ApiSuccess: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Request completed successfully' },
            data: { nullable: true },
            meta: { nullable: true },
          },
        },
        ApiError: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Validation failed' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  },
  apis: [
    path.join(__dirname, '../modules/**/*.routes.js'),
    path.join(__dirname, '../docs/**/*.yaml'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

function setupSwagger(app) {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
  app.get('/api/docs.json', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });
}

module.exports = {
  setupSwagger,
};
