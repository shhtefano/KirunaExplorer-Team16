import React, { useState, useEffect } from "react";
import L, { latLng } from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Polygon, useMapEvents  } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import osm from "./osm-providers";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

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

const CoordsMap = ({onSubmitCoordinates, setShowPopup}) => {
  const [center] = useState({ lat: 67.85572, lng: 20.22513 });
  const [mapLayers, setMapLayers] = useState([]);

  const ZOOM_LEVEL = 15;

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        console.log(lat, lng);
        
        // Imposta le coordinate nei campi del form
        onSubmitCoordinates(lat, lng);

        // Chiudi il popup
        setShowPopup(false);
      },
    });
    return null;
  };

  return (
    <div className="row">
      <div className="col text-center">
        <div className="col">
          <MapContainer
            center={center}
            zoom={ZOOM_LEVEL}
            style={{ height: "500px", width: "1000px" }}
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
            <TileLayer url={osm.maptiler.url} attribution={osm.maptiler.attribution} />
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default CoordsMap;
