import React, { useState, useEffect } from "react";
import L, { latLng } from "leaflet";
import { MapContainer, TileLayer, FeatureGroup, Polygon } from "react-leaflet";
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

const DrawMap = () => {
  const [center] = useState({ lat: 67.85572, lng: 20.22513 });
  const [mapLayers, setMapLayers] = useState([]);

  const ZOOM_LEVEL = 15;

  
  const _onClick = (e) => {
    const { layerType, layer } = e;
    const { _leaflet_id } = layer;

    console.log(layerType, layer, _leaflet_id); 
    
   
    e.prevent.Default();


  };

  const _onCreate = (e) => {
    const { layerType, layer } = e;
    const { _leaflet_id } = layer;

    if (layerType === "polygon") {
      setMapLayers((layers) => [
        ...layers,
        { id: _leaflet_id, type: layerType, latlngs: layer.getLatLngs()[0] },
      ]);
      console.log('Polygon created.');
      console.log('Coordinates: ' + {...layer._latlngs});
      
    }else if(layerType === "marker"){
        setMapLayers((layers) => [
            ...layers,
            {id:_leaflet_id, type:layerType, latLngs: layer.latLng}
        ]);
        console.log('Marker created.');
        console.log('Coordinates: ' + layer + {...e});
    }
  };

  const _onEdited = (e) => {
    console.log('ciao', mapLayers);
    
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).forEach(({ _leaflet_id, editing }) => {
      setMapLayers((layers) =>
        layers.map((l) =>
          l.id === _leaflet_id ? { ...l, latlngs: editing.latlngs[0] } : l
        )
      );
    });
    
  };

  const _onDeleted = (e) => {
    const {
      layers: { _layers },
    } = e;

    Object.values(_layers).forEach(({ _leaflet_id }) => {
      setMapLayers((layers) => layers.filter((l) => l.id !== _leaflet_id));
    });
  };

  return (
    <div className="row">
      <div className="col text-center">
        <div className="col">
          <MapContainer
            center={center}
            zoom={ZOOM_LEVEL}
            style={{ height: "700px", width: "1400px" }}
          >
            <FeatureGroup>
              <EditControl
                position="topright"
                onCreated={_onCreate}
                onEdited={_onEdited}
                onDeleted={_onDeleted}
                onClick={_onClick}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: true,
                  polyline: false,
                }}
              />
              {/* Visualizza i poligoni già definiti */}
              {mapLayers.map((layer) =>
                layer.latlngs ? (
                  <Polygon key={layer.id} positions={layer.latlngs} />
                ) : null
              )}
            </FeatureGroup>
            <TileLayer url={osm.maptiler.url} attribution={osm.maptiler.attribution} />
          </MapContainer>
          {/* <pre className="text-left">{JSON.stringify(mapLayers, null, 2)}</pre> */}
        </div>
      </div>
    </div>
  );
};

export default DrawMap;
