
import React from 'react';
import { DownloadCloud } from 'lucide-react';

const DownloadsPage = () => {
  return (
    <section className="container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      <DownloadCloud className="w-24 h-24 text-indigo-500 mb-8" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Downloads Section - Coming Soon!
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We are preparing a collection of free study materials, previous year papers, and other useful resources. Check back soon!
      </p>
      <img  
      loading="lazy"
        alt="Download cloud illustration" 
        className="w-full max-w-sm h-auto"
       src="/img/d.webp" />
    </section>
  );
};

export default DownloadsPage;
