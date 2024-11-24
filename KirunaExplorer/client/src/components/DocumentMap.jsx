import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { MapContainer, TileLayer, Marker, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import API from "../services/API";
import { Button } from "react-bootstrap";

// Configura l'icona di default di Leaflet
const icon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", // Icona blu per gli altri marker
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const areas = [
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

  const [zoomLevel, setZoomLevel] = useState(12);
  const [coordinates, setCoordinates] = useState([]);
  const [areaName, setAreaName] = useState(null);
  const [mapType, setMapType] = useState("satellite"); // Tipo di mappa selezionato

  useEffect(() => {
    async function fetchData() {
      try {
        const document = await API.getDocumentPosition(document_id);

        if (document && document.coordinates && document.coordinates.length > 0) {
          if (document.area_name === "Whole Area") {
            const latitudes = document.coordinates.map((coord) => coord.lat);
            const longitudes = document.coordinates.map((coord) => coord.lng);
            const avgLat = latitudes.reduce((a, b) => a + b, 0) / latitudes.length;
            const avgLng = longitudes.reduce((a, b) => a + b, 0) / longitudes.length;
            setCenter([67.85572, 20.22513]);
            // setCenter([avgLat, avgLng]);
            setCoordinates(areas[0].latlngs);
            // setCoordinates(document.coordinates);
            setAreaName(document.area_name);
          } else if (document.area_name === "Point-Based Documents") {
            setCenter([document.coordinates[0].lat, document.coordinates[0].lng]);
            setCoordinates([document.coordinates[0].lat, document.coordinates[0].lng]);
            setAreaName(document.area_name);
          } else if (document.area_name === "Custom Area"){
            //TODO
            return;
          } else {
            console.log("error");
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
        {areaName === "Point-Based Documents" && coordinates.length > 0 && (
          <Marker
            position={coordinates}
            icon={icon} // Usa l'icona corretta per il marker
          />
        )}

        {(areaName === "Whole Area" || areaName === "Custom Area") &&
          coordinates.length > 0 && <Polygon positions={coordinates} />}
        <TileLayer
          url={tileLayers[mapType].url}
          attribution={tileLayers[mapType].attribution}
        />
      </MapContainer>
    </div>
  );
};

export default DocumentMap;
