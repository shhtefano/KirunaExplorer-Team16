import express from "express";
import routes from "../routes/routes.mjs"; // Adjust the path as necessary

const createMockApp = () => {
  const app = express(); // Create a new instance of the Express application
  app.use(express.json()); // Use the JSON middleware
  app.use(routes); // Use the routes in the testing app
  return app; // Return the mock app instance
};

export default createMockApp;
