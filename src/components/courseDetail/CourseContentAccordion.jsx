
import React from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PlayCircle, FileText, CheckSquare } from "lucide-react";

const CourseContentAccordion = ({ curriculum }) => {
  const getIcon = (type) => {
    switch (type) {
      case "video": return <PlayCircle className="h-5 w-5 mr-2 text-primary" />;
      case "article": return <FileText className="h-5 w-5 mr-2 text-primary" />;
      case "quiz": return <CheckSquare className="h-5 w-5 mr-2 text-primary" />;
      default: return <PlayCircle className="h-5 w-5 mr-2 text-primary" />;
    }
  };

  return (
    <Accordion type="single" collapsible className="w-full">
      {curriculum.map((module, index) => (
        <AccordionItem value={`item-${index}`} key={index}>
          <AccordionTrigger className="hover:no-underline">
            <div className="flex justify-between items-center w-full">
              <span className="text-lg font-semibold">{module.title}</span>
              <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-3 pl-2">
              {module.lessons.map((lesson, lessonIndex) => (
                <li key={lessonIndex} className="flex items-center text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                  {getIcon(lesson.type || "video")}
                  <span>{typeof lesson === 'string' ? lesson : lesson.title}</span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
};

export default CourseContentAccordion;
