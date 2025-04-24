// src/utils/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'VSOS API',
      version: '1.0.0',
      description: "API endpoints for a VSOS service documented using Swagger",
      contact: {
        name: "QUOCTHINH",
        email: "levietquocthinh@gmail.com",
        url: ""
      },
    },
    components: {
      securitySchemes: {
        Authorization: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          value: "Bearer <JWT token here>"
        }
      }
    },

    servers: [
      {
        url: "http://localhost:3000",
        description: "Local server"
      }, {
        url: "https://shopc-5tfn.onrender.com",
        description: "Live server"
      },
    ]
  },
  apis: ['./routes/*.js', 'index.js'],
};

const swaggerSpec = swaggerJsdoc(options);

function swaggerDocs(app, port) {
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.get('/docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log(`Swagger docs available at http://localhost:${port}/docs`);
}

export default swaggerDocs;