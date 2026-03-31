import React from 'react';

const LayerToggle = ({ layers, onToggle }) => {
  const toggleItems = [
    { id: 'priorityHigh', label: 'Critical Priority', color: 'bg-red-500' },
    { id: 'priorityMed', label: 'Medium Priority', color: 'bg-amber-500' },
    { id: 'priorityLow', label: 'Low Priority', color: 'bg-green-500' },
    { id: 'healthcare', label: 'Health Facilities', color: 'bg-blue-600' },
    { id: 'schools', label: 'Educational Sites', color: 'bg-slate-700' },
  ];

  return (
    <div className="absolute top-3 right-3 sm:top-6 sm:right-6 bg-white/90 backdrop-blur-sm p-3 sm:p-4 rounded-xl shadow-xl z-[1000] border border-slate-200 min-w-[170px] sm:min-w-[200px]">
      <h4 className="font-bold text-slate-800 text-[0.7rem] uppercase tracking-wider mb-3 border-b pb-2">Layer Filters</h4>
      <div className="space-y-3">
        {toggleItems.map((item) => (
          <div key={item.id} className="flex items-center justify-between group">
            <span className="text-[0.7rem] font-bold text-slate-600 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${item.color}`} />
              {item.label}
            </span>
            
            {/* The Switch Toggle */}
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={layers[item.id]} 
                onChange={() => onToggle(item.id)}
              />
              <div className="w-8 h-4 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#025864]"></div>
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerToggle;