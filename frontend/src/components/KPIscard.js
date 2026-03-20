import React from 'react';

const KPICard = ({ title, value, unit }) => {
  return (
    <div
      className="relative p-5 rounded-2xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
        boxShadow: '0 4px 16px rgba(27,94,32,0.25)',
      }}
    >
      <p className="text-green-200 text-[0.8rem] font-semibold mb-2 tracking-wider uppercase">
        {title}
      </p>
      <h3 className="text-white text-3xl font-extrabold flex items-baseline">
        {value}
        <span className="text-sm font-normal ml-1 text-green-300 lowercase">{unit}</span>
      </h3>
    </div>
  );
};

export default KPICard;