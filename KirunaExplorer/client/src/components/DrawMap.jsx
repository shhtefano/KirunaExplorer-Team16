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

    useEffect(() => {
        const fetchMapLayers = async () => {
            try {
                const areas = await API.getGeoArea();
                const filteredAreas = areas.filter(area => area.name !== 'Point-Based Documents');
    
                setMapLayers(filteredAreas);
                setFilteredLayers(filteredAreas); // Inizialmente tutte le aree sono visualizzate
    
                // Seleziona di default l'area chiamata "Kiruna Map"
                const defaultSelected = filteredAreas.find(area => area.name === "Kiruna Map");
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
        <div className="row" style={{ height: "90vh", width: "100%", maxHeight: "90vh" }}>
                         {/* Menu per cambiare tipo di mappa */}

            {/* Colonna sinistra: mappa */}
            <div className="col-md-10 text-center">
                         <div className="mb-3 text-center">
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
                <MapContainer center={center} zoom={7} style={{ height: "100%", width: "100%", maxHeight: "80vh" }}>
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
                            edit={{ edit: false,
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
                                            <Popup>{layer.name}</Popup>
                                        </Polygon>
                                    )}
                                    {/* Visualizza i marker quando in modalità 'markers' */}
                                    {selectedAreas.length > 0 && selectedAreas.includes(layer.name) && viewMode === 'markers' && (
                                        <Marker
                                        
                                            position={L.polygon(layer.latlngs).getBounds().getCenter()}
                                            icon={L.icon({ iconUrl: layer.name === "Kiruna Map" ? "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png":"https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.3.1/images/marker-icon.png" })}
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
                                            <Popup>{layer.name}</Popup>
                                        </Marker>
                                    )}
                                    {/* Mostra il poligono quando un marker è selezionato */}
                                    {selectedLayer === layer.id && viewMode === 'markers' && (
                                        <Polygon positions={layer.latlngs}  pathOptions={{
                                            color: layer.name === "Kiruna Map" ? "white" : "blue", // Usa rosso per "Kiruna Map", altrimenti blu
                                            weight: 2,
                                            opacity: 1,
                                        }}>
                                            <Popup>{layer.name}</Popup>
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
                </MapContainer>

                {/* Modal per inserire il nome dell'area */}
                <Modal show={showModal} onHide={() => setShowModal(false)}>
                    <Modal.Header closeButton>
                        <Modal.Title>Insert area name</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form>
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
                        <Button type="button" variant="secondary" onClick={() => setShowModal(false)}>
                            Delete
                        </Button>
                        <Button type="button" variant="primary" onClick={saveArea}>
                            Save
                        </Button>
                    </Modal.Footer>
                </Modal>

   
            </div>

            {/* Colonna destra: lista delle aree */}
            <div className="col-md-2 bg-light p-3" style={{ height: "70vh"}}>
                <div className="d-flex justify-content-center mb-4">
                    <Button type="button" variant="dark" onClick={viewMode === 'polygons' ? () => setViewMode('markers') : () => setViewMode('polygons')}>
                        Switch View Mode: {viewMode === 'polygons' ? 'Markers' : 'Polygons'}
                    </Button>

                </div>
                {/* <h5>Select areas</h5> */}
                <Form.Control
                    type="text"
                    placeholder="Search areas by name"
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
                <Form.Check
                    className="mt-3"
                    type="checkbox"
                    label="Select all"
                    checked={selectedAreas.length === mapLayers.length}
                    onChange={toggleSelectAll}
                />
                <div className="mt-3" style={{ maxHeight: "80%", overflowY: "scroll" }}>
                    {mapLayers
                        .filter((layer) => layer.name.toLowerCase().includes(searchTerm.toLowerCase()))
                        .map((layer) => (
                            <div style={{ display: 'flex' }}>
                                <Form.Check
                                    key={layer.id}
                                    type="checkbox"
                                    label={layer.name}
                                    checked={selectedAreas.includes(layer.name)}
                                    onChange={() => toggleAreaSelection(layer.name)}
                                />
                                <Button
                                    type="button"
                                    variant="dark"
                                    onClick={() => deleteArea(layer.name)}
                                    style={{
                                        fontSize: "12px", // Per renderlo più piccolo
                                        padding: "4px 8px", // Regola il padding per adattarlo
                                        color: "red", // Scritta rossa
                                        backgroundColor: "transparent", // Sfondo trasparente
                                        border: "none", // Rimuovi il bordo
                                    }}
                                >
                                    X
                                </Button>
                            </div>
                        ))}
                </div>
            </div>

            <Snackbar
                open={openSnackbar}
                autoHideDuration={2000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert onClose={handleCloseSnackbar} severity={errorSeverity} sx={{ width: "100%" }}>
                    {snackbarMsg}
                </Alert>
            </Snackbar>
        </div>
    );
};

export default DrawMap;
