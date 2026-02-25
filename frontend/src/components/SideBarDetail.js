import React from 'react';

const SidebarDetail = ({ segment }) => {

  return (
    <div className="flex flex-col h-full bg-white p-6 font-['Inter']">
      <h2 className="text-slate-800 text-lg font-bold mb-4">Segment Details</h2>
      <div className="h-px bg-slate-100 w-full mb-6" />
      
      {/* Identity Section */}
      <div className="mb-6">
        <p className="text-slate-400 text-[0.7rem] font-semibold tracking-wider uppercase mb-1">
          SEGMENT ID
        </p>
        <p className="text-slate-800 font-bold text-xl leading-none mb-2">
          {segment.segment_id || "RW-BUG-004"}
        </p>
        <div className="inline-block px-2 py-1 bg-slate-100 rounded text-slate-600 text-xs">
          Type: {segment.road_type || "Unpaved"}
        </div>
      </div>

      {/* Social Impact Section */}
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
        <h4 className="text-[#155DFC] text-[0.8rem] font-bold uppercase tracking-wide mb-4">
          Access Indicators
        </h4>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Hospital Access</span>
            <span className={`font-bold ${segment.has_hospital ? 'text-green-600' : 'text-red-600'}`}>
              {segment.has_hospital ? 'Yes' : 'No'}
            </span>
          </div>
          
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">School Access</span>
            <span className={`font-bold ${segment.has_school ? 'text-green-600' : 'text-red-600'}`}>
              {segment.has_school ? 'Yes' : 'No'}
            </span>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-600">Sole Access Road</span>
            <span className={`font-bold ${segment.is_only_access ? 'text-[#155DFC]' : 'text-slate-400'}`}>
              {segment.is_only_access ? 'Yes' : 'No'}
            </span>
          </div>
        </div>
      </div>

      {/* Population Impact */}
      <div className="mt-auto pt-6 border-t border-slate-50">
        <h4 className="text-[#155DFC] text-[0.8rem] font-bold uppercase tracking-wide mb-1">
          Population Impact
        </h4>
        <p className="text-slate-400 text-xs mb-2">Total residents within 2km</p>
        <p className="text-3xl font-black text-slate-800 tracking-tight">
          {segment.pop_within_2km?.toLocaleString() || "890"}
        </p>
      </div>
    </div>
  );
};

export default SidebarDetail;