import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Marker, Polygon } from "react-leaflet";
import { Modal, Button, Dropdown, Form } from "react-bootstrap";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import API from "../services/API";
import { useAuth } from "@/contexts/AuthContext";
import { Container } from "@mui/material";
import ArticleIcon from '@mui/icons-material/Article';
import { MapIcon, LinkIcon } from "lucide-react";
import CoordsMap from "./CoordsMap";
import { Snackbar, Alert } from "@mui/material";
import DocumentLinksModal from "./link-list";
// Configura l'icona di default di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});


const tileLayers = {
  maptiler: {
    url: "https://api.maptiler.com/maps/basic/256/{z}/{x}/{y}.png?key=BIzjthaYAgeFFw8kkpi9",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  },
  dark: {
    url: "https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png",
  },
};


const GeneralMap = () => {
  const [center, setCenter] = useState({ lat: 67.85572, lng: 20.22513 });
  const [filteredMarkers, setFilteredMarkers] = useState([]);
  const [selectedArea, setSelectedArea] = useState();
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
  const [mapType, setMapType] = useState("satellite"); // Tipo di mappa selezionato
  const [areas, setAreas] = useState([]); // Stato per le aree
  const [allDocs, setAllDocs] = useState([]);
  const [showModalLink, setShowModalLink] = useState(false); //modal per popup links
  const [showLinkInterface, setShowLinkInterface] = useState(false);
  useEffect(() => {
    if (!selectedDocument) {
      setShowLinkInterface(false);
    }
  }, [selectedDocument]);
  const ZOOM_LEVEL = 7;
  const WHOLE_AREA_CENTER = { lat: 67.85572, lng: 20.22513 }; // Definisci le coordinate per Kiruna Map
  const WHOLE_AREA_ZOOM = 12; // Definisci un livello di zoom per Kiruna Map

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await API.getGeoArea();
        // console.log(areas);
        setSelectedArea(areas[0]);
        setAreas(areas)
      } catch (error) {
        console.error("Errore durante il fetch delle aree:", error);
      }
    };

    fetchAreas();
  }, []);

  useEffect(() => {
    const fetchDocumentsGeo = async () => {
      if (!selectedArea) return; // Aggiungi questo controllo

      try {
        const response = await API.getDocumentsGeo();
        const documents = Array.isArray(response) ? response : [];

        if (selectedArea.name === "Point-Based Documents") {

          let markers = documents.filter((document) => {
            return document.geolocations.some((geo) => geo.area_name === "Point-Based Documents");
          });

          if (markers.length === 0) {
            setFilteredDocuments([]); // Inizialmente mostra tutti i documenti
            setFilteredMarkers([]);
            setAllDocs([]);

          } else {

            const filteredMarkers = markers.map((doc) => ({
              id: doc.document_id,
              type: "marker",
              latlngs: [doc.geolocations[0].coordinates[0].lat, doc.geolocations[0].coordinates[0].long],
              document: doc,
            }));

            const pointBasedDocuments = filteredMarkers.map((doc) => ({
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

            setFilteredDocuments(pointBasedDocuments); // Inizialmente mostra tutti i documenti
            setFilteredMarkers(filteredMarkers);
            setAllDocs(filteredMarkers);

          }
        } else if (selectedArea.name !== "Point-Based Documents") {
          // Filter documents for "Kiruna Map"
          let markers = documents.filter((document) => {
            return document.geolocations.some(
              (geo) => geo.area_name === selectedArea.name
            );
          });
          if (markers.length === 0) {

            setFilteredDocuments([]);
            setFilteredMarkers([]);
            setAllDocs([]);

          } else {
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

            setFilteredDocuments(wholeAreaDocs); // Set documents for Kiruna Map
            setFilteredMarkers(filteredMarkers);
            setAllDocs(filteredMarkers);

          }
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

    // Check if the document is Point-Based Documents-based
    if (doc.area_name === "Point-Based Documents") {
      // Use the document's updated coordinates for a Point-Based Documents-based location
      const [lat, lng] = [doc.coordinates[0].lat, doc.coordinates[0].long];
      map.setView([lat, lng], ZOOM_LEVEL);
    } else if (doc.area_name === "Kiruna Map") {
      // If the document is "Kiruna Map", use predefined coordinates for the entire area
      map.setView([WHOLE_AREA_CENTER.lat, WHOLE_AREA_CENTER.lng], WHOLE_AREA_ZOOM);
    }

    // Update the selected marker ID (after setting map view)
    setSelectedMarkerId(doc.id);
  };

  // Funzione per cambiare colore icona
  const getMarkerIcon = (id) => {
    return id === selectedMarkerId
      ? new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", // Icona rossa per il marker selezionato
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      })
      : new L.Icon({
        iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png", // Icona blu per gli altri marker
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
      setFilteredDocuments(allDocs.map((doc) => doc.document));
    } else {

      // Altrimenti, filtra i documenti in base al titolo e alla descrizione
      const filtered = filteredMarkers.filter((doc) =>
        doc.document.document_title.toLowerCase().includes(query.toLowerCase()) ||
        doc.document.document_description.toLowerCase().includes(query.toLowerCase())
      );


      setFilteredDocuments(filtered.map((doc) => doc.document));
    }
  };



  const changeDocumentPosition = (document) => {
    setSelectedDocument(document);
    setShowEditCoordinatesModal(true);
    setShowModal(false);

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
        const selectedAreaName = selectedDocument.area_name; // Area selezionata dal menu a tendina

        if (selectedAreaName && selectedAreaName !== "Point-Based Documents") {
          // Se è selezionata un'area diversa da Point-Based Documents
          const selectedAreaObj = areas.find((area) => area.name === selectedAreaName);

          if (selectedAreaObj) {
            // Aggiorna solo l'area del documento
            await API.updateDocumentArea(selectedDocument.id, selectedAreaObj.id);

            // Aggiorna lo stato locale
            setSelectedArea(selectedAreaObj);
            setFilteredDocuments((prevDocuments) =>
              prevDocuments.map((doc) =>
                doc.id === selectedDocument.id
                  ? { ...doc, area_name: selectedAreaName }
                  : doc
              )
            );
          }
        } else {
          await API.updateDocumentCoordinates(selectedDocument.id, lat, long);

          // Aggiorna filteredDocuments
          setFilteredDocuments((prevDocuments) =>
            prevDocuments.map((doc) =>
              doc.id === selectedDocument.id
                ? { ...doc, coordinates: [{ lat, long }] }
                : doc
            )
          );

          // Aggiorna filteredMarkers
          setFilteredMarkers((prevMarkers) =>
            prevMarkers.map((marker) =>
              marker.id === selectedDocument.id
                ? { ...marker, latlngs: [lat, long] }
                : marker
            )
          );

          if (areas.find(area => area.name === 'Point-Based Documents')) {
            setSelectedArea(areas.find(area => area.name === 'Point-Based Documents'));

          } else {
            window.location.reload();
          }
        }

        // Chiudi i modali
        setShowEditCoordinatesModal(false);
        setShowModal(false);

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

  const handleAreaChange = (areaId) => {
    const selected = areas.find((area) => area.id === parseInt(areaId, 10));
    setSelectedArea(selected);

    // Centra la mappa se l'area ha coordinate
    if (selected.latlngs.length > 0) {
      const [firstPoint] = selected.latlngs[0];
      setCenter(firstPoint);
    }
  };


  return (
    <div className="row" style={{ padding: '0px', width: '100%', margin: '0', height: '650px' }}>

      {/* Mappa */}
      <div className="col-12 col-md-8 text-center ">

        <MapContainer ref={mapRef} center={center} zoom={ZOOM_LEVEL} style={{ height: "100%", width: "100%" }}>

          {selectedArea && selectedArea.name === "Kiruna Map" &&
            selectedArea.latlngs.map((polygon, index) => (
              <Polygon

                key={`polygon-${selectedArea.id}-${index}`}
                positions={polygon}
                pathOptions={{ color: "blue" }}

              />
            ))}

          {selectedArea && selectedArea.name === "Point-Based Documents" &&
            filteredMarkers.map((marker) => (
              <Marker
                key={`marker-${marker.id}`}
                position={marker.latlngs}
                icon={getMarkerIcon(marker.id)}
                eventHandlers={{
                  click: () => handleMarkerClick(marker.document),
                }}
                customId={marker.id}
              />
            ))
          }

          {selectedArea && selectedArea.name === "Point-Based Documents" &&
            

            areas.filter(area => area.name === 'Kiruna Map').map((area) => (
              area.latlngs.map((polygon, index) => (
                <Polygon
  
                  key={`polygon-${area.id}-${index}`}
                  positions={polygon}
                  // pathOptions={{ color: "white" }}
  
                />
              ))
            ))
          }

          {selectedArea && selectedArea.name === "All areas" &&
            filteredMarkers.map((marker) => (
              <Marker
                key={`marker-${marker.id}`}
                position={marker.latlngs}
                icon={getMarkerIcon(marker.id)}
                eventHandlers={{
                  click: () => handleMarkerClick(marker.document),
                }}
                customId={marker.id}
              />
            ))}

          {selectedArea && <Polygon key={selectedArea.id} positions={selectedArea.latlngs} />}
          <TileLayer
            url={tileLayers[mapType].url}
            attribution={tileLayers[mapType].attribution}
          />

        </MapContainer>

        {/* Menu per cambiare tipo di mappa */}
        <div className="mt-3 ">
          <Button
            type="button"
            variant="outline-dark"
            className={`btn ${mapType === "maptiler" ? "btn-dark" : "btn-outline-primary"} rounded-pill`}
            style={{ color: `${mapType === "maptiler" ? "white" : "black"}`, fontSize: "12px" }}
            onClick={() => setMapType("maptiler")}
          >

            MAPTILER
          </Button>
          <Button
            type="button"
            variant="outline-dark"

            className={`ml-3 btn ${mapType === "satellite" ? "btn-dark" : "btn-outline-primary"} rounded-pill`}
            style={{ color: `${mapType === "satellite" ? "white" : "black"}`, fontSize: "12px" }}
            onClick={() => setMapType("satellite")}
          >
            SATELLITE
          </Button>
          <Button
            type="button"
            variant="outline-dark"

            className={`ml-3 btn ${mapType === "dark" ? "btn-dark" : "btn-outline-primary"} rounded-pill`}
            style={{ color: `${mapType === "dark" ? "white" : "black"}`, fontSize: "12px" }}
            onClick={() => setMapType("dark")}
          >
            DARK
          </Button>
        </div>

      </div>

      {/* Sidebar con Dropdown, Search e Lista dei Documenti */}
      <div className="col-12 col-md-4">
        {/* Dropdown per selezionare l'area */}

        <Dropdown onSelect={(eventKey) => handleAreaChange(eventKey)} className="mb-3">
          <Dropdown.Toggle variant="outline-dark">{selectedArea ? selectedArea.name : "Select an area"}</Dropdown.Toggle>
          <Dropdown.Menu>
            {areas && areas.map((area) => (
              <Dropdown.Item key={area.id} eventKey={area.id}>
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
          {selectedArea && filteredDocuments.length > 0 ? filteredDocuments.map((doc) => (
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
                  cursor: 'Point-Based Documents',
                  backgroundColor: hoveredDocumentId === doc.id ? '#cfcfcf' : 'white',
                  color: 'black',
                  fontSize: '14px',
                }}
                
                onMouseEnter={() => setHoveredDocumentId(doc.id)}
                onMouseLeave={() => setHoveredDocumentId(null)}
                onMouseOver={ () => {}}
                onClick={doc.area_name === "Kiruna Map" ? () => handleMarkerClick(doc) : () => changeMapPosition(doc)}
              >
                <div className="p-2">
                  <h2><strong>{doc.document_title}</strong></h2>
                  <p className="mt-3"><strong>Type:</strong> {doc.document_type}</p>
                  <p className="mt-1"><strong>Date:</strong> {doc.issuance_date}</p>
                  {/* <p className="mt-1"><strong>Area:</strong> {doc.area_name === "Point-Based Documents" ? "Point-Based Documents" : doc.area_name}</p> */}
                  {/* Mostra le coordinate */}
                  {doc.coordinates && doc.coordinates.length > 0 && doc.area_name === "Point-Based Documents" && (
                    <p className="mt-1">
                      {doc.coordinates.map((coord, index) => (
                        <span className="" key={index}>
                          <strong>LAT:</strong> {coord.lat.toFixed(6)}  <strong>LONG:</strong> {coord.long.toFixed(6)}
                        </span>
                      ))}
                    </p>
                  )}
                </div>

                {/* OPEN DOCUMENT AND CHANGE POSITION BUTTON*/}
                <div>
                  {user && user.role === "urban_planner" && (
                    <Container className="flex flex-row gap-x-4 text-center">


                      <Button
                        className="mt-4"
                        style={{
                          width: "70%",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "8px",
                          backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white',
                          color: hoveredDocumentId === doc.id ? 'white' : 'black',
                        }}
                        variant="outline"
                        onClick={() => handleMarkerClick(doc)}
                      >
                        <p style={{ fontSize: "12px" }}>
                          <ArticleIcon></ArticleIcon>
                        </p>
                      </Button>


                      <Button
                        className="mt-4"
                        type="button"
                        style={{
                          width: "70%",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "8px",
                          backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white',
                          color: hoveredDocumentId === doc.id ? 'white' : 'black',
                        }}
                        variant="outline"
                        onClick={() => changeDocumentPosition(doc)}
                      >
                        <p style={{ fontSize: "12px" }}>
                          <MapIcon alt="Open Map" label="Open Map"></MapIcon>
                        </p>
                      </Button>
                          {/* Pulsante per aprire il Modal */}
                          <Button
                            className="mt-4"
                            style={{
                              width: "70%",
                              border: "1px solid #ddd",
                              borderRadius: "8px",
                              padding: "8px",
                              backgroundColor: hoveredDocumentId === doc.id ? "#3e3b40" : "white",
                              color: hoveredDocumentId === doc.id ? "white" : "black",
                            }}
                            variant="outline"
                            onClick={() => {
                              setSelectedDocument(doc); // Imposta il documento selezionato
                              setShowModal(false);

                              setShowModalLink(true); // Mostra il modal
                            }}
                            title="Show Links"
                          >
                            <p style={{ fontSize: "12px" }}>
                              <LinkIcon alt="Show Links" label="Show Links" />
                              
                            </p>
                          </Button>
                    </Container>
                  )}
                </div>
              </div>
            </div>
          )) :
            <div style={{ textAlign: 'center' }}>
              <p>No documents found.</p>
            </div>
          }
        </div>

      </div>

     {/* Modal per visualizzare i link del documento */}
     {selectedDocument && showModalLink && (
          <DocumentLinksModal   
          selectedDocument={selectedDocument} 
          showModalLink={showModalLink} 
          setShowModalLink={setShowModalLink}/>

          )}
      {/* Modal per visualizzare i dettagli del documento */}
      {selectedDocument && showModal && !showEditCoordinatesModal && (
        <Modal style={{ marginTop: '8%' }} show={showModal} onHide={() => setShowModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>Document info</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p><strong>Name:</strong> {selectedDocument.document_title}</p>
            <p><strong>Document Type:</strong> {selectedDocument.document_type}</p>
            <p><strong>Stakeholder:</strong> {selectedDocument.stakeholder}</p>
            <p><strong>Date:</strong> {selectedDocument.issuance_date}</p>
            <p><strong>Description:</strong> {selectedDocument.description}</p>
            <p><strong>Scale:</strong> {selectedDocument.scale}</p>
            <>
              {selectedDocument.language && <p><strong>Language:</strong> {selectedDocument.language}</p>}
              {selectedDocument.pages && <p><strong>Pages:</strong> {selectedDocument.pages}</p>}
            </>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="dark" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
  {/* Modal to link documents */}
  {selectedDocument && showLinkInterface && (
<Modal show={showModalLink} onHide={() => setShowLinkInterface(false)} style={{ marginTop: '8%' }}>
      <Modal.Header closeButton>
        <Modal.Title>Links for {selectedDocument.document_title}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <DocumentLink selectedDocument={selectedDocument} />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="dark" onClick={() => setShowLinkInterface(false)}>
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
          onHide={() => { setShowEditCoordinatesModal(false); setShowModal(false); }}
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



              <Form.Group controlId="areaSelect" className="text-center">
                <Form.Label className="text-center w-100">Select Area</Form.Label>
                <Form.Control
                  as="select"
                  value={selectedDocument.area_name || ""}
                  onChange={(e) => {
                    const selectedAreaName = e.target.value;
                    setSelectedDocument((prevDoc) => ({
                      ...prevDoc,
                      area_name: selectedAreaName,
                    }));
                    setIsWholeAreaChecked(selectedAreaName !== "Point-Based Documents");
                  }}
                >
                  {areas.map((area) => (
                    <option key={area.id} value={area.name}>
                      {area.name}
                    </option>
                  ))}
                </Form.Control>
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

export default GeneralMap;