import React, { useState, useEffect, useRef } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Marker, Polygon } from "react-leaflet";
import { Modal, Button, Dropdown, Form } from "react-bootstrap";
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
import DocumentLinksModal from "./link-list";
import LinkIcon from "@mui/icons-material/Link";
import DocumentLink from "./document-link";
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import * as turf from "@turf/turf";
import EditDocumentForm from "./EditDocumentForm";

// Configura l'icona di default di Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-shadow.png",
});

const createCountIcon = (count) => {
  return new L.DivIcon({
    html: `
      <div style="
        background-color: white;
        background-opacity: 0.5;
        color: black; 
        border: 2px solid white; 
        border-radius: 50%; 
        width: 40px; 
        height: 40px; 
        display: flex; 
        justify-content: center; 
        align-items: center; 
        font-size: 15px;
        font-weight: bold;">
        ${count}
      </div>`,
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
};

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


const GeneralMap = ({selectedDocumentId}) => {
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
  const [showEditModal, setShowEditModal] = useState(false);
  const ZOOM_LEVEL = 7;
  const WHOLE_AREA_CENTER = { lat: 67.85572, lng: 20.22513 }; // Definisci le coordinate per Kiruna Map
  const WHOLE_AREA_ZOOM = 12; // Definisci un livello di zoom per Kiruna Map

  useEffect(() => {
    if (!selectedDocument) {
      setShowLinkInterface(false);
    }
  }, [selectedDocument]);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const areas = await API.getGeoArea();
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
        console.log(documents);

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
              document_description: doc.document.document_description,
              stakeholders: doc.document.stakeholders,
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
              document_description: doc.document.document_description,
              stakeholders: doc.document.stakeholders,
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

  useEffect(() => {
    const map = mapRef.current?.leafletElement || mapRef.current;

    if (map) {
      // Rimuovi tutti i marker o cluster precedenti
      map.eachLayer((layer) => {
        if (layer instanceof L.Marker || layer instanceof L.MarkerClusterGroup) {
          map.removeLayer(layer);
        }
      });
    }

    if (selectedArea && selectedArea.name === "Point-Based Documents") {
      renderMarkersWithClustering();
    } else {
      renderAreaMarkers();
    }
  }, [filteredMarkers, selectedArea]);


  //Permette di selezionare automaticamente l'area corretta quando clicchi sul documento sul diagramma
  useEffect(() => {
    console.log("selezionato documento", selectedDocumentId);
    if (selectedDocumentId) {
      // Chiamata all'API per ottenere l'area basata sul documento
      API.getAreaByDocumentTitle(selectedDocumentId)
        .then((response) => {
          console.log("area ottenuta"+response.data);
          // Assicurati che areaId sia un intero
          const areaId = parseInt(response.data);
  
          // Verifica che areaId sia un numero valido
          if (isNaN(areaId)) {
            console.error("areaId non è un numero valido.");
          } else {
            handleAreaChange(areaId);       
          }
        })
        .catch((error) => {
          console.error("Errore nel recupero dell'area:", error);
        });
    }
  }, [selectedDocumentId]);
  

  // Funzione per renderizzare icone cluster aree
  const renderAreaMarkers = () => {
    const map = mapRef.current?.leafletElement || mapRef.current;
    if (!map) return;
  
    // Rimuovi tutti i marker e cluster precedenti
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.MarkerClusterGroup) {
        map.removeLayer(layer);
      }
    });
  
    // Aggiungi il marker dell'area solo se non è "Point-Based Documents"
    if (selectedArea && selectedArea.name !== "Point-Based Documents") {
      const documentsForArea = filteredDocuments.length;
  
      if (selectedArea.latlngs && selectedArea.latlngs.length > 0) {
        let coordinates;
  
        // Verifica se è un poligono o un multipoligono
        if (Array.isArray(selectedArea.latlngs[0])) {
          coordinates = selectedArea.latlngs.map((polygon) =>
            polygon.map((point) => [point.lng, point.lat])
          );
        } else {
          coordinates = [selectedArea.latlngs.map((point) => [point.lng, point.lat])];
        }
  
        const geojson = {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates,
          },
        };
  
        try {
          const center = turf.centerOfMass(geojson);
          const [lng, lat] = center.geometry.coordinates;
  
          const areaMarker = L.marker([lat, lng], {
            icon: createCountIcon(documentsForArea),
          });
  
          map.addLayer(areaMarker);
        } catch (error) {
          console.error("Errore durante il calcolo del centroide:", error);
        }
      } else {
        console.warn("Nessuna coordinate valida trovata per l'area selezionata.");
      }
    }
  };

  
