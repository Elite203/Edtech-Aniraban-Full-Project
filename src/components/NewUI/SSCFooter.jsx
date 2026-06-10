import React from 'react';

const SSCFooter = () => {
  return (
    <footer className="footer bg-[#0047ab] text-white text-center py-2 text-xs md:text-sm font-bold mt-auto flex-shrink-0 relative z-10">
      © <span style={{ color: 'white', fontWeight: 'bold' }}>COPYRIGHT</span> {new Date().getFullYear()} <span style={{fontWeight: 'bold' }}>{("ANIRBAN'S ACADEMY").replace("ANIRBAN's", "ANIRBAN'S")}</span>. All rights reserved.
    </footer>
  );
};

export default SSCFooter;
