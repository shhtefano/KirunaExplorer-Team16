import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { MapContainer, TileLayer, Marker, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import API from "../services/API";
import { Button } from "react-bootstrap";

// Configura l'icona di default di Leaflet
const icon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png", // Icona blu per gli altri marker
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
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

const DocumentMap = ({ document_id }) => {
  const [center, setCenter] = useState([67.85572, 20.22513]);

  const [zoomLevel, setZoomLevel] = useState(7);
  const [coordinates, setCoordinates] = useState(null);
  const [areaName, setAreaName] = useState(null);
  const [mapType, setMapType] = useState("satellite"); // Tipo di mappa selezionato

  useEffect(() => {
    async function fetchData() {
      try {
        const document = await API.getDocumentPosition(document_id);

        if (document.coordinates && document.coordinates.length > 0) {
          if (document.area_name !== "Point-Based Documents") {
            // Calcolo del centro (opzionale, lo hai già)
            if (document.coordinates && document.coordinates.length > 0) {
              let polygonCoordinates = [];

              // Se è un array di array (multipoligono)
              if (Array.isArray(document.coordinates[0])) {
                polygonCoordinates = document.coordinates.map((polygon) =>
                  polygon.map((coord) => [coord.lat, coord.lng])
                );
              } else {
                // Se è un singolo array (poligono semplice)
                polygonCoordinates = [document.coordinates.map((coord) => [coord.lat, coord.lng])];
              }

              // Chiudi ogni poligono, se necessario
              polygonCoordinates = polygonCoordinates.map((polygon) => {
                if (
                  polygon.length > 0 &&
                  (polygon[0][0] !== polygon[polygon.length - 1][0] ||
                    polygon[0][1] !== polygon[polygon.length - 1][1])
                ) {
                  polygon.push(polygon[0]);
                }
                return polygon;
              });

              setCoordinates(polygonCoordinates);
              setAreaName(document.area_name);

              // Calcola il centro per centrare la mappa
              const allLatitudes = polygonCoordinates.flat().map((coord) => coord[0]);
              const allLongitudes = polygonCoordinates.flat().map((coord) => coord[1]);
              const avgLat = allLatitudes.reduce((a, b) => a + b, 0) / allLatitudes.length;
              const avgLng = allLongitudes.reduce((a, b) => a + b, 0) / allLongitudes.length;

              setCenter([avgLat, avgLng]);
            }

          } else if (document.area_name === "Point-Based Documents") {

            const coordinates = document.coordinates;

            // Controlla il formato delle coordinate
            const firstCoord = Array.isArray(coordinates[0]) ? coordinates[0][0] : coordinates[0];


            const lat = firstCoord?.lat;
            const lng = firstCoord?.lng;

            if (lat !== undefined && lng !== undefined) {
              setCenter([lat, lng]); // Imposta il centro della mappa
              setCoordinates([lat, lng]); // Imposta direttamente l'array [lat, lng]
              setAreaName(document.area_name);
            } else {
              console.error("Invalid coordinates in Point-Based Documents:", firstCoord);
            }

          } else if (document.area_name === "Custom Area") {
            // TODO: Gestisci le aree personalizzate
            return;
          } else {
            console.log("Error: Unknown area name");
          }
        }
      } catch (error) {
        console.error("Error fetching document position:", error);
      }
    }

    fetchData();
  }, [document_id]);

  return (
    <div>
      {/* Menu per cambiare tipo di mappa */}
      <div className="mb-3 d-flex justify-content-center">
        <Button
          type="button"
          variant="outline-dark"
          className={`btn ${mapType === "maptiler" ? "btn-dark" : "btn-outline-primary"} rounded-pill`}
          style={{ color: `${mapType === "maptiler" ? "white" : "black"}`, fontSize: '12px' }}
          onClick={() => setMapType("maptiler")}
        >
          MAPTILER
        </Button>
        <Button
          type="button"
          variant="outline-dark"

          className={`ml-3 btn ${mapType === "satellite" ? "btn-dark" : "btn-outline-primary"} rounded-pill`}
          style={{ color: `${mapType === "satellite" ? "white" : "black"}`, fontSize: '12px' }}
          onClick={() => setMapType("satellite")}
        >
          SATELLITE
        </Button>
        <Button
          type="button"
          variant="outline-dark"

          className={`ml-3 btn ${mapType === "dark" ? "btn-dark" : "btn-outline-primary"} rounded-pill`}
          style={{ color: `${mapType === "dark" ? "white" : "black"}`, fontSize: '12px' }}
          onClick={() => setMapType("dark")}
        >
          DARK
        </Button>
      </div>

      <MapContainer
        key={center} // Rerender quando il centro cambia
        center={center}
        zoom={zoomLevel}
        style={{ height: "500px", width: "100%" }}
      >
        {coordinates && coordinates.length > 0 && areaName === "Point-Based Documents" && (
  <Marker
    position={coordinates}
    icon={icon} // Usa l'icona corretta per il marker
  />
)}

{coordinates && coordinates.length > 0 && areaName === "Kiruna Map" &&
  coordinates.map((polygon, index) => (
    <Polygon key={index} positions={polygon} />
  ))}

{coordinates && coordinates.length > 0 && areaName !== "Kiruna Map" && areaName !== "Point-Based Documents" &&
  coordinates.map((polygon, index) => (
    <Polygon key={index} positions={polygon} />
  ))}
        <TileLayer
          url={tileLayers[mapType].url}
          attribution={tileLayers[mapType].attribution}
        />
      </MapContainer>
    </div>
  );
};

export default DocumentMap;
