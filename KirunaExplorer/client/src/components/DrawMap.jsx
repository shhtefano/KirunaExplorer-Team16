import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Marker, Polygon } from "react-leaflet";
import { Modal, Button, Dropdown, Form } from "react-bootstrap";
import osm from "./osm-providers";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import API from "../services/API";
import { EditControl } from "react-leaflet-draw";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@mui/material";
import ArticleIcon from '@mui/icons-material/Article';
import { MapIcon } from "lucide-react";
import CoordsMap from "./CoordsMap";
import { Snackbar, Alert } from "@mui/material";

// Configura l'icona di default di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

// Define available areas
const areas = [
  {
    id: -1,
    name: "Point-Based Documents",
    latlngs: [],
  },
  {
    id: 0,
    name: "Whole Area",
    latlngs: [
      { lat: 67.864354, lng: 20.198879 },
      { lat: 67.845556, lng: 20.198879 },
      { lat: 67.840539, lng: 20.28059 },
      { lat: 67.864871, lng: 20.304966 },
    ],
  },
  // Add more areas here as needed
];


const DrawMap = () => {
  const [center] = useState({ lat: 67.85572, lng: 20.22513 });
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [selectedArea, setSelectedArea] = useState(areas[0]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [searchQuery, setSearchQuery] = useState(""); // Stato per la ricerca
  const [showModal, setShowModal] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [showEditCoordinatesModal, setShowEditCoordinatesModal] = useState(false);
  const [hoveredDocumentId, setHoveredDocumentId] = useState(null); // Stato per il documento in hover
  const [selectedMarkerId, setSelectedMarkerId] = useState(null); // Stato per il marker selezionato
  const { user } = useAuth();
  const mapRef = useRef(null); // Riferimento alla mappa
  const selectedAreaRef = useRef(selectedArea);
  const [isWholeAreaChecked, setIsWholeAreaChecked] = useState(false); // Stato per la checkbox
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const ZOOM_LEVEL = 15;
  const WHOLE_AREA_CENTER = { lat: 67.85572, lng: 20.22513 }; // Definisci le coordinate per Whole Area
  const WHOLE_AREA_ZOOM = 13; // Definisci un livello di zoom per Whole Area

  useEffect(() => {
    const fetchDocumentsGeo = async () => {
      try {
        const response = await API.getDocumentsGeo();
        const documents = Array.isArray(response) ? response : [];

        if (selectedArea.name === "Point-Based Documents") {
          let markers = documents.filter((document) => {
            return document.geolocations.some((geo) => geo.area_name === "Point" && geo.coordinates.length === 1);
          });

          const filteredMarkers = markers.map((doc) => ({
            id: doc.document_id,
            type: "marker",
            latlngs: [doc.geolocations[0].coordinates[0].lat, doc.geolocations[0].coordinates[0].long],
            document: doc,
          }));

          const allDocs = filteredMarkers.map((doc) => ({
            id: doc.document.document_id,
            document_title: doc.document.document_title,
            description: doc.document.document_description,
            stakeholder: doc.document.stakeholder,
            scale: doc.document.scale,
            issuance_date: doc.document.issuance_date,
            language: doc.document.language,
            pages: doc.document.pages,
            document_type: doc.document.document_type,
            area_name: doc.document.geolocations[0].area_name,
            coordinates: doc.document.geolocations[0].coordinates,
          }));

          setFilteredDocuments(allDocs); // Inizialmente mostra tutti i documenti
          setFilteredMarkers(filteredMarkers);
        } else if (selectedArea.name === "Whole Area") {
          // Filter documents for "Whole Area"
          let markers = documents.filter((document) => {
            return document.geolocations.some(
              (geo) => geo.area_name === "Whole Area"
            );
          });

          const filteredMarkers = markers.map((doc) => ({
            id: doc.document_id,
            type: "marker",
            latlngs: [doc.geolocations[0].coordinates[0].lat, doc.geolocations[0].coordinates[0].long],
            document: doc,
          }));

          const wholeAreaDocs = filteredMarkers.map((doc) => ({
            id: doc.document.document_id,
            document_title: doc.document.document_title,
            description: doc.document.document_description,
            stakeholder: doc.document.stakeholder,
            scale: doc.document.scale,
            issuance_date: doc.document.issuance_date,
            language: doc.document.language,
            pages: doc.document.pages,
            document_type: doc.document.document_type,
            area_name: doc.document.geolocations[0].area_name,
            coordinates: doc.document.geolocations[0].coordinates,
          }));
          console.log(wholeAreaDocs);

          setFilteredDocuments(wholeAreaDocs); // Set documents for Whole Area
          setFilteredMarkers([]);
        }
      } catch (error) {
        console.error("Error while fetching documents:", error);
      }
    };
    selectedAreaRef.current = selectedArea;

    fetchDocumentsGeo();
  }, [selectedArea]);

  // Funzione per aprire popup dei documenti
  const handleMarkerClick = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  // Funzione per spostare la visuale della mappa in base al tipo di documento
  const changeMapPosition = (doc) => {
    const map = mapRef.current;
    if (!map) return;

    // Check if the document is point-based
    if (doc.area_name === "Point") {
      // Use the document's updated coordinates for a point-based location
      const [lat, lng] = [doc.coordinates[0].lat, doc.coordinates[0].long];
      map.setView([lat, lng], ZOOM_LEVEL);
    } else if (doc.area_name === "Whole Area") {
      // If the document is "Whole Area", use predefined coordinates for the entire area
      map.setView([WHOLE_AREA_CENTER.lat, WHOLE_AREA_CENTER.lng], WHOLE_AREA_ZOOM);
    }

    // Update the selected marker ID (after setting map view)
    setSelectedMarkerId(doc.id);
  };

  // Funzione per cambiare colore icona
  const getMarkerIcon = (id) => {
    return id === selectedMarkerId
      ? new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", // Icona rossa per il marker selezionato
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      : new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon-2x.png", // Icona blu per gli altri marker
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });
  };

  // Funzione per gestire la ricerca
  const handleSearchChange = (event) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query === "") {
      // Se la query è vuota, mostra tutti i documenti
      setFilteredDocuments(allDocuments);
    } else {
      // Altrimenti, filtra i documenti in base al titolo e alla descrizione
      const filtered = allDocuments.filter((doc) =>
        doc.document_title.toLowerCase().includes(query.toLowerCase()) ||
        doc.description.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredDocuments(filtered);
    }
  };

  const _onEdited = async (e) => {
    const currentSelectedArea = selectedAreaRef.current; // Usa il valore aggiornato
    const editedLayers = e.layers; // Get all edited layers from the event
    const updatedMarkers = [];
    const updatedDocuments = [...filteredDocuments]; // Create a copy of filteredDocuments

    editedLayers.eachLayer(async (layer) => {
      if (layer instanceof L.Marker) {
        const { lat, lng } = layer.getLatLng();

        const latitude = parseFloat(lat.toFixed(6)); // Trunca alla sesta cifra decimale
        const longitude = parseFloat(lng.toFixed(6)); // Trunca alla sesta cifra decimale


        // Accedi all'ID personalizzato tramite options.id
        const markerId = layer.options.customId;

        // Trova il marker aggiornato tramite il markerId
        const updatedMarker = filteredMarkers.find((marker) => marker.id === markerId);

        if (updatedMarker) {
          // Aggiorna la posizione del marker
          updatedMarker.latlngs = [latitude, longitude];

          // Aggiungi il marker aggiornato alla lista
          updatedMarkers.push(updatedMarker);

          // Trova e aggiorna il documento corrispondente nella lista dei documenti filtrati
          const updatedDocument = updatedDocuments.find(doc => doc.id === updatedMarker.id);
          if (updatedDocument) {
            updatedDocument.coordinates = [{ lat: latitude, long: longitude }]; // Aggiorna le coordinate del documento
          }

          // Chiamata al backend per aggiornare le coordinate (implementa la tua logica backend)
          await API.updateDocumentCoordinates(updatedMarker.id, latitude, longitude);

          // Aggiorna lo stato con le nuove posizioni dei marker e i documenti aggiornati
          setFilteredMarkers((prevMarkers) => {
            return prevMarkers.map((marker) => {
              const updated = updatedMarkers.find((m) => m.id === marker.id);
              return updated || marker; // Sostituisci il marker se è aggiornato, altrimenti mantieni quello originale
            });
          });

          // Aggiorna lo stato dei documenti filtrati con i documenti aggiornati
          setFilteredDocuments(updatedDocuments);
          // Dopo aver aggiornato le coordinate, aggiorna la posizione della mappa con il documento
          // changeMapPosition(updatedDocument);  // Chiamata con i dati aggiornati del documento
        }
      } else if (layer instanceof L.Polygon) {
        if (currentSelectedArea.name === "Whole Area") {
          // inserire qui codice  per cambiare altre aree, questa non dovrebbe essere modificabile.
          return;
        }
      }
    });



  };

  const changeDocumentPosition = (document) => {
    setSelectedDocument(document);
    setShowEditCoordinatesModal(true);
  }

  const onSubmitCoordinates = (lat, long) => {
    setShowPopup(false);
    setSelectedDocument((prevDoc) => ({
      ...prevDoc,
      coordinates: [{ lat, long }],
    }));
  }

  const submitNewDocumentPosition = async () => {
    if (selectedDocument) {
      try {
        const { lat, long } = selectedDocument.coordinates[0];
        if (isWholeAreaChecked) {
            const res = await API.updateDocumentArea(selectedDocument.id, 0);
            setSelectedArea(areas[1]);
        } else {
          const res = await API.updateDocumentCoordinates(selectedDocument.id, lat, long);
          setSelectedArea(areas[0]);
        }
        // Chiudi i modali
        setShowEditCoordinatesModal(false);
        setShowModal(false);

        // Aggiorna la posizione del marker sulla mappa
        if (mapRef.current) {
          mapRef.current.setView([lat, long], ZOOM_LEVEL);
        }

        // Imposta il messaggio di successo per lo Snackbar
        setSnackbarMessage("Document position successfully updated!");
        setSnackbarSeverity("success");
        setSnackbarOpen(true);

      } catch (error) {
        console.error("Error updating document position:", error);

        // Imposta il messaggio di errore per lo Snackbar
        setSnackbarMessage("Error updating document position.");
        setSnackbarSeverity("error");
        setSnackbarOpen(true);
      }
    }
  };




  return (
    <div className="row" style={{ padding: '0px', width: '100%', margin: '0', }}>
      <div className="col text-center">
        <MapContainer ref={mapRef} center={center} zoom={ZOOM_LEVEL} style={{ height: "700px", width: "1000px" }}>

          <FeatureGroup>
            {user && selectedArea.name !== "Whole Area" && <EditControl
              position="topright"
              edit={{
                remove: false,
              }}
              onEdited={_onEdited}
              // onDeleted={_onDeleted}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: false,
              }}
            />
            }
            {selectedArea.name === "Point-Based Documents" && (
              filteredMarkers.map((marker) => {
                return (
                  <Marker
                    key={`marker-${marker.id}`}
                    position={marker.latlngs}
                    icon={getMarkerIcon(marker.id)} // Usa l'icona corretta per il marker
                    eventHandlers={{
                      click: () => handleMarkerClick(marker.document),
                    }}
                    customId={marker.id} // Qui assegni customId direttamente

                  />
                );
              })
            )}
            <Polygon key={selectedArea.id} positions={selectedArea.latlngs} />
          </FeatureGroup>
          <TileLayer url={osm.maptiler.url} attribution={osm.maptiler.attribution} />
        </MapContainer>
      </div>

      {/* Sidebar con Dropdown, Search e Lista dei Documenti */}
      <div className="col">
        {/* Dropdown per selezionare l'area */}
        <Dropdown className="mb-3">
          <Dropdown.Toggle variant="outline" id="dropdown-basic">
            {selectedArea.name}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {areas.map((area) => (
              <Dropdown.Item
                key={area.id}
                onClick={() => setSelectedArea(area)}
              >
                {area.name}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown>

        {/* Barra di ricerca */}
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="mb-3"
        />

        {/* Lista dei documenti filtrati */}
        <div style={{ maxHeight: '550px', overflowY: 'auto' }}>
          {filteredDocuments.map((doc) => (
            <div key={doc.id}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '20px',
                  marginLeft: '5px',
                  marginRight: '5px',
                  cursor: 'pointer',
                  backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white',
                  color: hoveredDocumentId === doc.id ? 'white' : 'black',
                }}
                onMouseEnter={() => setHoveredDocumentId(doc.id)}
                onMouseLeave={() => setHoveredDocumentId(null)}
                onClick={doc.area_name === "Whole Area" ? () => handleMarkerClick(doc) : () => changeMapPosition(doc)}
              >
                <div>
                  <h2><strong>{doc.document_title}</strong></h2>
                  <p className="mt-3"><strong>Type:</strong> {doc.document_type}</p>
                  <p className="mt-1"><strong>Date:</strong> {doc.issuance_date}</p>
                </div>
                <div>
                  {user && <Container className="flex flex-row gap-x-4 text-center">
                    <Button className="mt-4"
                      style={{ width: "70%", border: "1px solid #ddd", borderRadius: "8px", padding: "8px", backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white', color: hoveredDocumentId === doc.id ? 'white' : 'black' }} variant="outline" onClick={() => handleMarkerClick(doc)}>

                      <p style={{ fontSize: "12px" }}>
                        <ArticleIcon></ArticleIcon>
                      </p>
                    </Button>
                    <Button className="mt-4" style={{ width: "70%", border: "1px solid #ddd", borderRadius: "8px", padding: "8px", backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white', color: hoveredDocumentId === doc.id ? 'white' : 'black' }} variant="outline" onClick={() => changeDocumentPosition(doc)}>
                      <p style={{ fontSize: "12px" }}>

                        <MapIcon alt="Open Map" label="Open Map"></MapIcon>
                      </p>
                    </Button>
                  </Container>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal per visualizzare i dettagli del documento */}
      {selectedDocument && showModal && (
        <Modal style={{ marginTop: '8%' }} show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Document info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Name:</strong> {selectedDocument.document_title}</p>
            <p><strong>Document Type:</strong> {selectedDocument.document_type}</p>
            <p><strong>Stakeholder:</strong> {selectedDocument.stakeholder}</p>
            <p><strong>Date:</strong> {selectedDocument.issuance_date}</p>
            <p><strong>Description:</strong> {selectedDocument.document_description}</p>
            <p><strong>Scale:</strong> {selectedDocument.scale}</p>
            <p><strong>Language:</strong> {selectedDocument.language ? selectedDocument.language : "--"}</p>
            <p><strong>Pages:</strong> {selectedDocument.pages ? selectedDocument.pages : "--"}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      {/* Modal to change document position */}
      {selectedDocument && showEditCoordinatesModal && (
        <Modal
          style={{ marginTop: '8%' }}
          show={showEditCoordinatesModal}
          onHide={() => setShowEditCoordinatesModal(false)}
        >
          <Modal.Header closeButton>
            <Modal.Title>Change Document Position</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center">
            {/* Campi per modificare latitudine e longitudine */}
            <Form className="d-flex flex-column align-items-center justify-content-center" style={{ height: "100%" }}>
              <div className="row mb-4" style={{ width: "100%", maxWidth: "500px" }}>
                <div className="col">
                  <Form.Group controlId="latitude">
                    <Form.Label className="text-center w-100">Latitude</Form.Label>
                    <Form.Control
                      className="text-center"
                      type="number"
                      value={selectedDocument.coordinates[0]?.lat || ""}
                      onChange={(e) => {
                        const newLat = parseFloat(e.target.value);
                        setSelectedDocument((prevDoc) => ({
                          ...prevDoc,
                          coordinates: [{ ...prevDoc.coordinates[0], lat: newLat }],
                        }));
                      }}
                      disabled={isWholeAreaChecked}
                    />
                  </Form.Group>
                </div>
                <div className="col">
                  <Form.Group controlId="longitude">
                    <Form.Label className="text-center w-100">Longitude</Form.Label>
                    <Form.Control
                      className="text-center"
                      type="number"
                      value={selectedDocument.coordinates[0]?.long || ""}
                      onChange={(e) => {
                        const newLng = parseFloat(e.target.value);
                        setSelectedDocument((prevDoc) => ({
                          ...prevDoc,
                          coordinates: [{ ...prevDoc.coordinates[0], long: newLng }],
                        }));
                      }}
                      disabled={isWholeAreaChecked}
                    />
                  </Form.Group>
                </div>
              </div>
              <div style={{ textAlign: "center", width: "100%", marginTop: "10px" }}>
                <Button
                  type="button"
                  onClick={() => setShowPopup(true)}
                  className="ml-2"
                  variant="outline"
                >
                  <MapIcon></MapIcon>
                </Button>

              </div>
              {showPopup && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                  <div className="bg-white p-6 rounded shadow-lg" style={{ textAlign: "center" }}>
                    <CoordsMap
                      setShowPopup={setShowPopup}
                      onSubmitCoordinates={onSubmitCoordinates}
                    />

                    <Button
                      type="button"
                      onClick={() => setShowPopup(false)}
                      className="mt-4"
                      variant="outline"

                    >
                      Close Map
                    </Button>
                  </div>
                </div>
              )}
              <div className="my-4 text-center">
                <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>OR</span>
              </div>

              <Form.Group controlId="wholeAreaCheckbox" className="text-center">
                <Form.Check
                  type="checkbox"
                  label="Set as Whole Area"
                  checked={isWholeAreaChecked}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsWholeAreaChecked(checked);
                    setSelectedDocument((prevDoc) => ({
                      ...prevDoc,
                      area_name: checked ? "Whole Area" : "Point",
                    }));
                  }}
                />
              </Form.Group>
            </Form>

          </Modal.Body>
          <Modal.Footer className="display-flex justify-content-center">
            <Button
              variant="dark"
              onClick={() => {
                submitNewDocumentPosition();
              }}
            >
              Save
            </Button>
          </Modal.Footer>
        </Modal>

      )}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default DrawMap;
