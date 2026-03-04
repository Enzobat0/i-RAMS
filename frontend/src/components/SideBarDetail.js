import React from 'react';

const SidebarDetail = ({ segment, onClose }) => {
  // Logic for Priority Badge colors
  const getPriorityBadge = (level) => {
    switch (level) {
      case 1:
        return { label: "CRITICAL", color: "bg-red-500", text: "text-white" };
      case 2:
        return { label: "Medium", color: "bg-amber-500", text: "text-white" };
      case 3:
        return { label: "Low", color: "bg-green-500", text: "text-white" };
      default:
        return { label: "UNSET", color: "bg-slate-200", text: "text-slate-500" };
    }
  };

  const badge = getPriorityBadge(segment.priority_level);
  
  return (
    <div className="relative flex flex-col h-full bg-white p-6 font-['Inter'] shadow-lg border-l border-slate-200 rounded-2xl">
      
      <div className="flex justify-between items-start mb-4">
        
        <h2 className="text-slate-800 text-lg font-bold">Asset Resume</h2>
        <span className={`${badge.color} ${badge.text} text-[0.6rem] font-black px-2 py-1 rounded-md tracking-tighter`}>
          {badge.label}
        </span>
        <button 
        onClick={onClose}
        className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      </div>
      
      <div className="h-px bg-slate-100 w-full mb-6" />
      
      {/* Identity Section */}
      <div className="mb-6">
        <p className="text-slate-400 text-[0.7rem] font-semibold tracking-wider uppercase mb-1">
          SEGMENT ID
        </p>
        <p className="text-slate-800 font-mono text-xs leading-none mb-2">
          {segment.segment_id || "N/A"}
        </p>
        <div className="flex gap-2">
          <div className="px-2 py-1 bg-slate-100 rounded text-slate-600 text-[0.6rem] font-bold uppercase">
            {segment.road_type || "Unknown"}
          </div>
          <div className="px-2 py-1 bg-blue-50 rounded text-[#155DFC] text-[0.6rem] font-bold uppercase">
            {segment.road_class || "Class Unset"}
          </div>
        </div>
      </div>

      {/* MCA & Condition Section */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
          <p className="text-slate-500 text-[0.6rem] font-bold uppercase">MCA Score</p>
          <p className="text-white text-2xl font-black">{segment.current_mca_score || "0.0"}</p>
        </div>
        <div className="bg-white p-3 rounded-xl border border-slate-200">
          <p className="text-slate-400 text-[0.6rem] font-bold uppercase">DDI Score</p>
          <p className="text-slate-800 text-2xl font-black">{segment.latest_ddi_score || "0.0"}</p>
        </div>
      </div>

      {/* Social Impact Section (Counts instead of Booleans) */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
        <h4 className="text-[#155DFC] text-[0.7rem] font-bold uppercase tracking-wide mb-4">
          Access Metrics
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Healthcare Facilities</span>
            <span className="font-bold text-slate-800">{segment.health_facility_count || 0}</span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Educational Facilities</span>
            <span className="font-bold text-slate-800">{segment.school_count || 0}</span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600 font-medium">Sole Access Road</span>
            <span className={`font-bold ${segment.is_only_access ? 'text-[#155DFC]' : 'text-slate-400'}`}>
              {segment.is_only_access ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Population Impact */}
      <div className="mt-auto pt-6 border-t border-slate-100">
        <h4 className="text-[#155DFC] text-[0.7rem] font-bold uppercase tracking-wide mb-1">
          Regional Impact
        </h4>
        <p className="text-slate-400 text-[0.65rem] mb-2 font-medium">Estimated population within 2km catchment</p>
        <p className="text-3xl font-black text-slate-900 tracking-tight">
          {segment.pop_within_2km?.toLocaleString() || "0"}
        </p>
      </div>
    </div>
  );
};

export default SidebarDetail;