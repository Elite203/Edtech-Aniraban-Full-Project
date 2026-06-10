
import React from 'react';
import { Newspaper } from 'lucide-react';

const BlogPage = () => {
  return (
    <section className="container mx-auto px-6 py-16 flex flex-col items-center justify-center text-center min-h-[calc(100vh-200px)]">
      <Newspaper className="w-24 h-24 text-indigo-500 mb-8" />
      <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">
        Our Blog is Coming Soon!
      </h1>
      <p className="text-lg text-muted-foreground mb-8 max-w-md">
        We're working hard to bring you insightful articles, tips, and strategies for exam preparation. Stay tuned!
      </p>
    </section>
  );
};

export default BlogPage;
