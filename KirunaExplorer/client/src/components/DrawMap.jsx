import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Marker, Polygon } from "react-leaflet";
import { Modal, Button, Dropdown, Form } from "react-bootstrap";
import osm from "./osm-providers";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import API from "../services/API";

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
  const [hoveredDocumentId, setHoveredDocumentId] = useState(null); // Stato per il documento in hover
  const [selectedMarkerId, setSelectedMarkerId] = useState(null); // Stato per il marker selezionato

  const mapRef = useRef(null); // Riferimento alla mappa

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
            title: doc.document.document_title,
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
          console.log(markers + 'www');
          
          const filteredMarkers = markers.map((doc) => ({
            id: doc.document_id,
            type: "marker",
            latlngs: [doc.geolocations[0].coordinates[0].lat, doc.geolocations[0].coordinates[0].long],
            document: doc,
          }));

          const wholeAreaDocs = filteredMarkers.map((doc) => ({
            id: doc.document.document_id,
            title: doc.document.document_title,
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

    fetchDocumentsGeo();
  }, [selectedArea]);

  const handleMarkerClick = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  // Funzione per spostare la visuale della mappa in base al tipo di documento
  const changeMapPosition = (doc) => {
    const map = mapRef.current;
    if (!map) return;

    if (doc.area_name === "Point") {
      // Se il documento è un Point, usa le coordinate specifiche
      const [lat, lng] = [doc.coordinates[0].lat, doc.coordinates[0].long];
      map.setView([lat, lng], ZOOM_LEVEL);
    } else if (doc.area_name === "Whole Area") {
      // Se il documento è Whole Area, usa le coordinate predefinite per l'intera area
      map.setView([WHOLE_AREA_CENTER.lat, WHOLE_AREA_CENTER.lng], WHOLE_AREA_ZOOM);
    }

    // Aggiorna l'ID del marker selezionato
    setSelectedMarkerId(doc.id);
  };

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
        doc.title.toLowerCase().includes(query.toLowerCase()) ||
        doc.description.toLowerCase().includes(query.toLowerCase())
      );

      setFilteredDocuments(filtered);
    }
  };

  return (
    <div className="row" style={{ padding: '0px', width: '100%', margin: '0', }}>
      <div className="col text-center">
        <MapContainer ref={mapRef} center={center} zoom={ZOOM_LEVEL} style={{ height: "700px", width: "1000px" }}>

          <FeatureGroup>

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
          placeholder="Cerca documenti..."
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
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  padding: '10px',
                  marginBottom: '20px',
                  marginLeft:'5px',
                  marginRight:'5px',
                  cursor: 'pointer',
                  backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white',
                  color: hoveredDocumentId === doc.id ? 'white' : 'black',
                }}
                onMouseEnter={() => setHoveredDocumentId(doc.id)}
                onMouseLeave={() => setHoveredDocumentId(null)}
                onClick={doc.area_name === "Whole Area" ? () => handleMarkerClick(doc) : () => changeMapPosition(doc)}
              >
                <h4><strong>{doc.title}</strong></h4>
                <p><strong>Type:</strong> {doc.document_type}</p>
                <p><strong>Date:</strong> {doc.issuance_date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal per visualizzare i dettagli del documento */}
      {selectedDocument && (
        <Modal style={{ marginTop: '8%' }} show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Document info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Name:</strong> {selectedDocument.title}</p>
            <p><strong>Stakeholder:</strong> {selectedDocument.stakeholder}</p>
            <p><strong>Scale:</strong> {selectedDocument.scale}</p>
            <p><strong>Date:</strong> {selectedDocument.issuance_date}</p>
            <p><strong>Language:</strong> {selectedDocument.language}</p>
            <p><strong>Pages:</strong> {selectedDocument.pages}</p>
            <p><strong>Document Type:</strong> {selectedDocument.document_type}</p>
            <p><strong>Description:</strong> {selectedDocument.document_description}</p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DrawMap;
