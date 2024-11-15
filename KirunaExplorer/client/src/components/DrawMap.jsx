import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  FeatureGroup,
  Marker,
  Polygon,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import osm from "./osm-providers";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import API from "../services/API";
import { Modal, Button } from "react-bootstrap";

// Configura l'icona di default di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

const DrawMap = () => {
  const [center] = useState({ lat: 67.85572, lng: 20.22513 });
  const [mapLayers, setMapLayers] = useState([]);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const ZOOM_LEVEL = 15;

  useEffect(() => {
    const fetchDocumentsGeo = async () => {
      try {
        const response = await API.getDocumentsGeo();
        const documents = Array.isArray(response) ? response : [];

        const layers = documents.map((doc) => ({
          id: doc.document_id,
          type: "marker",
          latlngs: [doc.lat, doc.long],
          document: doc,
        }));

        setMapLayers(layers);
      } catch (error) {
        console.error("Error while fetching documents:", error);
      }
    };

    fetchDocumentsGeo();
  }, []);

  const handleMarkerClick = (document) => {
    setSelectedDocument(document);
    setShowModal(true);
  };

  const _onCreate = (e) => {
    const { layerType, layer } = e;
    const { _leaflet_id } = layer;

    if (layerType === "polygon") {
      setMapLayers((layers) => [
        ...layers,
        { id: _leaflet_id, type: layerType, latlngs: layer.getLatLngs()[0] },
      ]);
    } else if (layerType === "marker") {
      setMapLayers((layers) => [
        ...layers,
        { id: _leaflet_id, type: layerType, latlngs: layer.getLatLng() },
      ]);
    }
  };

  return (
    <div className="row">
      <div className="col text-center">
        <MapContainer
          center={center}
          zoom={ZOOM_LEVEL}
          style={{ height: "700px", width: "1400px" }}
        >
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={_onCreate}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: true,
                polyline: false,
              }}
            />
            {mapLayers.map((layer) =>
              layer.type === "polygon" ? (
                <Polygon key={layer.id} positions={layer.latlngs} />
              ) : (
                <Marker
                  key={layer.id}
                  position={layer.latlngs}
                  eventHandlers={{
                    click: () => handleMarkerClick(layer.document),
                  }}
                />
              )
            )}
          </FeatureGroup>
          <TileLayer
            url={osm.maptiler.url}
            attribution={osm.maptiler.attribution}
          />
        </MapContainer>
      </div>

      {selectedDocument && (
        <Modal show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Document info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              <strong>Name:</strong> {selectedDocument.document_title}
            </p>
            <p>
              <strong>Stakeholder:</strong> {selectedDocument.stakeholder}
            </p>
            <p>
              <strong>Scale:</strong> {selectedDocument.scale}
            </p>
            <p>
              <strong>Date:</strong> {selectedDocument.issuance_date}
            </p>
            <p>
              <strong>Language:</strong> {selectedDocument.language}
            </p>
            <p>
              <strong>Pages:</strong> {selectedDocument.pages}
            </p>
            <p>
              <strong>Document Type:</strong> {selectedDocument.document_type}
            </p>
            <p>
              <strong>Coordinates:</strong> {selectedDocument.lat},{" "}
              {selectedDocument.long}
            </p>
            <p>
              <strong>Description:</strong>{" "}
              {selectedDocument.document_description}
            </p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default DrawMap;
