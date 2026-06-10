import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent } from "@/components/ui/card";

const GovExamCard = ({ exam, index }) => {
  const navigate = useNavigate();
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
      whileHover={{ y: -8, scale: 1.05, boxShadow: "0px 10px 20px rgba(0,0,0,0.1)", rotateX: 5, rotateY: 5, cursor: 'pointer' }}
      onClick={() => navigate('/feature-details', { state: { exam } })}
      className="transform-gpu"
      style={{ perspective: '1000px' }}
    >
      <Card className="h-full overflow-hidden bg-card shadow-lg hover:shadow-xl transition-all duration-300 ease-out">
        <CardContent className="p-4 flex flex-col items-center justify-center text-center">
          <motion.img
            src={exam.logoUrl}
            alt={`${exam.name} logo`}
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain mb-3"
            whileHover={{ scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <p className="text-sm sm:text-base font-semibold text-card-foreground">{exam.name}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default GovExamCard;
