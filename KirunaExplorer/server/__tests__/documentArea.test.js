import request from "supertest";
import createMockApp from "../utils/testUtils.js";
import DocumentDAO from "../dao/document-dao.mjs";

jest.mock("../dao/document-dao.mjs");

describe("Document API Routes", () => {
  let app;

  beforeEach(() => {
    app = createMockApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/document", () => {
    test("should create a new document successfully", async () => {
      const mockDocument = {
        document_title: "Test Document",
        stakeholder: "Test Stakeholder",
        scale: "City",
        issuance_date: "2024-01-01",
        language: "English",
        pages: 10,
        document_type: "Report",
        document_description: "Test Description",
        area_name: "Kiruna Center",
        coordinates: { lat: 67.8558, long: 20.2253 },
      };

      DocumentDAO.prototype.insertDocument.mockResolvedValueOnce();

      const response = await request(app)
        .post("/api/document")
        .send(mockDocument)
        .expect(201);

      expect(response.text).toBe("Document successfully inserted");
    });

    test("should handle duplicate document error", async () => {
      const mockDocument = {
        document_title: "Existing Document",
        stakeholder: "Test Stakeholder",
        scale: "City",
        issuance_date: "2024-01-01",
        language: "English",
        pages: 10,
        document_type: "Report",
        document_description: "Test Description",
        area_name: "Kiruna Center",
        coordinates: { lat: 67.8558, long: 20.2253 },
      };

      DocumentDAO.prototype.insertDocument.mockRejectedValueOnce(403);

      const response = await request(app)
        .post("/api/document")
        .send(mockDocument)
        .expect(403);

      expect(response.text).toBe("Document already exists");
    });
  });

  describe("GET /api/document/list", () => {
    test("should retrieve all documents", async () => {
      const mockDocuments = [
        {
          document_id: 1,
          document_title: "Document 1",
          stakeholder: "Stakeholder 1",
        },
        {
          document_id: 2,
          document_title: "Document 2",
          stakeholder: "Stakeholder 2",
        },
      ];

      DocumentDAO.prototype.getDocuments.mockResolvedValueOnce(mockDocuments);

      const response = await request(app).get("/api/document/list").expect(200);

      expect(response.body).toEqual(mockDocuments);
    });
  });

  describe("GET /api/document/geo/list", () => {
    test("should retrieve documents with geolocation data", async () => {
      const mockGeoDocuments = [
        {
          document_id: 1,
          document_title: "Document 1",
          geolocations: [
            {
              area_name: "Kiruna Center",
              coordinates: [{ lat: 67.8558, long: 20.2253 }],
            },
          ],
        },
      ];

      DocumentDAO.prototype.getDocumentsGeo.mockResolvedValueOnce(
        mockGeoDocuments
      );

      const response = await request(app)
        .get("/api/document/geo/list")
        .expect(200);

      expect(response.body).toEqual(mockGeoDocuments);
    });
  });

  describe("POST /api/document/connections", () => {
    test("should create connection between documents", async () => {
      const connection = {
        parent_id: 1,
        children_id: 2,
        connection_type: "related",
      };

      DocumentDAO.prototype.linkDocuments.mockResolvedValueOnce();

      const response = await request(app)
        .post("/api/document/connections")
        .send(connection)
        .expect(201);

      expect(response.text).toBe("Documents successfully linked");
    });
  });

  describe("POST /api/document/updatePointCoords", () => {
    test("should update document coordinates", async () => {
      const updateData = {
        document_id: 1,
        lng: 20.2253,
        lat: 67.8558,
      };

      const mockResult = {
        area_id: 1,
        long: 20.2253,
        lat: 67.8558,
      };

      DocumentDAO.prototype.updatePointCoordinates.mockResolvedValueOnce(
        mockResult
      );

      const response = await request(app)
        .post("/api/document/updatePointCoords")
        .send(updateData)
        .expect(201);

      expect(response.body).toEqual(mockResult);
    });
  });

  describe("PUT /api/document/updateDocumentArea", () => {
    test("should successfully update document area with valid data", async () => {
      const updateData = {
        document_id: 1,
        area_id: 2,
      };

      const mockResult = {
        area_id: 2,
        document_id: 1,
      };

      DocumentDAO.prototype.updateDocumentArea.mockResolvedValueOnce(
        mockResult
      );

      const response = await request(app)
        .put("/api/document/updateDocumentArea")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Document area successfully updated",
      });
      expect(DocumentDAO.prototype.updateDocumentArea).toHaveBeenCalledWith(
        1,
        2
      );
    });

    test("should return 400 when document_id is undefined", async () => {
      const updateData = {
        area_id: 2,
      };

      const response = await request(app)
        .put("/api/document/updateDocumentArea")
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({ error: "Missing required parameters." });
    });

    test("should return 400 when area_id is undefined", async () => {
      const updateData = {
        document_id: 1,
      };

      const response = await request(app)
        .put("/api/document/updateDocumentArea")
        .send(updateData)
        .expect(400);

      expect(response.body).toEqual({ error: "Missing required parameters." });
    });

    test("should handle database error", async () => {
      const updateData = {
        document_id: 1,
        area_id: 2,
      };

      DocumentDAO.prototype.updateDocumentArea.mockRejectedValueOnce(
        new Error("Database error")
      );

      const response = await request(app)
        .put("/api/document/updateDocumentArea")
        .send(updateData)
        .expect(500);

      expect(response.text).toBe(
        "An error occurred while updating the Document area."
      );
    });

    test("should accept valid numeric strings", async () => {
      const updateData = {
        document_id: "1",
        area_id: "2",
      };

      const mockResult = {
        area_id: 2,
        document_id: 1,
      };

      DocumentDAO.prototype.updateDocumentArea.mockResolvedValueOnce(
        mockResult
      );

      const response = await request(app)
        .put("/api/document/updateDocumentArea")
        .send(updateData)
        .expect(200);

      expect(response.body).toEqual({
        message: "Document area successfully updated",
      });
    });
  });
});
