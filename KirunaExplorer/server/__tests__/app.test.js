import request from "supertest";
import createMockApp from "../utils/testUtils.js"; 
import DocumentDAO from "../dao/document-dao.mjs";

jest.mock("../dao/document-dao.mjs"); 

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

  describe("POST /api/document", () => {
    test("should successfully insert a document", async () => {
      // Arrange
      const newDocument = {
        document_title: "Test Document",
        stakeholder: "Test Stakeholder",
        scale: "1:1000",
        issuance_date: "10/06/1998",
        connections: 3,
        language: "English",
        pages: 5,
        document_type: "Report",
        document_description: "This is a test document.",
        area_name: "Test Area",
        coordinates: [12.34, 56.78]
      };

      // Mock the insertDocument function to resolve successfully
      DocumentDAO.prototype.insertDocument.mockResolvedValueOnce();

      const response = await request(app)
        .post("/api/document")
        .send(newDocument);

      expect(response.status).toBe(201);
      expect(response.text).toBe("Document successfully inserted");
      expect(DocumentDAO.prototype.insertDocument).toHaveBeenCalledWith(
        newDocument.document_title,
        newDocument.stakeholder,
        newDocument.scale,
        newDocument.issuance_date,
        newDocument.connections,
        newDocument.language,
        newDocument.pages,
        newDocument.document_type,
        newDocument.document_description,
        newDocument.area_name,
        newDocument.coordinates
      );
    });

    test("should return a 500 error when document insertion fails", async () => {
      // Arrange
      const newDocument = {
        document_title: "Test Document",
        stakeholder: "Test Stakeholder",
        scale: "1:1000",
        issuance_date: "10/06/1998",
        connections: 3,
        language: "English",
        pages: 5,
        document_type: "Report",
        document_description: "This is a test document.",
        area_name: "Test Area",
        coordinates: [12.34, 56.78]
      };

      // Mock the insertDocument function to reject
      DocumentDAO.prototype.insertDocument.mockRejectedValueOnce(new Error("Insertion failed"));

      const response = await request(app)
        .post("/api/document")
        .send(newDocument);

      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while adding node and area.");
    });
  });
});
