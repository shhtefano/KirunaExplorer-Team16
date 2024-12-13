import React, { useEffect, useState } from "react";
import L from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "react-bootstrap";
import * as turf from "@turf/turf"; // Importa Turf.js per operazioni geometriche
import API from "../services/API";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
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

const CoordsMap = ({ onSubmitCoordinates }) => {
  const [center] = useState({ lat: 67.85572, lng: 20.22513 });
  const [mapType, setMapType] = useState("satellite"); // Tipo di mappa selezionato
  const [areaCoordinates, setAreaCoordinates] = useState(null); // Stato per i multipoligoni
  const [toast, setToast] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseToast = () => {
    setToast((prev) => ({ ...prev, open: false }));
  };

  const ZOOM_LEVEL = 8;

  useEffect(() => {
    const fetchAreaCoordinates = async () => {
      try {
        const area = await API.getAreaCoordinates(1);
        console.log("Area data:", area);
        if (Array.isArray(area)) {
          // Assicurati che area sia un array          
          setAreaCoordinates(area);
        } else {
          console.warn("Formato non atteso per l'area:", area);
        }
      } catch (error) {
        console.error("Errore durante il fetch delle coordinate:", error);
      }
    };

    fetchAreaCoordinates();
  }, []);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;

        // Verifica se le coordinate sono all'interno dell'area
        if (areaCoordinates) {
          const point = turf.point([lng, lat]);
          const isInside = areaCoordinates.some((polygon) => {
            // Converte l'array di punti lat/lng in un array di coordinate compatibili con Turf.js
            const turfPolygon = turf.polygon([
              polygon.map((point) => [point.lng, point.lat]) // Nota: ordine lng, lat
            ]);
            return turf.booleanPointInPolygon(point, turfPolygon);
          });

          if (isInside) {
            onSubmitCoordinates(lat, lng); // Coordinate valide
          } else {
            setToast({
              open: true,
              message: 'Coordinates are outside Kiruna area',
              severity: "error",
            });
          }
        }
      },
    });
    return null;
  };

  return (
    <div className="row d-flex justify-content-center">
      {/* Menu per cambiare tipo di mappa */}
      <div className="mb-3">
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
      <div className="col text-center d-flex justify-content-center m-0">
        <div className="col text-center d-flex justify-content-center m-0">
          <MapContainer center={center} zoom={ZOOM_LEVEL} style={{ height: "50em", width: "75em", margin: "0" }}>
            <MapClickHandler /> {/* Questo gestisce i click sulla mappa */}
            <FeatureGroup>
              {areaCoordinates &&
                areaCoordinates.map((polygon, index) => (
                  <Polygon
                    key={`polygon-${index}`}
                    positions={polygon.map((point) => [point.lat, point.lng])} // Estrai lat e lng
                    pathOptions={{ color: "white" }}
                  />
                ))}
            </FeatureGroup>
            <TileLayer url={tileLayers[mapType].url} attribution={tileLayers[mapType].attribution} />
          </MapContainer>
        </div>
      </div>

      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
        onClose={handleCloseToast}
        anchorOrigin={{ vertical: "bottom", horizontal: "center", textAlign: "center" }}
      >
        <Alert
          onClose={handleCloseToast}
          severity={toast.severity}
          sx={{ width: "40%", textAlign: "center" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default CoordsMap;
