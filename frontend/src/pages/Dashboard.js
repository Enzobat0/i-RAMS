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
    // 1. Fetch District Summary (KPIs)
    axios.get('http://localhost:8000/api/dashboard-summary/')
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary error:", err));
    
    // 2. Fetch Road Network (GeoJSON)
    axios.get('/api/roads-geojson/')
      .then(res => setRoadData(res.data))
      .catch(err => console.error("GeoJSON error:", err));

    // 3. NEW: Fetch Infrastructure Points (Schools/Hospitals)
    axios.get('/api/infrastructure/')
      .then(res => setInfraData(res.data))
      .catch(err => console.error("Infrastructure fetch error:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 font-['Inter'] pb-10">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-center px-10 py-5 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-[#155DFC]">i-RAMS</h1>
        <div className="text-slate-500 font-medium">Bugesera District, Rwanda</div>
      </header>

      {/* 2. Top-Level KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 px-10 py-6">
        <KPICard title="Total Network" value={summary?.total_segments || "0"} unit="Segs" />
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