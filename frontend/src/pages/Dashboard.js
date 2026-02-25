import React, { useState, useEffect } from 'react';
import KPICard from '../components/KPIscard'; 
import Map from '../components/Map';
import SidebarDetail from '../components/SideBarDetail';
import axios from 'axios';

const Dashboard = () => {
  const [summary, setSummary] = useState(null);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [roadData, setRoadData] = useState(null);

  useEffect(() => {
    // Fetch Summary Data
    axios.get('http://localhost:8000/api/dashboard-summary/')
      .then(res => setSummary(res.data))
      .catch(err => console.error("Summary error:", err));
    
    // Fetch GeoJSON Data
    axios.get('http://localhost:8000/api/roads-geojson/')
      .then(res => setRoadData(res.data))
      .catch(err => console.error("GeoJSON error:", err));
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-100 font-['Inter'] overflow-hidden">
      
      {/* 1. Header Section */}
      <header className="flex justify-between items-center px-10 py-5 bg-white border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-[#155DFC]">i-RAMS</h1>
        <div className="text-slate-500 font-medium">Bugesera District, Rwanda</div>
      </header>

      {/* 2. Top-Level KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5 px-10 py-6">
        <KPICard title="Total Network" value={summary?.total_segments || "0"} unit="Segs" />
        <KPICard title="Critical Vulnerability" value={summary?.vulnerability_pct || "0"} unit="%" />
        <KPICard title="Healthcare Access" value={summary?.healthcare_access_pct || "0"} unit="%" />
        <KPICard title="Damage Index (Avg)" value={summary?.avg_ddi || "0.0"} unit="DDI" />
      </div>

      {/* 3. Main Workspace (Map + Sidebar) */}
      <div className="flex flex-1 px-10 pb-6 gap-5 min-h-0">
        
        {/* Map Container */}
        <div className="flex-1 relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-200">
           <Map 
            roadData={roadData} 
            onSegmentClick={(properties) => {
                console.log("Segment Clicked:", properties);
                setSelectedSegment(properties);
            }} 
            />
        </div>

        {/* Sidebar */}
        <div className="w-[380px] h-full overflow-y-auto">
            <SidebarDetail segment={selectedSegment || {}} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;