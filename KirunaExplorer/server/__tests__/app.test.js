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

  describe("POST /api/document", () => {

    const validDocument = {
      document_title: "New Document",
      stakeholders: "Stakeholder 1",
      scale: "1:1000",
      issuance_date: "12/10/2022",
      language: "English",
      pages: 5,
      document_type: "Report",
      document_description: "Document description",
      area_name: "Area 1",
      coordinates: [{ long: 12.34, lat: 56.78 }]
    };
  
    test("should successfully insert a document", async () => {
      // Mocking the insertDocument method to resolve successfully
      DocumentDAO.prototype.insertDocument.mockResolvedValue();
  
      const response = await request(app).post("/api/document").send(validDocument);
  
      expect(response.status).toBe(201);
      expect(response.text).toBe("Document successfully inserted");
      expect(DocumentDAO.prototype.insertDocument).toHaveBeenCalledWith(
        validDocument.document_title,
        validDocument.stakeholders,
        validDocument.scale,
        validDocument.issuance_date,
        validDocument.language,
        validDocument.pages,
        validDocument.document_type,
        validDocument.document_description,
        validDocument.area_name,
        validDocument.coordinates
      );
    });
  
    test("should return 403 if the document already exists", async () => {
      // Mocking insertDocument to throw a 403 error
      DocumentDAO.prototype.insertDocument.mockRejectedValue(403);
  
      const response = await request(app).post("/api/document").send(validDocument);
  
      expect(response.status).toBe(403);
      expect(response.text).toBe("Document already exists");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking insertDocument to throw a generic error
      DocumentDAO.prototype.insertDocument.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).post("/api/document").send(validDocument);
  
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
  
  describe("DELETE /api/geo/area", () => {
    let deleteAreaMock;
  
    beforeEach(() => {
      // Reset del mock prima di ogni test
      deleteAreaMock = jest.spyOn(DocumentDAO.prototype, "deleteArea");
    });
  
    afterEach(() => {
      jest.restoreAllMocks(); // Ripristina i mock dopo ogni test
    });
  
    test("should successfully delete the area and return a success message", async () => {
      const mockAreaName = "Test Area";
  
      deleteAreaMock.mockResolvedValueOnce("Area eliminata con successo.");
  
      const response = await request(app)
        .delete("/api/geo/area")
        .send({ areaName: mockAreaName });
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Area deleted successfully." });
      expect(deleteAreaMock).toHaveBeenCalledWith(mockAreaName);
    });
  
    test("should return a 500 error if deleteArea throws an error", async () => {
      const mockAreaName = "Test Area";
  
      deleteAreaMock.mockRejectedValueOnce(new Error("Errore durante la cancellazione dell'area"));
  
      const response = await request(app)
        .delete("/api/geo/area")
        .send({ areaName: mockAreaName });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Errore durante la cancellazione dell'area" });
      expect(deleteAreaMock).toHaveBeenCalledWith(mockAreaName);
    });
  
    test("should handle attempts to delete the 'Kiruna Map' area with a 500 error", async () => {
      const mockAreaName = "Kiruna Map";
  
      deleteAreaMock.mockRejectedValueOnce(new Error("Cannot delete Kiruna Map"));
  
      const response = await request(app)
        .delete("/api/geo/area")
        .send({ areaName: mockAreaName });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Cannot delete Kiruna Map" });
      expect(deleteAreaMock).toHaveBeenCalledWith(mockAreaName);
    });
  
    test("should handle unexpected errors gracefully", async () => {
      const mockAreaName = "Unexpected Error Area";
  
      deleteAreaMock.mockRejectedValueOnce(new Error("Unexpected error"));
  
      const response = await request(app)
        .delete("/api/geo/area")
        .send({ areaName: mockAreaName });
  
      expect(response.status).toBe(500);
      expect(response.body).toEqual({ error: "Unexpected error" });
      expect(deleteAreaMock).toHaveBeenCalledWith(mockAreaName);
    });
  });
  
  describe("DELETE /api/document/:document_id", () => {

    const documentId = 1;

    test("should successfully delete a document", async () => {
      // Mocking the deleteDocument method to return an object with affectedRows
      DocumentDAO.prototype.deleteDocument.mockResolvedValue({ affectedRows: 1 });
    
      const response = await request(app).delete(`/api/document/${documentId}`);
    
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Document deleted successfully");
      expect(DocumentDAO.prototype.deleteDocument).toHaveBeenCalledWith("1"); // Ensure it's a string
    });
    
    
  
    test("should return 404 if the document is not found", async () => {
      // Mocking deleteDocument to return an object with affectedRows = 0
      DocumentDAO.prototype.deleteDocument.mockResolvedValue({ affectedRows: 0 });
  
      const response = await request(app).delete(`/api/document/${documentId}`);
  
      expect(response.status).toBe(404);
      expect(response.text).toBe("Document not found.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking deleteDocument to throw an error
      DocumentDAO.prototype.deleteDocument.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).delete(`/api/document/${documentId}`);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while deleting the document.");
    });
  });
  
  describe("GET /api/document/:document_id/geo/", () => {

    const documentId = 1;
  
    test("should successfully retrieve document position", async () => {
      const mockDocument = {
        document_id: 1,
        area_name: "Area 1",
        coordinates: [{ long: 12.34, lat: 56.78 }]
      };
    
      // Mocking the getDocumentPosition method to resolve with the mock data
      DocumentDAO.prototype.getDocumentPosition.mockResolvedValue(mockDocument);
    
      const response = await request(app).get(`/api/document/${documentId}/geo/`);
    
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocument);
      expect(DocumentDAO.prototype.getDocumentPosition).toHaveBeenCalledWith("1"); // Assicurati che sia passato come stringa
    });
    
    
  
    test("should return 500 if there is a server error", async () => {
      // Mocking getDocumentPosition to throw an error
      DocumentDAO.prototype.getDocumentPosition.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).get(`/api/document/${documentId}/geo/`);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while fetching document position.");
    });
  });

  describe("POST /api/geo/area", () => {

    const validAreaData = {
      area_name: "New Area",
      coordinates: [{ long: 12.34, lat: 56.78 }]
    };
  
    test("should successfully add a new area", async () => {
      // Mocking the addArea method to resolve successfully
      DocumentDAO.prototype.addArea.mockResolvedValue();
    
      const response = await request(app).post("/api/geo/area").send(validAreaData);
    
      expect(response.status).toBe(200);
      expect(response.body).toBe(""); // Modificato per aspettarsi una stringa vuota
      expect(DocumentDAO.prototype.addArea).toHaveBeenCalledWith(validAreaData);
    });
    
  
    test("should return 403 if the area name already exists", async () => {
      // Mocking addArea to throw an error with code 403
      const error = new Error("Area name already exists.");
      error.code = 403;
      DocumentDAO.prototype.addArea.mockRejectedValue(error);
  
      const response = await request(app).post("/api/geo/area").send(validAreaData);
  
      expect(response.status).toBe(403);
      expect(response.body.message).toBe("Area name already exists.");
    });
  
    test("should return 422 if the data is invalid", async () => {
      // Mocking addArea to throw an error with code 422
      const error = new Error("Invalid data provided.");
      error.code = 422;
      DocumentDAO.prototype.addArea.mockRejectedValue(error);
  
      const response = await request(app).post("/api/geo/area").send(validAreaData);
  
      expect(response.status).toBe(422);
      expect(response.body.message).toBe("Invalid data provided.");
    });
  
    test("should return 500 if there is an unexpected error", async () => {
      // Mocking addArea to throw a generic error
      const error = new Error("Unexpected error occurred.");
      DocumentDAO.prototype.addArea.mockRejectedValue(error);
  
      const response = await request(app).post("/api/geo/area").send(validAreaData);
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("An unexpected error occurred.");
    });
  });

  describe("GET /api/geo/:areaId", () => {

    const areaId = "1";  // Assicurati che il parametro areaId sia una stringa
    const mockCoordinates = [
      { long: 12.34, lat: 56.78 },
      { long: 23.45, lat: 67.89 }
    ];
  
    test("should successfully retrieve area coordinates", async () => {
      // Mocking the getAreaCoordinates method to resolve with the mock coordinates
      DocumentDAO.prototype.getAreaCoordinates.mockResolvedValue(mockCoordinates);
  
      const response = await request(app).get(`/api/geo/${areaId}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockCoordinates);
      expect(DocumentDAO.prototype.getAreaCoordinates).toHaveBeenCalledWith(areaId);
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking getAreaCoordinates to throw an error
      DocumentDAO.prototype.getAreaCoordinates.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).get(`/api/geo/${areaId}`);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while fetching document position.");
    });
  });
  
  describe("GET /api/document/title/:document_title/area", () => {

    const documentTitle = "Sample Document";
    const mockDocumentArea = {
      area_name: "Area 1",
      coordinates: [{ long: 12.34, lat: 56.78 }]
    };
  
    test("should successfully retrieve the area by document title", async () => {
      // Mocking the getAreaIdByDocumentId method to resolve with the mock document area
      DocumentDAO.prototype.getAreaIdByDocumentId.mockResolvedValue(mockDocumentArea);
  
      const response = await request(app).get(`/api/document/title/${documentTitle}/area`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocumentArea);
      expect(DocumentDAO.prototype.getAreaIdByDocumentId).toHaveBeenCalledWith(documentTitle);
    });
  
    test("should return 404 if the document area is not found", async () => {
      // Mocking getAreaIdByDocumentId to resolve with null (document area not found)
      DocumentDAO.prototype.getAreaIdByDocumentId.mockResolvedValue(null);
  
      const response = await request(app).get(`/api/document/title/${documentTitle}/area`);
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Area del documento non trovata.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking getAreaIdByDocumentId to throw an error
      DocumentDAO.prototype.getAreaIdByDocumentId.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).get(`/api/document/title/${documentTitle}/area`);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("Si è verificato un errore durante il recupero dell'area del documento.");
    });
  });

  describe("GET /api/stakeholder", () => {

    const mockStakeholders = [
      { stakeholder_id: 1, name: "Stakeholder 1" },
      { stakeholder_id: 2, name: "Stakeholder 2" }
    ];
  
    test("should successfully retrieve a list of stakeholders", async () => {
      // Mocking the getStakeholders method to resolve with the mock stakeholders list
      DocumentDAO.prototype.getStakeholders.mockResolvedValue(mockStakeholders);
  
      const response = await request(app).get("/api/stakeholder");
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockStakeholders);
      expect(DocumentDAO.prototype.getStakeholders).toHaveBeenCalledTimes(1);
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking getStakeholders to throw an error
      DocumentDAO.prototype.getStakeholders.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).get("/api/stakeholder");
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while fetching documents.");
    });
  });

  describe("POST /api/stakeholder", () => {

    const validStakeholder = { stakeholder_name: "New Stakeholder" };
    const duplicateStakeholder = { stakeholder_name: "Existing Stakeholder" };
  
    test("should successfully insert a new stakeholder", async () => {
      // Mocking the util_insertStakeholder method to resolve successfully
      DocumentDAO.prototype.util_insertStakeholder.mockResolvedValue();
  
      const response = await request(app).post("/api/stakeholder").send(validStakeholder);
  
      expect(response.status).toBe(201);
      expect(response.text).toBe("Stakeholder successfully inserted");
      expect(DocumentDAO.prototype.util_insertStakeholder).toHaveBeenCalledWith(validStakeholder.stakeholder_name);
    });
  
    test("should return 403 if the stakeholder is duplicated", async () => {
      // Mocking the util_insertStakeholder method to simulate a "Duplicated stakeholder" error
      DocumentDAO.prototype.util_insertStakeholder.mockRejectedValue("Duplicated stakeholder");
  
      const response = await request(app).post("/api/stakeholder").send(duplicateStakeholder);
  
      expect(response.status).toBe(403);
      expect(response.text).toBe("Duplicated stakeholder");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the util_insertStakeholder method to simulate a generic error
      DocumentDAO.prototype.util_insertStakeholder.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).post("/api/stakeholder").send(validStakeholder);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("Database error");
    });
  });

  describe("POST /api/document/connections", () => {

    const validConnection = { parent_id: 1, children_id: 2, connection_type: "reference" };
    const duplicateConnection = { parent_id: 1, children_id: 2, connection_type: "reference" };
  
    test("should successfully link documents", async () => {
      // Mocking the linkDocuments method to resolve successfully
      DocumentDAO.prototype.linkDocuments.mockResolvedValue();
  
      const response = await request(app).post("/api/document/connections").send(validConnection);
  
      expect(response.status).toBe(201);
      expect(response.text).toBe("Documents successfully linked");
      expect(DocumentDAO.prototype.linkDocuments).toHaveBeenCalledWith(validConnection.parent_id, validConnection.children_id, validConnection.connection_type);
    });
  
    test("should return 403 if the connection is duplicated", async () => {
      // Mocking the linkDocuments method to simulate a "Duplicated link" error
      DocumentDAO.prototype.linkDocuments.mockRejectedValue("Duplicated link");
  
      const response = await request(app).post("/api/document/connections").send(duplicateConnection);
  
      expect(response.status).toBe(403);
      expect(response.text).toBe("Duplicated Link");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the linkDocuments method to simulate a generic error
      DocumentDAO.prototype.linkDocuments.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).post("/api/document/connections").send(validConnection);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("Database error");
    });
  });

  describe("POST /api/document/connections/document", () => {

    const validRequest = { title: "Sample Document" };
    const missingTitleRequest = {}; // Missing title
  
    const mockConnections = [
      { connection_id: 1, parent_id: 1, children_id: 2, connection_type: "reference" },
      { connection_id: 2, parent_id: 2, children_id: 3, connection_type: "citation" }
    ];
  
    test("should successfully fetch document connections", async () => {
      // Mocking the getConnectionsByDocumentTitle method to resolve with the mock connections
      DocumentDAO.prototype.getConnectionsByDocumentTitle.mockResolvedValue(mockConnections);
  
      const response = await request(app).post("/api/document/connections/document").send(validRequest);
  
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual(mockConnections);
      expect(DocumentDAO.prototype.getConnectionsByDocumentTitle).toHaveBeenCalledWith(validRequest.title);
    });
  
    test("should return 400 if the title is missing", async () => {
      // Request without the title
      const response = await request(app).post("/api/document/connections/document").send(missingTitleRequest);
  
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Il titolo del documento è richiesto.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the getConnectionsByDocumentTitle method to simulate a server error
      DocumentDAO.prototype.getConnectionsByDocumentTitle.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).post("/api/document/connections/document").send(validRequest);
  
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("DELETE /api/document/connections/delete", () => {

    const validRequest = { doc1_id: 1, doc2_id: 2, connection_type: "reference" };
    const missingFieldsRequest = { doc1_id: 1, doc2_id: 2 }; // Missing connection_type
  
    const mockMessage = "Connection successfully deleted";
  
    test("should successfully delete a connection", async () => {
      // Mocking the deleteConnection method to return a success message
      DocumentDAO.prototype.deleteConnection.mockResolvedValue(mockMessage);
  
      const response = await request(app).delete("/api/document/connections/delete").send(validRequest);
  
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe(mockMessage);
      expect(DocumentDAO.prototype.deleteConnection).toHaveBeenCalledWith(validRequest.doc1_id, validRequest.doc2_id, validRequest.connection_type);
    });
  
    test("should return 400 if any required field is missing", async () => {
      // Request missing connection_type
      const response = await request(app).delete("/api/document/connections/delete").send(missingFieldsRequest);
  
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Gli ID dei documenti e il tipo di connessione sono richiesti.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the deleteConnection method to simulate a server error
      DocumentDAO.prototype.deleteConnection.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).delete("/api/document/connections/delete").send(validRequest);
  
      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Database error");
    });
  });

  describe("POST /api/document/updatePointCoords", () => {

    const validRequest = { document_id: 1, lng: 12.34, lat: 56.78 };
    const missingFieldsRequest = { document_id: 1, lng: 12.34 }; // Missing lat
  
    const mockSuccessResult = "Point coordinates successfully updated";
  
    test("should successfully update point coordinates", async () => {
      // Mocking the updatePointCoordinates method to simulate a successful update
      DocumentDAO.prototype.updatePointCoordinates.mockResolvedValue(mockSuccessResult);
  
      const response = await request(app).post("/api/document/updatePointCoords").send(validRequest);
  
      expect(response.status).toBe(201);
      expect(response.text).toBe(mockSuccessResult);
      expect(DocumentDAO.prototype.updatePointCoordinates).toHaveBeenCalledWith(validRequest.document_id, validRequest.lng, validRequest.lat);
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the updatePointCoordinates method to simulate a server error
      DocumentDAO.prototype.updatePointCoordinates.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).post("/api/document/updatePointCoords").send(validRequest);
  
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("An error occurred while updating the point coordinates.");
    });
  });

  describe("PUT /api/document/updateDocumentArea", () => {

    const validRequest = { document_id: 1, area_id: 2 };
    const missingDocumentIdRequest = { area_id: 2 };
    const missingAreaIdRequest = { document_id: 1 };
    const mockSuccessMessage = "Document area successfully updated";
  
    test("should successfully update the document area", async () => {
      // Mocking the updateDocumentArea method to simulate a successful update
      DocumentDAO.prototype.updateDocumentArea.mockResolvedValue(mockSuccessMessage);
  
      const response = await request(app).put("/api/document/updateDocumentArea").send(validRequest);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(mockSuccessMessage);
      expect(DocumentDAO.prototype.updateDocumentArea).toHaveBeenCalledWith(validRequest.document_id, validRequest.area_id);
    });
  
    test("should return 400 if required parameters are missing", async () => {
      // Request missing document_id
      const response = await request(app).put("/api/document/updateDocumentArea").send(missingDocumentIdRequest);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required parameters.");
    });
  
    test("should return 400 if area_id is missing", async () => {
      // Request missing area_id
      const response = await request(app).put("/api/document/updateDocumentArea").send(missingAreaIdRequest);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required parameters.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the updateDocumentArea method to simulate a server error
      DocumentDAO.prototype.updateDocumentArea.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).put("/api/document/updateDocumentArea").send(validRequest);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while updating the Document area.");
    });
  });

  describe("PUT /api/document/updateDocumentArea", () => {

    const validRequest = { document_id: 1, area_id: 2 };
    const missingDocumentIdRequest = { area_id: 2 };
    const missingAreaIdRequest = { document_id: 1 };
    const mockSuccessMessage = "Document area successfully updated";
  
    test("should successfully update the document area", async () => {
      // Mocking the updateDocumentArea method to simulate a successful update
      DocumentDAO.prototype.updateDocumentArea.mockResolvedValue(mockSuccessMessage);
  
      const response = await request(app).put("/api/document/updateDocumentArea").send(validRequest);
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe(mockSuccessMessage);
      expect(DocumentDAO.prototype.updateDocumentArea).toHaveBeenCalledWith(validRequest.document_id, validRequest.area_id);
    });
  
    test("should return 400 if required parameters are missing", async () => {
      // Request missing document_id
      const response = await request(app).put("/api/document/updateDocumentArea").send(missingDocumentIdRequest);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required parameters.");
    });
  
    test("should return 400 if area_id is missing", async () => {
      // Request missing area_id
      const response = await request(app).put("/api/document/updateDocumentArea").send(missingAreaIdRequest);
  
      expect(response.status).toBe(400);
      expect(response.body.error).toBe("Missing required parameters.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the updateDocumentArea method to simulate a server error
      DocumentDAO.prototype.updateDocumentArea.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).put("/api/document/updateDocumentArea").send(validRequest);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while updating the Document area.");
    });
  });

  describe("GET /api/types", () => {

    const mockDocumentTypes = ["Report", "Survey", "Analysis"];
  
    test("should successfully retrieve document types", async () => {
      // Mocking the getDocumentTypes method to simulate a successful response
      DocumentDAO.prototype.getDocumentTypes.mockResolvedValue(mockDocumentTypes);
  
      const response = await request(app).get("/api/types");
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocumentTypes);
      expect(DocumentDAO.prototype.getDocumentTypes).toHaveBeenCalledTimes(1);
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the getDocumentTypes method to simulate an error
      DocumentDAO.prototype.getDocumentTypes.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).get("/api/types");
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while fetching document types.");
    });
  });

  describe("GET /api/types", () => {

    const mockDocumentTypes = ["Report", "Survey", "Analysis"];
  
    test("should successfully retrieve document types", async () => {
      // Mocking the getDocumentTypes method to simulate a successful response
      DocumentDAO.prototype.getDocumentTypes.mockResolvedValue(mockDocumentTypes);
  
      const response = await request(app).get("/api/types");
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocumentTypes);
      expect(DocumentDAO.prototype.getDocumentTypes).toHaveBeenCalledTimes(1);
    });
  
    test("should return 500 if there is a server error", async () => {
      // Mocking the getDocumentTypes method to simulate an error
      DocumentDAO.prototype.getDocumentTypes.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app).get("/api/types");
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("An error occurred while fetching document types.");
    });
  });

  describe("DELETE /api/geo/area", () => {

    const areaName = "Test Area";
  
    test("should successfully delete an area", async () => {
      // Simuliamo che l'area sia stata eliminata correttamente
      DocumentDAO.prototype.deleteArea.mockResolvedValue(true);
  
      const response = await request(app)
        .delete("/api/geo/area")
        .send({ areaName });
  
      expect(response.status).toBe(200);
      expect(response.body.message).toBe("Area deleted successfully.");
      expect(DocumentDAO.prototype.deleteArea).toHaveBeenCalledWith(areaName);
    });
  
    test("should return 500 if there is a server error", async () => {
      // Simuliamo un errore del server
      DocumentDAO.prototype.deleteArea.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .delete("/api/geo/area")
        .send({ areaName });
  
      expect(response.status).toBe(500);
      expect(response.body.error).toBe("Database error");
    });
  });

  describe("GET /api/document/:document_title", () => {

    const documentTitle = "Test Document";
  
    test("should successfully retrieve document by title", async () => {
      // Simuliamo il recupero di un documento esistente
      const mockDocument = {
        document_id: 1,
        document_title: documentTitle,
        document_description: "Test Description",
        issuance_date: "2024-12-01",
      };
      DocumentDAO.prototype.getDocumentByTitle.mockResolvedValue(mockDocument);
  
      const response = await request(app)
        .get(`/api/document/${documentTitle}`);
  
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockDocument);
      expect(DocumentDAO.prototype.getDocumentByTitle).toHaveBeenCalledWith(documentTitle);
    });
  
    test("should return 404 if document not found", async () => {
      // Simuliamo che il documento non venga trovato
      DocumentDAO.prototype.getDocumentByTitle.mockResolvedValue(null);
  
      const response = await request(app)
        .get(`/api/document/${documentTitle}`);
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Documento non trovato.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Simuliamo un errore del server
      DocumentDAO.prototype.getDocumentByTitle.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .get(`/api/document/${documentTitle}`);
  
      expect(response.status).toBe(500);
      expect(response.text).toBe("Si è verificato un errore durante il recupero del documento.");
    });
  });

  describe("DELETE /api/links", () => {

    const parentId = 1;
    const childId = 2;
    const connectionType = "related";
  
    test("should successfully delete a link", async () => {
      // Simuliamo la risposta del DAO per l'eliminazione del link
      DocumentDAO.prototype.deleteLink.mockResolvedValue(true);
  
      const response = await request(app)
        .delete("/api/links")
        .send({ parentId, childId, connectionType });
  
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Link eliminato con successo.");
      expect(DocumentDAO.prototype.deleteLink).toHaveBeenCalledWith(parentId, childId, connectionType);
    });
  
    test("should return 400 if required parameters are missing", async () => {
      // Inviamo la richiesta senza parametri
      const response = await request(app)
        .delete("/api/links")
        .send({});
  
      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Parametri mancanti: parentId, childId e connectionType sono richiesti.");
    });
  
    test("should return 404 if no link found with the provided parameters", async () => {
      // Simuliamo che il link non venga trovato
      DocumentDAO.prototype.deleteLink.mockResolvedValue(false);
  
      const response = await request(app)
        .delete("/api/links")
        .send({ parentId, childId, connectionType });
  
      expect(response.status).toBe(404);
      expect(response.body.message).toBe("Nessun link trovato con i parametri forniti.");
    });
  
    test("should return 500 if there is a server error", async () => {
      // Simuliamo un errore del server
      DocumentDAO.prototype.deleteLink.mockRejectedValue(new Error("Database error"));
  
      const response = await request(app)
        .delete("/api/links")
        .send({ parentId, childId, connectionType });
  
      expect(response.status).toBe(500);
      expect(response.body.message).toBe("Errore interno del server.");
    });
  });
});


