
import React from 'react';
import { FileText } from 'lucide-react';

const FreePdfNotesPage = () => {
  return (
    <section className="container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      <FileText className="w-24 h-24 text-indigo-500 mb-8" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Free PDF Notes - Coming Soon!
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Access a library of curated PDF notes for quick revision and effective learning. We're compiling the best resources for you!
      </p>
    </section>
  );
};

export default FreePdfNotesPage;
