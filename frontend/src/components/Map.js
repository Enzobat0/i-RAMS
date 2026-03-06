import React from 'react';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const healthIcon = L.divIcon({
  html: `<div style="font-size: 15px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">🏥</div>`,
  className: 'dummy-class', 
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});


const schoolIcon = L.divIcon({
  html: `<div style="font-size: 15px; filter: drop-shadow(0 2px 2px rgba(0,0,0,0.3));">🏫</div>`,
  className: 'dummy-class',
  iconSize: [25, 25],
  iconAnchor: [12, 12],
});

const Map = ({ roadData, infraData, layers, onSegmentClick }) => {
  const filteredInfra = infraData ? {
    ...infraData,
    features: infraData.features.filter(f => {
      if (f.properties.point_type === 'healthcare' && !layers.healthcare) return false;
      if (f.properties.point_type === 'school' && !layers.schools) return false;
      return true;
    })
  } : null;

  const filteredRoads = roadData ? {
    ...roadData,
    features: roadData.features.filter(f => {
      const p = parseInt(f.properties.priority_level);
      if (p === 1 && !layers.priorityHigh) return false;
      if (p === 2 && !layers.priorityMed) return false;
      if (p === 3 && !layers.priorityLow) return false;
      return true;
    })
  } : null;
  
  const roadStyle = (feature) => {
    const priority = parseInt(feature.properties.priority_level);
    let color = "#94a3b8"; 
    if (priority === 1) color = "#ef4444"; 
    else if (priority === 2) color = "#f59e0b"; 
    else if (priority === 3) color = "#22c55e"; 
    return {
      color: color,
      weight: priority === 1 ? 6 : 4,
      opacity: 0.8,
    };
  };

  return (
    <div className="h-full w-full relative">
      <MapContainer center={[-2.15, 30.1]} zoom={11} className="h-full w-full rounded-2xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* 1. Road Network Layer (Conditional) */}
        {filteredRoads && (
          <GeoJSON 
            key={`roads-filter-${layers.priorityHigh}-${layers.priorityMed}-${layers.priorityLow}`} 
            data={filteredRoads} 
            style={roadStyle}
            onEachFeature={(feature, layer) => {
              layer.on('click', (e) => {
                L.DomEvent.stopPropagation(e); 
                onSegmentClick(feature.properties);
              });
            }}
          />
        )}

        {/* 2. Infrastructure Layer (Filtered) */}
        {filteredInfra && (
          <GeoJSON 
            key={`infra-${filteredInfra.features?.length}-${layers.healthcare}-${layers.schools}`}
            data={filteredInfra}
            pointToLayer={(feature, latlng) => {
              const icon = feature.properties.point_type === 'healthcare' ? healthIcon : schoolIcon;
              return L.marker(latlng, { icon: icon });
            }}
            onEachFeature={(feature, layer) => {
              layer.bindPopup(`<strong>${feature.properties.name}</strong>`);
            }}
          />
        )}
      </MapContainer>

      {/* 5. The Map Legend */}
      <div className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-xl z-[1000] border border-slate-200 min-w-[180px]">
        <h4 className="font-bold text-slate-800 text-sm mb-3 border-b pb-2">Map Legend</h4>
        <div className="space-y-2 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-[#ef4444] rounded-full"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-[#f59e0b] rounded-full"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-[#22c55e] rounded-full"></div>
            <span>Low Priority</span>
          </div>
          <div className="pt-2 border-t mt-2 space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-base">🏥</span>
              <span>Healthcare Facility</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-base">🏫</span>
              <span>Educational Facility</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Map;