import React from 'react';

const WatermarkComponent = ({ text }) => {
  if (!text) return null;

  return (
    <div className="!fixed inset-0 pointer-events-none z-[50] flex flex-wrap justify-center align-content-center opacity-[0.07] dark:opacity-[0.05] overflow-hidden">
      {Array.from({ length: 120 }).map((_, i) => (
        <div
          key={i}
          className="text-black dark:text-white font-bold text-xl rotate-[-30deg] m-8 whitespace-nowrap select-none"
        >
          {text}
        </div>
      ))}
    </div>
  );
};

export default WatermarkComponent;
