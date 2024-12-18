import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Polygon } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button, Modal, Form } from "react-bootstrap";
import { Popup } from "react-leaflet";
import API from "../../src/services/API";
import { Snackbar, Alert } from "@mui/material";
import { Marker } from "react-leaflet";
import { Crop, MapPin, Trash2, Edit } from "lucide-react";
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

const DrawMap = () => {
    const [center] = useState({ lat: 67.85572, lng: 20.22513 });
    const [mapLayers, setMapLayers] = useState([]);
    const [filteredLayers, setFilteredLayers] = useState([]);
    const [selectedAreas, setSelectedAreas] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [mapType, setMapType] = useState("satellite");
    const [showModal, setShowModal] = useState(false);
    const [currentLayer, setCurrentLayer] = useState(null);
    const [selectedLayer, setSelectedLayer] = useState(null);

    const [areaName, setAreaName] = useState("");
    const [viewMode, setViewMode] = useState('polygons');
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMsg, setSnackbarMsg] = useState("");
    const [errorSeverity, setErrorSeverity] = useState("");
    const featureGroupRef = useRef(); // Riferimento al FeatureGroup
    const [showEditModal, setShowEditModal] = useState(false); // Stato per aprire/chiudere il modal
    const [newAreaName, setNewAreaName] = useState(''); // Nuovo nome dell'area
  
    useEffect(() => {
        const fetchMapLayers = async () => {
            try {
                const areas = await API.getGeoArea();
                const documents = await API.getDocumentsGeo();
                console.log(documents);

                const filteredAreas = areas.filter(area => area.name !== 'Point-Based Documents');

                // Associa i documenti alle aree
                const areasWithDocuments = filteredAreas.map((area) => {
                    const associatedDocuments = documents.filter((doc) =>
                        doc.geolocations.some((geo) => geo.area_name === area.name)
                    );
                    return { ...area, documents: associatedDocuments };
                });


                setMapLayers(areasWithDocuments);
                setFilteredLayers(areasWithDocuments); // Inizialmente tutte le aree sono visualizzate

                // Seleziona di default l'area chiamata "Kiruna Map"
                const defaultSelected = areasWithDocuments.find(area => area.name === "Kiruna Map");
                if (defaultSelected) {
                    setSelectedAreas([defaultSelected.name]);
                }
            } catch (error) {
                console.error("Errore durante il caricamento:", error);
            }
        };

        fetchMapLayers();
    }, []);

    useEffect(() => {
        // Aggiorna le aree filtrate in base alla selezione
        if (selectedAreas.length === 0) {
            setFilteredLayers(mapLayers); // Mostra tutte le aree
        } else {
            setFilteredLayers(
                mapLayers.filter((layer) => selectedAreas.includes(layer.name))
            );
        }
    }, [selectedAreas, mapLayers]);


    const saveArea = async () => {
        if (currentLayer) {
            const coordinates = currentLayer.getLatLngs()[0];
            if (!coordinates || coordinates.length === 0) {
                setSnackbarMsg("Missing coordinates. Please draw a valid area.");
                setOpenSnackbar(true);
                setErrorSeverity("error");
                return;
            }

            const dbFormat = coordinates.map((point, index) => ({
                long: point.lng,
                lat: point.lat,
                area_name: areaName,
                n_order: index + 1,
                sub_area_id: null,
            }));

            try {
                const res = await API.addArea(dbFormat);

                if (res.success) {
                    setSnackbarMsg("Area saved successfully.");
                    setOpenSnackbar(true);
                    setErrorSeverity("success");
                    setMapLayers((layers) => [
                        ...layers,
                        {
                            id: currentLayer._leaflet_id,
                            type: "polygon",
                            latlngs: coordinates,
                            name: areaName,
                        },
                    ]);
                    setCurrentLayer(null);
                    setAreaName("");
                    setShowModal(false);

                    // Rimuovi il layer blu
                    if (featureGroupRef.current && currentLayer) {
                        featureGroupRef.current.removeLayer(currentLayer);
                    }
                } else {
                    handleError(res.status);
                }
            } catch (error) {
                console.error("Error saving area:", error);
                setSnackbarMsg("Unable to save area due to a server error.");
                setOpenSnackbar(true);
                setErrorSeverity("error");
            }
        }
    };

    const handleError = (status) => {
        switch (status) {
            case 403:
                setSnackbarMsg("Area name already exists.");
                break;
            case 422:
                setSnackbarMsg("Missing area name.");
                break;
            default:
                setSnackbarMsg("An unexpected error occurred.");
        }
        setOpenSnackbar(true);
        setErrorSeverity("error");
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };


  // Funzione per aprire il modal di editing
  const handleEditClick = (layer) => {
    setSelectedLayer(layer);
    setNewAreaName(layer.name); // Imposta il nome attuale come valore predefinito nel campo di input
    setShowEditModal(true); // Mostra il modal
  };

  // Funzione per gestire la modifica del nome dell'area
  const handleEditSubmit = async () => {
    if (newAreaName && newAreaName !== selectedLayer.name) {
      const body = {
        area_id: selectedLayer.id,
        new_area_name: newAreaName,
      };
  
      const result = await API.updateArea(body);
  
      
        // Handle error based on the error returned by the API
        if (result.error === "The area name is already in use. Please choose a different name.") {
          setSnackbarMsg(result.error);
          setErrorSeverity("error");
          setOpenSnackbar(true);
        } else {
          // Update the area's name in mapLayers
        setMapLayers((prevLayers) =>
            prevLayers.map((layer) =>
              layer.id === selectedLayer.id ? { ...layer, name: newAreaName } : layer
            )
          );
    
          // If filteredLayers is in use, update it as well
          setFilteredLayers((prevFilteredLayers) =>
            prevFilteredLayers.map((layer) =>
              layer.id === selectedLayer.id ? { ...layer, name: newAreaName } : layer
            )
          );
    
          // Show success message
          setSnackbarMsg("Area name updated successfully!");
          setErrorSeverity("success");
          setOpenSnackbar(true);
        }
      
  
      setShowEditModal(false);
    } else {
      // Show validation message
      setSnackbarMsg("Please enter a new name for the area.");
      setErrorSeverity("warning");
      setOpenSnackbar(true);
    }
  };
  
  
  
  

    const toggleAreaSelection = (areaName) => {
        setSelectedAreas((prev) =>
            prev.includes(areaName)
                ? prev.filter((name) => name !== areaName)
                : [...prev, areaName]
        );
    };

    const toggleSelectAll = () => {
        if (selectedAreas.length === 0) {
            setSelectedAreas(mapLayers.map((layer) => layer.name)); // Seleziona tutte
        } else {
            setSelectedAreas([]); // Deseleziona tutte
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === "clickaway") {
            return;
        }
        setOpenSnackbar(false);
    };

    const deleteArea = async (area_name) => {
        try {

            const res = await API.deleteArea(area_name);

            if (res) {
                setSnackbarMsg("Area deleted successfully.");
                setOpenSnackbar(true);
                setErrorSeverity("success");

                setMapLayers((prevLayers) => {
                    const updatedLayers = prevLayers.filter((layer) => layer.name !== area_name);
                    setFilteredLayers(updatedLayers);
                    return updatedLayers;
                });

                setSelectedAreas((prevSelected) =>
                    prevSelected.filter((name) => name !== area_name)
                );
            } else {
                handleError(res.status);
            }
        } catch (error) {
            console.error("Error deleting area:", error);
            setSnackbarMsg("Unable to delete Kiruna Map");
            setOpenSnackbar(true);
            setErrorSeverity("error");
        }
    };


    return (
        <div className="row" style={{ height: "88vh", width: "100%" }}>
            {/* Menu per cambiare tipo di mappa */}

            {/* Colonna sinistra: mappa */}
            <div className="col-9 col-md-9 text-center" style={{  padding: '0' }}>

                <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%", maxHeight: "88vh", borderRadius: '10px' }}>
                    <div>
                        <FeatureGroup ref={featureGroupRef}>
                            <EditControl
                                position="topright"
                                onCreated={(e) => {
                                    const { layerType, layer } = e;
                                    if (layerType === "polygon") {
                                        setCurrentLayer(layer);
                                        setShowModal(true);
                                    }
                                }}

                                draw={{
                                    rectangle: false,
                                    circle: false,
                                    circlemarker: false,
                                    marker: false,
                                    polyline: false,
                                }}
                                edit={{
                                    edit: false,
                                    remove: false, // Disabilita il pulsante di cancellazione

                                }}
                            />
                            {/* Visualizza i poligoni quando in modalità 'polygons' */}
                            {filteredLayers.map((layer) =>
                                layer.latlngs ? (
                                    <React.Fragment key={layer.id}>
                                        {selectedAreas.length > 0 && selectedAreas.includes(layer.name) && viewMode === 'polygons' && (
                                            <Polygon positions={layer.latlngs} pathOptions={{
                                                color: layer.name === "Kiruna Map" ? "white" : "blue", // Usa rosso per "Kiruna Map", altrimenti blu
                                                weight: 2,
                                                opacity: 1,
                                            }}>
                                                      <Popup>
                                                    <div className="d-flex flex-column text-center">
                                                        <p style={{fontSize:'10pt'}}><strong>Area:</strong> {layer.name}</p>
                                                        {layer.documents && layer.documents.length > 0 ? <div>
                                                            <p style={{fontSize:'10pt'}}><strong>Documents {"(" + layer.documents.length +")"}</strong></p>
                                                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                                                {layer.documents && layer.documents.length > 0 ? (
                                                                    layer.documents.map((doc, index) => (
                                                                        <li key={index} style={{textAlign:'left'}}>
                                                                             • <i>{doc.document_title}</i>
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li>No documents available</li>
                                                                )}
                                                            </ul>
                                                        </div> : <p>No documents available</p>}
                                                    </div>
                                                </Popup>


                                            </Polygon>
                                        )}
                                        {/* Visualizza i marker quando in modalità 'markers' */}
                                        {selectedAreas.length > 0 && selectedAreas.includes(layer.name) && viewMode === 'markers' && (
                                            <Marker

                                                position={L.polygon(layer.latlngs).getBounds().getCenter()}
                                                icon={L.icon({ iconUrl: layer.name === "Kiruna Map" ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png" : "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png" })}
                                                eventHandlers={{
                                                    click: () => {
                                                        // Toggle the selection of the layer and show the polygon when the marker is clicked
                                                        setSelectedLayer(prevLayer => {
                                                            // If the same layer is clicked again, deselect it, otherwise select it
                                                            if (prevLayer === layer.id) {
                                                                return null; // Deselect
                                                            } else {
                                                                return layer.id; // Select the new layer
                                                            }
                                                        });
                                                    },
                                                }}
                                            >
                                                     <Popup>
                                                    <div className="d-flex flex-column text-center">
                                                        <p style={{fontSize:'10pt'}}><strong>Area:</strong> {layer.name}</p>
                                                        {layer.documents &&  layer.documents.length > 0 ? <div>
                                                            <p style={{fontSize:'10pt'}}><strong>Documents {"(" + layer.documents.length +")"}</strong></p>
                                                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                                                {layer.documents && layer.documents.length > 0 ? (
                                                                    layer.documents.map((doc, index) => (
                                                                        <li key={index} style={{textAlign:'left'}}>
                                                                             • <i>{doc.document_title}</i>
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li>No documents available</li>
                                                                )}
                                                            </ul>
                                                        </div> : <p>No documents available</p>}
                                                    </div>
                                                </Popup>

                                            </Marker>
                                        )}
                                        {/* Mostra il poligono quando un marker è selezionato */}
                                        {selectedLayer === layer.id && viewMode === 'markers' && (
                                            <Polygon positions={layer.latlngs} pathOptions={{
                                                color: layer.name === "Kiruna Map" ? "white" : "blue", // Usa rosso per "Kiruna Map", altrimenti blu
                                                weight: 2,
                                                opacity: 1,
                                            }}>
                                                  <Popup>
                                                    <div className="d-flex flex-column text-center">
                                                        <p style={{fontSize:'10pt'}}><strong>Area:</strong> {layer.name}</p>
                                                        {layer.documents && layer.documents.length > 0 ? <div>
                                                            <p style={{fontSize:'10pt'}}><strong>Documents {"(" + layer.documents.length +")"}</strong></p>
                                                            <ul style={{ listStyleType: "none", padding: 0 }}>
                                                                {layer.documents && layer.documents.length > 0 ? (
                                                                    layer.documents.map((doc, index) => (
                                                                        <li key={index} style={{textAlign:'left'}}>
                                                                             • <i>{doc.document_title}</i>
                                                                        </li>
                                                                    ))
                                                                ) : (
                                                                    <li>No documents available</li>
                                                                )}
                                                            </ul>
                                                        </div> : <p>No documents available</p>}
                                                    </div>
                                                </Popup>


                                            </Polygon>
                                        )}
                                    </React.Fragment>
                                ) : null
                            )}
                        </FeatureGroup>

                        <TileLayer
                            url={tileLayers[mapType].url}
                            attribution={tileLayers[mapType].attribution}
                        />

                    </div>
                </MapContainer>

                {/* Modal per inserire il nome dell'area */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header>
                        <Modal.Title>Insert area name</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form
                            onSubmit={(event) => {
                                event.preventDefault(); // Impedisce il refresh della pagina
                                handleSave(); // Chiama la funzione per salvare l'area
                            }}>
                            <Form.Group>
                                {/* <Form.Label>Area name</Form.Label> */}
                                <Form.Control
                                    type="text"
                                    value={areaName}
                                    onChange={(e) => setAreaName(e.target.value)}
                                    placeholder="Area name..."
                                />
                            </Form.Group>
                        </Form>
                    </Modal.Body>
                    <Modal.Footer>
                        {/* <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Delete
                        </Button> */}
                        <Button type="button" variant="primary" onClick={saveArea}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>


            </div>

            {/* Colonna destra: lista delle aree */}
            <div className="col-3 col-md-3 bg-light p-3" >
                <div className="text-center" style={{ marginBottom: '30px' }}>
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

                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '20px', marginTop: '20px', width: '100%' }}>
                    <Button style={{ width: '65%', borderRadius: '18px', border: '2px solid black', paddingTop: '5px', paddingBottom: '5px' }} type="button" variant="dark" onClick={viewMode === 'polygons' ? () => setViewMode('markers') : () => setViewMode('polygons')}>
                        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gapX: '20px' }}>

                            Switch View Mode: {viewMode === 'polygons' ? <> <Crop style={{ marginLeft: '10px' }} /></> : <> <MapPin style={{ marginLeft: '10px' }} /></>}
                        </div>
                    </Button>

                </div>
                {/* <h5>Select areas</h5> */}


                <div style={{ width: '100%', textAlign: 'center', justifyContent: 'center', alignItems: 'center' }}>

                    <Button variant="dark" onClick={toggleSelectAll}
                        style={{ width: '70%', textAlign: 'center', fontSize: '14px', marginTop: '20px', border: '1px solid black', borderRadius: '20px', padding: '10px' }}>
                        Select All
                        <Form.Check
                            type="checkbox"
                            label="Select / Deselect All"
                            checked={selectedAreas.length === mapLayers.length}
                            onChange={toggleSelectAll}
                            onClick={toggleSelectAll}
                            style={{ display: 'none' }} // Nasconde la checkbox

                        />
                    </Button>
                </div>
                <Form.Control
        type="text"
        placeholder="Search areas by name"
        value={searchTerm}
        onChange={handleSearchChange}
        style={{ marginTop: '30px' }}
      />
      <div className="mt-3" style={{ maxHeight: '53vh', overflowY: "auto" }}>
        {mapLayers
          .filter((layer) => layer.name.toLowerCase().includes(searchTerm.toLowerCase()))
          .map((layer) => (
            <Button
              variant={selectedAreas.includes(layer.name) ? "dark" : "outline"}
              onClick={() => toggleAreaSelection(layer.name)}
              style={{
                width: '100%',
                border: '3px solid #303030',
                borderRadius: '20px',
                paddingLeft: '20px',
                paddingRight: '20px',
                paddingTop: '10px',
                paddingBottom: '10px',
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '16px',
                marginTop: '10px'
              }}
            >
              <Form.Check
                key={layer.id}
                type="checkbox"
                label={layer.name}
                checked={selectedAreas.includes(layer.name)}
                onChange={() => toggleAreaSelection(layer.name)}
                style={{ display: 'none' }} // Nasconde la checkbox
              />
              {layer.name}

              {layer.name !== 'Kiruna Map' && (
                <>
<div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
  {/* Bottone Edit */}
  <Button
    type="button"
    variant="outline-primary"
    onClick={() => handleEditClick(layer)} // Apre il modal per modificare il nome
    style={{
      padding: '4px 8px',
      color: "black",
      backgroundColor: "transparent",
      border: "none",
    }}
  >
    <Edit color={selectedAreas.includes(layer.name) ? "white" : "black"} size={18} />
  </Button>

  {/* Bottone Trash */}
  <Button
    type="button"
    variant="dark"
    onClick={() => deleteArea(layer.name)}
    style={{
      padding: "4px 8px",
      color: "black",
      backgroundColor: "transparent",
      border: "none",
    }}
  >
    <Trash2 color={selectedAreas.includes(layer.name) ? "white" : "black"} size={18} />
  </Button>
</div>


                </>
              )}
            </Button>
                        ))}
                </div>
                {/* Modal per modificare il nome dell'area */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>New Area name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group controlId="newAreaName">
            <Form.Label>New name</Form.Label>
            <Form.Control
              type="text"
              value={newAreaName}
              onChange={(e) => setNewAreaName(e.target.value)}
              placeholder="Inserisci il nuovo nome dell'area"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
           Cancel
          </Button>
          <Button variant="primary" onClick={handleEditSubmit}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
            </div>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={errorSeverity} sx={{ width: "40%" }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default DrawMap;
