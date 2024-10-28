import request from "supertest";
import createMockApp from "../utils/testUtils.js"; // Import the mock app utility

describe("API Tests", () => {
  let app;

  // Create the mock app instance before all tests
  beforeAll(() => {
    app = createMockApp(); // Create a new mock app instance
  });

  describe("GET /api/hello", () => {
    it("should return a greeting message", async () => {
      const response = await request(app).get("/api/hello");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Hello, world!");
    });
  });

  describe("GET /api/test", () => {
    it("should return a test message", async () => {
      const response = await request(app).get("/api/test");
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Test");
    });
  });
});
