
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Keyboard, Clock, Type } from 'lucide-react';
import { motion } from "framer-motion";

const timeOptions = [
  { value: 1, label: '1 Minute' },
  { value: 5, label: '5 Minutes' },
  { value: 7, label: '7 Minutes' },
  { value: 10, label: '10 Minutes' },
  { value: 15, label: '15 Minutes' },
  { value: 20, label: '20 Minutes' },
];

const wordOptions = [
  { value: 100, label: '100 Words' },
  { value: 600, label: '600 Words' },
  { value: 840, label: '840 Words' },
  { value: 1000, label: '1000 Words' },
  { value: 1500, label: '1500 Words' },
  { value: 2000, label: '2000 Words' },
];

const TypingTestSetupPage = () => {
  const [selectedTime, setSelectedTime] = useState(timeOptions[0].value);
  const [selectedWords, setSelectedWords] = useState(wordOptions[0].value);
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate(`/typing-test?time=${selectedTime}&words=${selectedWords}`);
  };
  
  const keyboardImageUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/b1878616-b8fa-4aac-ab20-1a7de0175491/e4d4f6240140c75e4b71c08c52e26e8b.png";


  return (
    <div className="container mx-auto px-6 py-12 min-h-[calc(100vh-200px)] flex flex-col items-center">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-card p-8 rounded-xl shadow-2xl w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <Keyboard className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-2">Stenographer Typing Test</h1>
          <p className="text-muted-foreground">
            Practice your typing speed and accuracy. Configure your test below.
          </p>
        </div>

        <div className="mb-6">
          <p className="text-xl font-semibold text-foreground mb-3 text-center">How to Place Your Hands</p>
          <div className="bg-muted p-4 rounded-lg flex justify-center">
            <img 
            loading="lazy"  
              alt="QWERTY keyboard hand placement guide" 
              className="max-w-sm w-full h-auto rounded"
             src="/img/key.webp" />
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Proper hand placement is key to improving typing speed and accuracy. Rest your fingers on the home row (ASDF JKL;).
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <Label htmlFor="test-time" className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Clock className="w-4 h-4 mr-2 text-primary" />
              Test Duration
            </Label>
            <Select value={selectedTime.toString()} onValueChange={(value) => setSelectedTime(parseInt(value))}>
              <SelectTrigger id="test-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                {timeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="paragraph-words" className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Type className="w-4 h-4 mr-2 text-primary" />
              Paragraph Length
            </Label>
            <Select value={selectedWords.toString()} onValueChange={(value) => setSelectedWords(parseInt(value))}>
              <SelectTrigger id="paragraph-words">
                <SelectValue placeholder="Select word count" />
              </SelectTrigger>
              <SelectContent>
                {wordOptions.map(option => (
                  <SelectItem key={option.value} value={option.value.toString()}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleStartTest}
          size="lg"
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg font-semibold py-3 transition-transform duration-150 ease-in-out hover:scale-105"
        >
          Start Test Now
        </Button>
      </motion.div>
    </div>
  );
};

export default TypingTestSetupPage;
