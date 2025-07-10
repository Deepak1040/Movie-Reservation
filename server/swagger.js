const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BookMyShow API",
      version: "1.0.0",
      description: "API documentation for BookMyShow backend"
    },
    servers: [
      {
        url: "http://localhost:3000/",
        description: "Developement server"
      }
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ["./routes/*.js", './controllers/*.js ','./server.js'] // path to the API docs (comments in route files)
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = { swaggerUi, swaggerSpec };
