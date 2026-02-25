import React from 'react';

const KPICard = ({ title, value, unit }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm min-w-[200px] border border-slate-100 font-['Inter']">
      <p className="text-slate-500 text-[0.85rem] font-medium mb-2 tracking-wide uppercase">
        {title}
      </p>
      <h3 className="text-[#155DFC] text-3xl font-bold flex items-baseline">
        {value}
        <span className="text-sm font-normal ml-1 text-slate-400 lowercase">{unit}</span>
      </h3>
    </div>
  );
};

export default KPICard;