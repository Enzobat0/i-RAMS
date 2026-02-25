import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const Map = ({ roadData, onSegmentClick }) => {
  const brandColor = "#155DFC";

  const roadStyle = (feature) => ({
    color: brandColor,
    weight: 4, 
    opacity: 0.8,
  });

  return (
    <div className="h-full w-full rounded-2xl overflow-hidden border border-slate-200">
      <MapContainer 
        center={[-2.15, 30.1]} 
        zoom={11} 
        scrollWheelZoom={true}
        className="h-full w-full" 
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {roadData && (
          <GeoJSON 
            key={roadData.features?.length || 'loading'} 
            data={roadData} 
            style={roadStyle}
            onEachFeature={(feature, layer) => {
              layer.on({
                click: (e) => {
                  L.DomEvent.stopPropagation(e); 
                  onSegmentClick(feature.properties);
                },
                mouseover: (e) => {
                  const el = e.target;
                  el.setStyle({ weight: 6, opacity: 1 });
                },
                mouseout: (e) => {
                  const el = e.target;
                  el.setStyle(roadStyle(feature));
                }
              });
              layer.bindTooltip(`ID: ${feature.properties.segment_id}`, { sticky: true });
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default Map;