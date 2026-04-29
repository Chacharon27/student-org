import swaggerJSDoc from 'swagger-jsdoc';

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Student Organization Management System API',
      version: '1.0.0',
      description:
        'REST API for managing student organizations, members, events, announcements and registrations.',
    },
    servers: [
      { url: 'http://localhost:5000', description: 'Local' },
      { url: '/', description: 'Same origin' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.ts'],
});