// Funzione per renderizzare icone cluster documenti point-based
const renderMarkersWithClustering = () => {
  if (selectedArea && selectedArea.name === "Point-Based Documents") {
    const map = mapRef.current?.leafletElement || mapRef.current;
    if (!map) return;

    const markerClusterGroup = L.markerClusterGroup();

    filteredMarkers.forEach((marker) => {
      const isHighlighted = marker.document.document_id === selectedDocumentId; // Controlla se l'ID corrisponde
      const leafletMarker = L.marker(marker.latlngs, {
        icon: getMarkerIcon(marker.document.document_type.toLowerCase(), isHighlighted), // Passa il flag
      })
        .on("click", () => {
          handleMarkerClick(marker.document);
          setShowModal(true);
        })
        .on("mouseover", (e) => {
          const selectedDocument = marker.document; // Ottieni il documento selezionato

          const popupContent = `
            <div>
              <p style="margin-bottom: 10px;"><strong>Title:</strong> ${selectedDocument.document_title}</p>
              <p style="margin-bottom: 10px;"><strong>Document Type:</strong> ${selectedDocument.document_type}</p>
              <p style="margin-bottom: 10px;"><strong>Stakeholders:</strong> ${
                selectedDocument.stakeholders.length > 0
                  ? selectedDocument.stakeholders.join(', ')
                  : selectedDocument.stakeholders
              }</p>
              <p style="margin-bottom: 10px;"><strong>Date:</strong> ${selectedDocument.issuance_date}</p>
              <p style="margin-bottom: 10px;"><strong>Scale:</strong> ${selectedDocument.scale}</p>
              ${selectedDocument.language ? `<p style="margin-bottom: 10px;"><strong>Language:</strong> ${selectedDocument.language}</p>` : ''}
              ${selectedDocument.pages ? `<p style="margin-bottom: 10px;"><strong>Pages:</strong> ${selectedDocument.pages}</p>` : ''}
              <p style="margin-bottom: 10px;"><strong>Description:</strong> ${selectedDocument.document_description}</p>

              </div>
          `;

          const popup = L.popup()
            .setLatLng(e.latlng)
            .setContent(popupContent);
          popup.openOn(map); // Apri il popup sulla mappa
        })
        .on("mouseout", () => {
          map.closePopup(); // Chiudi il popup quando il mouse lascia il marker
        });

      markerClusterGroup.addLayer(leafletMarker);
    });

    // Rimuovi eventuali cluster precedenti
    map.eachLayer((layer) => {
      if (layer instanceof L.MarkerClusterGroup) {
        map.removeLayer(layer);
      }
    });

    map.addLayer(markerClusterGroup);
  }
};


  // Funzione per aprire popup dei documenti
  const handleMarkerClick = (document) => {
    setSelectedDocument(document);
  };

  // Funzione per spostare la visuale della mappa in base al tipo di documento
  const changeMapPosition = (doc) => {
    const map = mapRef.current;
    if (!map) return;
  
    // Check if the document is Point-Based Documents-based
    if (doc.area_name === "Point-Based Documents") {
      // Use the document's updated coordinates for a Point-Based Documents-based location
      const [lat, lng] = [doc.coordinates[0].lat, doc.coordinates[0].long];
      map.setView([lat, lng], 13);
    } else if (doc.area_name === "Kiruna Map") {
      // If the document is "Kiruna Map", use predefined coordinates for the entire area
      map.setView([WHOLE_AREA_CENTER.lat, WHOLE_AREA_CENTER.lng], 13);
    }

    // Update the selected marker ID (trigger a re-render of markers)
    setSelectedMarkerId(doc.id);

    // Force markers to update
    setFilteredMarkers((prevMarkers) => [...prevMarkers]);
  };

  const ICON_MAP = {
    design: "/icons/design-icon.png",
    informative: "/icons/informative-icon.png",
    technical: "/icons/technical-icon.png",
    prescriptive: "/icons/prescriptive-icon.png",
    material_effects: "/icons/material-effects-icon.png",
    agreement: "/icons/agreement-icon.png",
    conflict: "/icons/conflict-icon.png",
    consultation: "/icons/consultation-icon.png",
    default: "/icons/default-icon.png",
  };

  const COLOR_MAP = {
    design: "#ff9999", // Rosso chiaro
    informative: "#99ccff", // Blu chiaro
    technical: "#66ff66", // Verde chiaro
    prescriptive: "#ffcc66", // Arancione chiaro
    material_effects: "#ff66cc", // Rosa
    agreement: "#9999ff", // Viola chiaro
    conflict: "#ff6666", // Rosso intenso
    consultation: "#66cccc", // Turchese
    default: "black", // Colore predefinito
  };

  // Funzione per cambiare colore icona
  const getMarkerIcon = (type, isHighlighted) => {
    const iconUrl = ICON_MAP[type] || ICON_MAP.default;
    const iconColor = isHighlighted ? "red" : (COLOR_MAP[type] || COLOR_MAP.default);
  
    return new L.DivIcon({
      html: `
        <img src="${iconUrl}" style="
          width: 50px; 
          height: 50px; 
          border-radius: 50%; 
          border: 3px solid ${iconColor}; 
          padding: 2px; 
          background-color: white" 
        />
      `,
      className: "",
      iconSize: [70, 70],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20],
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
    console.log(document);
    
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

  const extractCoordinates = (document) => {
    if (document.coordinates && document.coordinates.length > 0) {
      // Formato 1: `coordinates[0].lat` e `coordinates[0].long`
      return document.coordinates[0];
    } else if (
      document.geolocations &&
      document.geolocations.length > 0 &&
      document.geolocations[0].coordinates &&
      document.geolocations[0].coordinates.length > 0
    ) {
      // Formato 2: `geolocations[0].coordinates[0].lat` e `geolocations[0].coordinates[0].long`
      return document.geolocations[0].coordinates[0];
    } else {
      // Nessuna coordinata trovata
      return { lat: null, long: null };
    }
  };
  

  const handleAreaChange = (areaId) => {
    var selected = areas.find((area) => area.id === parseInt(areaId, 10));
    console.log("selected"+selected);
    if (!selected) {
      console.log(`Nessuna area trovata per areaId: ${areaId}. Impostando come "Point-Based Documents"`);
      selected = areas.find((area) => area.name === "Point-Based Documents");
    }
    setSelectedArea(selected);
    // setSelectedDocumentType("All");
    // Centra la mappa se l'area ha coordinate
    if (selected.latlngs && selected.latlngs.length > 0) {
      // Controlla se `selected.latlngs[0]` è un array (per multipoligoni)
      const firstPoint = Array.isArray(selected.latlngs[0])
        ? selected.latlngs[0][0] // Prendi il primo punto del primo poligono
        : selected.latlngs[0];   // Usa direttamente il primo punto (se non è multipoligono)

      setCenter(firstPoint);
    } else {
      console.warn("L'area selezionata non ha coordinate valide.");
    }

    if (selected.name !== "Point-Based Documents") {
      renderAreaMarkers();
    }
  };


  return (
    <div className="row" style={{ padding: '0px', width: '100%', marginLeft: '10px', height: '88vh' }}>

      {/* Mappa */}
      <div className="col-8 col-md-8 text-center " style={{ padding: '0' }}>


        <MapContainer ref={mapRef} center={center} zoom={ZOOM_LEVEL} style={{ height: "100%", width: "100%", maxHeight: "88vh", borderRadius: '10px' }}>

          {selectedArea && selectedArea.name !== "Point-Based Documents" &&
            selectedArea.latlngs.map((polygon, index) => (
              <Polygon
                key={`polygon-${selectedArea.id}-${index}`}
                positions={polygon}
                pathOptions={{ color: "blue" }}
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



      </div>

      {/* Sidebar con Dropdown, Search e Lista dei Documenti */}
      <div className="col-4 col-md-4 text-center">


        {/* Menu per cambiare tipo di mappa */}
        <div className="mb-1 mt-2 " >
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


        <div className="d-flex text-center align-center justify-center flex-row gap-4">

          {/* Dropdown per selezionare l'area */}
          <div style={{ marginTop: '40px', marginBottom: '40px' }}>
            <Dropdown onSelect={(eventKey) => handleAreaChange(eventKey)} >
              <Dropdown.Toggle variant="outline-dark">{selectedArea ? selectedArea.name : "Select an area"}</Dropdown.Toggle>
              <Dropdown.Menu>
                {areas && areas.map((area) => (
                  <Dropdown.Item key={area.id} eventKey={area.id}>
                    {area.name}
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>

          </div>

        </div>



        {/* Barra di ricerca */}
        <Form.Control
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="mb-3"
        />

        {/* Lista dei documenti filtrati */}
        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
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
                onClick={doc.area_name === "Kiruna Map" ? () => { handleMarkerClick(doc); setShowModal(true) } : () => changeMapPosition(doc)}
              >

                {/*DOCUMENTI*/}

                <div className="p-2 text-left">
                  <h2><strong>{doc.document_title}</strong></h2>
                  <p className="mt-1"><strong>Type:</strong> {doc.document_type}</p>
                  <p className="mt-1"><strong>Date:</strong> {doc.issuance_date}</p>
                </div>

                {/* OPEN DOCUMENT AND CHANGE POSITION BUTTON*/}
                <div>
                  {user && user.role === "urban_planner" && (
                    <Container className="flex flex-row gap-x-2 text-center">


                      <Button
                        className="mt-4"
                        style={{
                          width: "70%",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "4px",
                          backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white',
                          color: hoveredDocumentId === doc.id ? 'white' : 'black',
                        }}
                        variant="outline"
                        onClick={() => { handleMarkerClick(doc); setShowModal(true) }}
                      >
                        <p style={{ fontSize: "8px" }}>
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
                          padding: "4px",
                          backgroundColor: hoveredDocumentId === doc.id ? '#3e3b40' : 'white',
                          color: hoveredDocumentId === doc.id ? 'white' : 'black',
                        }}
                        variant="outline"
                        onClick={() => changeDocumentPosition(doc)}
                      >
                        <p style={{ fontSize: "8px" }}>
                          <MapIcon alt="Open Map" label="Open Map"></MapIcon>
                        </p>
                      </Button>
                      {/* Pulsante per aprire il Modal dei link */}
                      <Button
                        className="mt-4"
                        style={{
                          width: "70%",
                          border: "1px solid #ddd",
                          borderRadius: "8px",
                          padding: "4px",
                          backgroundColor: hoveredDocumentId === doc.id ? "#3e3b40" : "white",
                          color: hoveredDocumentId === doc.id ? "white" : "black",
                        }}
                        variant="outline"
                        onClick={(event) => {
                          event.stopPropagation(); // Blocca la propagazione dell'evento

                          setSelectedDocument(doc); // Imposta il documento selezionato
                          setShowModalLink(true); // Mostra il modal
                        }}
                        title="Show Links"
                      >
                        <p style={{ fontSize: "8px" }}>
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
        <div className="text-center">
          <DocumentLinksModal
            selectedDocument={selectedDocument}
            showModalLink={showModalLink}
            setShowModalLink={setShowModalLink} />
          </div>

      )}

{/* Modal per visualizzare i dettagli del documento */}
{selectedDocument && showModal && !showEditCoordinatesModal && !showModalLink && (
  <Modal style={{ marginTop: '8%' }} show={showModal} onHide={() => setShowModal(false)}>
    <Modal.Header closeButton>
      <Modal.Title>Document info</Modal.Title>
    </Modal.Header>
    <Modal.Body>
      <p style={{ marginBottom: '10px' }}><strong>Title:</strong> {selectedDocument.document_title}</p>
      <p style={{ marginBottom: '10px' }}><strong>Document Type:</strong> {selectedDocument.document_type}</p>
      <p style={{ marginBottom: '10px' }}><strong>Stakeholders:</strong> {selectedDocument.stakeholders.length > 0 ? selectedDocument.stakeholders.join(', ') : selectedDocument.stakeholders}</p>
      <p style={{ marginBottom: '10px' }}><strong>Date:</strong> {selectedDocument.issuance_date}</p>
      <p style={{ marginBottom: '10px' }}><strong>Description:</strong> {selectedDocument.description}</p>
      <p style={{ marginBottom: '10px' }}><strong>Scale:</strong> {selectedDocument.scale}</p>
      <>
        {selectedDocument.language && <p style={{ marginBottom: '10px' }}><strong>Language:</strong> {selectedDocument.language}</p>}
        {selectedDocument.pages && <p style={{ marginBottom: '10px' }}><strong>Pages:</strong> {selectedDocument.pages}</p>}
      </>
    </Modal.Body>
    <Modal.Footer>
      {user && user.role === "urban_planner" && (
        <>
          <Button
            variant="dark"
            onClick={() => { setShowLinkInterface(true); setShowModal(false); }}
          >
            {`Link Documents`}
          </Button>
          <Button
            variant="dark"
            onClick={() => { setShowEditModal(true); setShowModal(false); }}
            style={{ marginLeft: '10px' }} // Aggiungi margine per separare i pulsanti
          >
            Edit
          </Button>
        </>
      )}
      {/* <Button variant="dark" onClick={() => setShowModal(false)}>
        Close
      </Button> */}
    </Modal.Footer>
  </Modal>
)}

{/* Modal per modificare il documento */}
{selectedDocument && showEditModal && (
  <Modal
    show={showEditModal}
    onHide={() => setShowEditModal(false)}
    size="lg"  // Modal molto largo
    style={{
      marginTop: '0%', // Allinea il modal in alto
      height: '95vh', // Modal che occupa tutta l'altezza della finestra
      maxHeight: '95vh', // Evita che il modal superi l'altezza della finestra
    }}
  >
    <Modal.Header closeButton>
      <Modal.Title>Edit {selectedDocument.document_title}</Modal.Title>
    </Modal.Header>
    <Modal.Body
      style={{
        height: '80vh',  // Calcola l'altezza disponibile (escludendo l'header)
        overflowY: 'auto',  // Abilita la scrollbar verticale
      }}
    >
      {/* Passa solo document_title alla componente EditDocumentForm */}
      <EditDocumentForm 
        documentTitle={selectedDocument.document_title} 
        onClose={() => setShowEditModal(false)}  // Passa la funzione per chiudere il modal
      />
    </Modal.Body>
    {/* <Modal.Footer>
      <Button variant="dark" onClick={() => setShowEditModal(false)}>
        Close
      </Button>
    </Modal.Footer> */}
  </Modal>
)}
  
      {/* Modal to link documents */}
      {selectedDocument && showLinkInterface && (
        <Modal show={showLinkInterface} onHide={() => setShowLinkInterface(false)} style={{ marginTop: '8%' }}>
          <Modal.Header closeButton>
            <Modal.Title>Links for {selectedDocument.document_title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <DocumentLink initialDocument={selectedDocument} />
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
                      value={extractCoordinates(selectedDocument).lat || ""}
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
                      value={extractCoordinates(selectedDocument).long || ""}
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
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity} sx={{ width: '40%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

    </div>
  );
};

export default GeneralMap;