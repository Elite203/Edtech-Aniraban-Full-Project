
import React from 'react';
import { BookOpen } from 'lucide-react';

const BooksStudyMaterialPage = () => {
  return (
    <section className="container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      <BookOpen className="w-24 h-24 text-indigo-500 mb-8" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Books & Study Materials - Coming Soon!
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        Discover recommended books and comprehensive study materials curated by our experts. This section is under development.
      </p>
      <img  
        alt="Stack of books illustration" 
        className="w-full max-w-sm h-auto"
       src="/img/home.webp" />
    </section>
  );
};

export default BooksStudyMaterialPage;
