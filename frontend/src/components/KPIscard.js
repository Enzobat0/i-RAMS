import React from 'react';

const KPICard = ({ title, value, unit }) => {
  return (
    <div
      className="relative p-5 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #025864 0%, #03717f 100%)',
        boxShadow: '0 4px 16px rgba(2,88,100,0.25)',
      }}
    >
      <p className="text-teal-200 text-[0.8rem] font-semibold mb-2 tracking-wider uppercase">
        {title}
      </p>
      <h3 className="text-white text-3xl font-extrabold flex items-baseline">
        {value}
        <span className="text-sm font-normal ml-1 text-[#00D47E] lowercase">{unit}</span>
      </h3>
    </div>
  );
};

export default KPICard;