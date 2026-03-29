import React from 'react';

const PrioritizationTable = ({ roads, onRowClick }) => {

  const handleExportCSV = () => {
    if (!roads || roads.length === 0) return;

    const headers = ['Rank', 'Segment ID', 'MCA Score', 'DDI Score', 'Health Facilities', 'Schools', 'Priority Level'];
    const rows = roads.map((road, idx) => [
      idx + 1,
      road.properties.segment_id,
      road.properties.current_mca_score?.toFixed(4),
      road.properties.latest_ddi_score?.toFixed(4),
      road.properties.health_facility_count,
      road.properties.school_count,
      road.properties.priority_level,
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'priority_rehabilitation_list.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
      {/* Table Header */}
      <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Priority Rehabilitation List</h3>
          <p className="text-[0.65rem] text-slate-400 font-medium">Ranked by Weighted Multi-Criteria Analysis (MCA)</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="text-[0.65rem] font-bold text-[#025864] bg-[#025864]/5 px-3 py-1.5 rounded-lg hover:bg-[#025864]/10 transition-colors"
        >
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
                className="hover:bg-[#025864]/[0.03] cursor-pointer transition-colors group"
                onClick={() => onRowClick(road.properties)}
              >
                <td className="px-6 py-4">
                  <span className={`font-black ${idx < 3 ? 'text-[#025864]' : 'text-slate-300'}`}>
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