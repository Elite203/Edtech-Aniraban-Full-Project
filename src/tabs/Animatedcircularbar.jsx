import React, { useState, useEffect } from 'react';

const CircularProgress = ({ percentage, color, label, customText, subValue }) => {
  const [count, setCount] = useState(0);
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  // Calculate dashOffset based on the current count state for perfect synchronization
  const currentDashOffset = circumference - (circumference * count) / 100;

  useEffect(() => {
    // Reset count if percentage is 0 or less
    if (!percentage || percentage <= 0) {
      setCount(0);
      return;
    }

    // Animate the number counter
    const duration = 2000; // Total duration of the animation in ms
    const intervalTime = Math.max(duration / percentage, 10); // Minimum interval of 10ms
    let currentCount = 0;

    const counter = setInterval(() => {
      currentCount += 1;
      setCount(currentCount);

      if (currentCount >= percentage) {
        clearInterval(counter);
        setCount(percentage);
      }
    }, intervalTime);

    return () => {
      clearInterval(counter);
    };
  }, [percentage]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative w-[180px] h-[180px] md:w-[200px] md:h-[200px] flex justify-center items-center">
        {/* SVG Container */}
        <svg className="absolute w-full h-full -rotate-90" viewBox="0 0 200 200">
          {/* Background Track Circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            className="fill-transparent stroke-gray-200 dark:stroke-[#1a1a1a]"
            strokeWidth="16"
          />
          {/* Animated Progress Circle */}
          <circle
            cx="100"
            cy="100"
            r="80"
            className="fill-transparent stroke-[16px] stroke-linecap-round transition-all duration-300 ease-out"
            style={{
              stroke: color,
              strokeDasharray: circumference,
              strokeDashoffset: currentDashOffset,
              filter: `drop-shadow(0 0 6px ${color})`
            }}
          />
        </svg>

        {/* Inner Dial */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] h-[120px] md:w-[140px] md:h-[140px] bg-white dark:bg-[#333] rounded-full border-[5px] border-gray-100 dark:border-[#4a4a4a] flex flex-col justify-center items-center shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.5),0_0_10px_rgba(0,0,0,0.1)] dark:shadow-[inset_5px_5px_10px_rgba(0,0,0,0.5),inset_-5px_-5px_10px_rgba(255,255,255,0.05),0_0_15px_rgba(0,0,0,0.6)]">
          <div
            className="text-[28px] md:text-[32px] font-bold leading-[1.1] flex items-center"
            style={{ color: color }}
          >
            {customText ? (
              <span className={customText.length > 5 ? "text-[20px] md:text-[24px]" : ""}>{customText}</span>
            ) : (
              <>
                {count}
                <span className="text-[14px] md:text-[18px] ml-[2px]">%</span>
              </>
            )}
          </div>
          <div className="text-[10px] md:text-[12px] font-semibold text-gray-500 dark:text-[#e0e0e0] tracking-[1px] mt-[2px]">
            {label}
          </div>
        </div>
      </div>

      {subValue && (
        <div
          className="px-3 py-1 rounded-full text-[14px] md:text-[16px] font-black border shadow-sm transition-all animate-in fade-in slide-in-from-bottom-2 duration-700"
          style={{
            backgroundColor: `${color}15`,
            borderColor: `${color}40`,
            color: color
          }}
        >
          {subValue}
        </div>
      )}
    </div>
  );
};

export default CircularProgress;
