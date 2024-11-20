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

/*  describe("GET /api/hello", () => {
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
  });*/

  describe("POST /api/document", () => {
    test("should successfully insert a document", async () => {
      // Arrange
      const newDocument = {
        document_title: "Test Document",
        stakeholder: "Test Stakeholder",
        scale: "1:1000",
        issuance_date: "10/06/1998",
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

  describe("GET /api/document/list", () => {
  
    test("should successfully fetch and return the list of documents", async () => {
      const mockDocuments = [
        {
          document_id: 1,
          document_title: "Test Document 1",
          stakeholder: "Test Stakeholder 1",
          scale: "1:1000",
          issuance_date: "10/06/1998",
          language: "English",
          pages: 5,
          document_type: "Report",
          document_description: "Description 1",
          geolocations: [
            { area_name: "Area 1", coordinates: [{ long: 12.34, lat: 56.78 }] }
          ]
        },
        {
          document_id: 2,
          document_title: "Test Document 2",
          stakeholder: "Test Stakeholder 2",
          scale: "1:2000",
          issuance_date: "12/07/2000",
          language: "Italian",
          pages: 8,
          document_type: "Survey",
          document_description: "Description 2",
          geolocations: [
            { area_name: "Area 2", coordinates: [{ long: 23.45, lat: 67.89 }] }
          ]
        }
      ];
  
      DocumentDAO.prototype.getDocuments.mockResolvedValue(mockDocuments);
  
      const response = await request(app).get("/api/document/list");
  
      expect(response.status).toBe(200); 
      expect(response.body).toEqual(mockDocuments);
      expect(DocumentDAO.prototype.getDocuments).toHaveBeenCalledTimes(1);
    });
  
    test("should return a 500 error if the getDocuments method fails", async () => {
      DocumentDAO.prototype.getDocuments.mockRejectedValue(new Error("Failed to fetch documents"));
  
      const response = await request(app).get("/api/document/list");
  
      expect(response.status).toBe(500); 
      expect(response.text).toBe("An error occurred while fetching documents."); 
    });
  
  });
  
  describe("GET /api/document/geo/list", () => {

    test("should successfully fetch and return the list of documents with geolocations", async () => {
      const mockDocumentsGeo = [
        {
          document_id: 1,
          document_title: "Geo Document 1",
          stakeholder: "Stakeholder 1",
          scale: "1:1000",
          issuance_date: "10/06/1998",
          language: "English",
          pages: 5,
          document_type: "Report",
          document_description: "Description 1",
          geolocations: [
            { area_name: "Area 1", coordinates: [{ long: 12.34, lat: 56.78 }] }
          ]
        },
        {
          document_id: 2,
          document_title: "Geo Document 2",
          stakeholder: "Stakeholder 2",
          scale: "1:2000",
          issuance_date: "12/07/2000",
          language: "Italian",
          pages: 8,
          document_type: "Survey",
          document_description: "Description 2",
          geolocations: [
            { area_name: "Area 2", coordinates: [{ long: 23.45, lat: 67.89 }] }
          ]
        }
      ];
  
      DocumentDAO.prototype.getDocumentsGeo.mockResolvedValue(mockDocumentsGeo);
  
      const response = await request(app).get("/api/document/geo/list");
  
      expect(response.status).toBe(200); 
      expect(response.body).toEqual(mockDocumentsGeo); 
      expect(DocumentDAO.prototype.getDocumentsGeo).toHaveBeenCalledTimes(1);
    });
  
    test("should return a 500 error if the getDocumentsGeo method fails", async () => {
      DocumentDAO.prototype.getDocumentsGeo.mockRejectedValue(new Error("Failed to fetch geolocation documents"));
  
      const response = await request(app).get("/api/document/geo/list");
  
      expect(response.status).toBe(500); 
      expect(response.text).toBe("An error occurred while fetching documents.");
    });
  
  });
  
});


