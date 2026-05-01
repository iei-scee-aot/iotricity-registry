import swaggerJSDoc from "swagger-jsdoc";

/**
 * Swagger/OpenAPI specification configuration.
 * Automatically generates API documentation by scanning route files for JSDoc comments.
 */
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
      {
        name: "Team Members",
        description: "Management of team member profiles and registrations",
      },
    ],
  },
  // Path to the API docs (route files containing @openapi comments)
  apis: ["./src/routes/*.ts"],
});
