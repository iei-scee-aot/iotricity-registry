import swaggerJSDoc from "swagger-jsdoc";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        url: "/",
        description: "Production server (relative path)",
      },
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
  // Uses absolute path and supports both .ts (dev) and .js (production) files
  apis: [path.join(__dirname, "./routes/*.{ts,js}")],
});
