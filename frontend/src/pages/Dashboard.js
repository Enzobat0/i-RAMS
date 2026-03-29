import React, { useState, useEffect } from 'react';
import KPICard from '../components/KPIscard'; 
import Map from '../components/Map';
import SidebarDetail from '../components/SideBarDetail';
import PrioritizationTable from '../components/prioritizationTable';
import LayerToggle from '../components/LayerToggle';
import axios from 'axios';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [roadData, setRoadData] = useState(null);
  const [infraData, setInfraData] = useState(null); 
  const rankedRoads = roadData?.features
  ? [...roadData.features]
      .sort((a, b) => b.properties.current_mca_score - a.properties.current_mca_score)
      .slice(0, 15) 
  : [];
  const [layers, setLayers] = useState({
    priorityHigh: true,
    priorityMed: true,
    priorityLow: true,
    healthcare: true,
    schools: true,
});

  const toggleLayer = (layerName) => {
  setLayers(prev => ({ ...prev, [layerName]: !prev[layerName] }));
  };


  useEffect(() => {
  const API_URL = process.env.REACT_APP_API_URL || '';
  
  // 1. Fetch District Summary (KPIs)
  axios.get(`${API_URL}/api/dashboard-summary/`)
    .then(res => setSummary(res.data))
    .catch(err => console.error("Summary error:", err));
  
  // 2. Fetch Road Network (GeoJSON)
  axios.get(`${API_URL}/api/roads-geojson/`)
    .then(res => setRoadData(res.data))
    .catch(err => console.error("GeoJSON error:", err));

  // 3. Fetch Infrastructure Points
  axios.get(`${API_URL}/api/infrastructure/`)
    .then(res => setInfraData(res.data))
    .catch(err => console.error("Infrastructure fetch error:", err));
}, []);

  return (
    <div className="flex flex-col min-h-screen font-sans pb-10" style={{ background: 'linear-gradient(135deg, #f0f4f1 0%, #e8f0ea 100%)' }}>
      
      {/* 1. Page Title Bar — slim, no logo (Sidebar owns branding) */}
      <header className="flex justify-between items-center px-10 py-5 bg-white border-b border-slate-200">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800">Dashboard</h2>
          <p className="text-xs text-slate-400 font-medium mt-0.5">Bugesera District — Road Asset Overview</p>
        </div>
        <div className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
          Bugesera District, Rwanda
        </div>
      </header>

      {/* 2. Top-Level KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-10 py-6">
        <KPICard title="Total Network" value={summary?.total_segments || "0"} unit="Segments" />
        <KPICard title="Critical Vulnerability" value={summary?.vulnerability_pct || "0"} unit="%" />
        <KPICard title="Healthcare Access" value={summary?.healthcare_access_pct || "0"} unit="%" />
        <KPICard title="Damage Index (Avg)" value={summary?.avg_ddi || "0.0"} unit="DDI" />
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 px-10 pb-6 gap-6 min-h-0">
        
        <div className="flex-1 flex flex-col gap-10">
          {/* Map takes the top half */}
          <div className="relative h-[600px] rounded-3xl overflow-hidden border border-slate-200 shadow-lg bg-white">
              <LayerToggle layers={layers} onToggle={toggleLayer} />
              <Map 
              roadData={roadData} 
              infraData={infraData} 
              layers={layers}
              onToggleLayer={toggleLayer}
              onSegmentClick={setSelectedSegment} 
            />
          </div>

          {/* Table takes the bottom half */}
          <div className="flex-[1.3] min-h-[220px]">
              <PrioritizationTable roads={rankedRoads} onRowClick={setSelectedSegment} />
          </div>
        </div>

        {/* Sidebar remains on the right */}
        {selectedSegment && (
          <div className="w-[380px] h-full">
              <SidebarDetail segment={selectedSegment} onClose={() => setSelectedSegment(null)} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;