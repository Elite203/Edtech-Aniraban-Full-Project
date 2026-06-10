import React from "react";

const Preloader = () => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <img
          src="/img/logo.webp"
          alt="Logo"
          className="w-20 h-20 animate-bounce"
        />
        <div className="w-24 h-1 bg-gray-300 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 animate-pulse w-1/2 rounded-full"></div>
        </div>
        <p className="text-sm text-gray-600">Loading ANIRBAN'S ACADEMY...</p>
      </div>
    </div>
  );
};

export default Preloader;
