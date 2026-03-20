import React from 'react';

const PrioritizationTable = ({ roads, onRowClick }) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Priority Rehabilitation List</h3>
          <p className="text-[0.65rem] text-slate-400 font-medium">Ranked by Weighted Multi-Criteria Analysis (MCA)</p>
        </div>
        <button className="text-[0.65rem] font-bold text-[#1B5E20] bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 transition-colors">
          EXPORT CSV
        </button>
      </div>

      {/* Table Body */}
      <div className="overflow-y-auto flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10">
            <tr>
              <th className="px-6 py-3 font-semibold text-[0.7rem] uppercase">Rank</th>
              <th className="px-6 py-3 font-semibold text-[0.7rem] uppercase">Segment ID</th>
              <th className="px-6 py-3 font-semibold text-[0.7rem] uppercase text-center">MCA Score</th>
              <th className="px-6 py-3 font-semibold text-[0.7rem] uppercase text-center">DDI (Damage)</th>
              <th className="px-6 py-3 font-semibold text-[0.7rem] uppercase">Social Justification</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {roads.map((road, idx) => (
              <tr 
                key={road.id} 
                className="hover:bg-green-50/50 cursor-pointer transition-colors group"
                onClick={() => onRowClick(road.properties)}
              >
                <td className="px-6 py-4">
                  <span className={`font-black ${idx < 3 ? 'text-[#1B5E20]' : 'text-slate-300'}`}>
                    #{idx + 1}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <p className="font-mono text-[0.65rem] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded inline-block">
                    {road.properties.segment_id.slice(1, 9)}...
                  </p>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="bg-red-50 text-red-600 px-2 py-1 rounded-lg font-bold text-xs border border-red-100">
                    {road.properties.current_mca_score.toFixed(2)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-slate-500 font-semibold italic">
                  {road.properties.latest_ddi_score.toFixed(2)}
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <span className="text-[0.6rem] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                      🏥 {road.properties.health_facility_count}
                    </span>
                    <span className="text-[0.6rem] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">
                      🏫 {road.properties.school_count}
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PrioritizationTable;