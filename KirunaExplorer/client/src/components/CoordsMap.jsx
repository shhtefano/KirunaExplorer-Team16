import React, { useState } from "react";
import L, { latLng } from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMapEvents  } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import { Button } from "react-bootstrap";
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


const CoordsMap = ({onSubmitCoordinates, setShowPopup}) => {
  const [center] = useState({ lat: 67.85572, lng: 20.22513 });
  const [mapLayers, setMapLayers] = useState([]);
  const [mapType, setMapType] = useState("satellite"); // Tipo di mappa selezionato

  const ZOOM_LEVEL = 13;

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        console.log(lat, lng);
        
        // Imposta le coordinate nei campi del form
        onSubmitCoordinates(lat, lng);

        // Chiudi il popup
        // setShowPopup(false);
      },
    });
    return null;
  };

  return (
    <div className="row d-flex justify-content-center">
            {/* Menu per cambiare tipo di mappa */}
            <div className="mb-3 ">
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
      <div className="col text-center d-flex justify-content-center m-0">
        <div className="col  text-center d-flex justify-content-center m-0">
          <MapContainer
            center={center}
            zoom={ZOOM_LEVEL}
            style={{ height: "50em", width: "75em", margin:'0'}}
          >
                        <MapClickHandler /> {/* Questo gestisce i click sulla mappa */}
            <FeatureGroup>
              {/* <EditControl
                position="topright"
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: true,
                  polyline: false,
                }}
              /> */}
              {mapLayers.map((layer) =>
                layer.latlngs ? (
                  <Polygon key={layer.id} positions={layer.latlngs} />
                ) : null
              )}
            </FeatureGroup>
            <TileLayer
          url={tileLayers[mapType].url}
          attribution={tileLayers[mapType].attribution}
        />          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CoordsMap;
