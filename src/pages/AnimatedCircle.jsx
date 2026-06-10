import React, { useEffect, useRef } from "react";

const AnimatedCircle = ({ title, value, total = 100, isPercent = false, color = "#0EA5E9" }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const size = 96;
    canvas.width = size;
    canvas.height = size;

    const r = 40;
    let current = 0;
    const target = Math.min(100, isPercent ? value : (value / total) * 100);
    const center = size / 2;

    const animate = () => {
      ctx.clearRect(0, 0, size, size);

      // Background circle
      ctx.beginPath();
      ctx.arc(center, center, r, 0, 2 * Math.PI);
      ctx.strokeStyle = document.documentElement.classList.contains('dark') 
        ? "#374151" 
        : "#E5E7EB";
      ctx.lineWidth = 8;
      ctx.stroke();

      // Progress arc
      const angle = (current / 100) * 2 * Math.PI;
      ctx.beginPath();
      ctx.arc(center, center, r, -Math.PI / 2, angle - Math.PI / 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 8;
      ctx.stroke();

      // Text
      ctx.fillStyle = document.documentElement.classList.contains('dark') 
        ? "#F3F4F6" 
        : "#111827";
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const displayValue = isPercent ? `${Math.round(current)}%` : `${value}/${total}`;
      ctx.fillText(displayValue, center, center);

      if (current < target) {
        current += 1;
        requestAnimationFrame(animate);
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animate);
    };
  }, [value, total, isPercent, color]);

  return (
    <div className="flex flex-col items-center">
      <canvas ref={canvasRef} className="w-24 h-24" />
      <p className="mt-2 font-semibold dark:text-white">{title}</p>
    </div>
  );
};

export default AnimatedCircle;
