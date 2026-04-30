import swaggerJSDoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJSDoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Event Registration API",
      version: "1.0.0",
      description: "API documentation for the event user registration backend.",
    },
    servers: [
      {
        url: "http://localhost:4000",
        description: "Local development server",
      },
    ],
    tags: [
      {
        name: "Health",
        description: "Application health monitoring",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
});
