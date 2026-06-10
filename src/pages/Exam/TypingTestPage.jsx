
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Timer, Type, CheckCircle, RefreshCw } from 'lucide-react';

const sampleParagraphs = [
  "The quick brown fox jumps over the lazy dog. This sentence contains all letters of the alphabet. Practice typing it to improve your skills. Accuracy and speed are both important for efficient typing. Remember to keep your fingers on the home row.",
  "Learning to type quickly and accurately is a valuable skill in today's digital world. It can save you a lot of time whether you are a student, a professional, or just someone who uses a computer regularly. Consistent practice is the key to improvement. Set realistic goals and track your progress.",
  "The history of computing is fascinating. From the abacus to modern supercomputers, the journey has been incredible. Charles Babbage is often considered the 'father of the computer' for his concept of a programmable mechanical computer. Ada Lovelace, a mathematician, is recognized as the first computer programmer.",
  "Climate change is a significant global challenge that requires collective action. Rising temperatures, extreme weather events, and sea-level rise are some of its impacts. Transitioning to renewable energy sources and adopting sustainable practices are crucial steps towards mitigating its effects. Every individual effort counts.",
  "Artificial intelligence is rapidly transforming various industries, from healthcare to finance. Machine learning algorithms can analyze vast amounts of data to make predictions and decisions. Ethical considerations and potential societal impacts of AI are important topics of discussion among researchers and policymakers.",
  "To achieve success in any field, dedication and perseverance are essential. Set clear goals, break them down into smaller, manageable tasks, and work consistently towards them. Embrace challenges as opportunities for growth and learn from your mistakes. Stay focused and believe in your abilities."
];

const generateParagraph = (wordCount) => {
  let paragraph = "";
  while (paragraph.split(" ").length < wordCount) {
    paragraph += sampleParagraphs[Math.floor(Math.random() * sampleParagraphs.length)] + " ";
  }
  return paragraph.split(" ").slice(0, wordCount).join(" ").trim() + ".";
};

const TypingTestPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const initialTime = parseInt(queryParams.get('time')) || 5;
  const wordCount = parseInt(queryParams.get('words')) || 100;

  const [paragraph, setParagraph] = useState('');
  const [typedText, setTypedText] = useState('');
  const [timeLeft, setTimeLeft] = useState(initialTime * 60);
  const [timerActive, setTimerActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [testFinished, setTestFinished] = useState(false);
  const [errors, setErrors] = useState(0);

  const inputRef = useRef(null);
  const beepAudioRef = useRef(null);
  const lastPlayedErrorIndex = useRef(-1);

  const startNewTest = useCallback(() => {
    setParagraph(generateParagraph(wordCount));
    setTypedText('');
    setTimeLeft(initialTime * 60);
    setTimerActive(false);
    setWpm(0);
    setAccuracy(100);
    setTestFinished(false);
    setErrors(0);
    lastPlayedErrorIndex.current = -1;
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [wordCount, initialTime]);

  useEffect(() => {
    startNewTest();
    beepAudioRef.current = new Audio("https://cdn.jsdelivr.net/gh/Hostinger/sounds/error_sound.mp3");
    if (beepAudioRef.current) {
      beepAudioRef.current.load();
    }
  }, [startNewTest]);


  useEffect(() => {
    let interval;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => prevTime - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      setTestFinished(true);
      calculateResults(typedText, paragraph, initialTime * 60 - timeLeft); // Pass final typedText
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, typedText, paragraph, initialTime]);

  const calculateResults = (currentTypedText, currentParagraph, timeTakenSeconds) => {
    const wordsTypedArray = currentTypedText.trim().split(/\s+/).filter(Boolean);
    const wordsTyped = wordsTypedArray.length;

    const minutes = timeTakenSeconds / 60;

    if (minutes > 0) {
      const grossWpm = Math.round(wordsTyped / minutes);
      setWpm(grossWpm < 0 ? 0 : grossWpm);
    } else if (wordsTyped > 0 && timeTakenSeconds > 0) { // Handle very short times
      const grossWpm = Math.round(wordsTyped / (timeTakenSeconds / 60));
      setWpm(grossWpm < 0 ? 0 : grossWpm);
    }
    else {
      setWpm(0);
    }

    let correctChars = 0;
    const minLength = Math.min(currentParagraph.length, currentTypedText.length);
    for (let i = 0; i < minLength; i++) {
      if (currentParagraph[i] === currentTypedText[i]) {
        correctChars++;
      }
    }
    const currentAccuracy = currentTypedText.length > 0 ? Math.round((correctChars / currentTypedText.length) * 100) : 100;
    setAccuracy(currentAccuracy < 0 ? 0 : (currentAccuracy > 100 ? 100 : currentAccuracy));
  };

  const playBeep = () => {
    if (beepAudioRef.current) {
      beepAudioRef.current.currentTime = 0;
      beepAudioRef.current.play().catch(error => console.warn("Audio play failed:", error));
    }
  };

  const handleInputChange = (e) => {
    const currentTypedValue = e.target.value;
    if (testFinished) return;

    if (!timerActive && currentTypedValue.length > 0) {
      setTimerActive(true);
    }
    setTypedText(currentTypedValue);

    let currentErrors = 0;
    let newErrorDetectedThisStroke = false;

    for (let i = 0; i < currentTypedValue.length; i++) {
      if (i >= paragraph.length || currentTypedValue[i] !== paragraph[i]) {
        currentErrors++;
        if (i === currentTypedValue.length - 1 && i > lastPlayedErrorIndex.current) {
          newErrorDetectedThisStroke = true;
          lastPlayedErrorIndex.current = i;
        }
      }
    }
    setErrors(currentErrors);

    if (newErrorDetectedThisStroke) {
      playBeep();
    }

    const timeElapsed = initialTime * 60 - timeLeft;
    calculateResults(currentTypedValue, paragraph, timeElapsed > 0 ? timeElapsed : (currentTypedValue.length > 0 ? 1 : 0)); // Avoid division by zero if timer hasn't ticked

    if (currentTypedValue.length === paragraph.length && currentErrors === 0) {
      setTimerActive(false);
      setTestFinished(true);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="container mx-auto px-4 py-8 flex flex-col items-center min-h-[calc(100vh-160px)]">
      <div className="bg-card p-6 sm:p-8 rounded-xl shadow-2xl w-full max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-6 text-center">Typing Test</h1>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 text-center">
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            <Timer className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1" />
            <p className="text-xs sm:text-sm text-muted-foreground">Time Left</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{formatTime(timeLeft)}</p>
          </div>
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            <Type className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1" />
            <p className="text-xs sm:text-sm text-muted-foreground">Speed (WPM)</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{wpm}</p>
          </div>
          <div className="bg-muted p-3 sm:p-4 rounded-lg">
            <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-primary mx-auto mb-1" />
            <p className="text-xs sm:text-sm text-muted-foreground">Accuracy</p>
            <p className="text-lg sm:text-xl font-bold text-foreground">{accuracy}%</p>
          </div>
        </div>

        <div className="mb-2 h-4">
          {timerActive && !testFinished && <Progress value={((initialTime * 60) - timeLeft) / (initialTime * 60) * 100} className="w-full h-2" />}
        </div>


        <div className="mb-6 p-4 bg-muted rounded-lg text-foreground text-sm sm:text-base leading-relaxed max-h-48 overflow-y-auto select-none">
          {paragraph.split("").map((char, index) => {
            let charClass = "";
            if (index < typedText.length) {
              charClass = char === typedText[index] ? "text-green-500" : "text-red-500 bg-red-100 dark:bg-red-900";
            }
            return <span key={index} className={charClass}>{char}</span>;
          })}
        </div>

        <textarea
          ref={inputRef}
          value={typedText}
          onChange={handleInputChange}
          disabled={testFinished}
          className="w-full p-3 border border-input rounded-lg mb-6 text-sm sm:text-base focus:ring-2 focus:ring-primary focus:border-primary bg-background text-foreground disabled:bg-muted"
          rows="5"
          placeholder="Start typing here..."
          spellCheck="false"
          autoCapitalize="off"
          autoCorrect="off"
        />

        <div className="flex flex-col sm:flex-row gap-4">
          <Button onClick={startNewTest} variant="outline" className="w-full sm:w-auto flex-1 text-sm sm:text-base">
            <RefreshCw className="w-4 h-4 mr-2" />
            {testFinished ? 'Start New Test' : 'Reset Test'}
          </Button>
          <Button onClick={() => navigate('/typing-test-setup')} variant="secondary" className="w-full sm:w-auto flex-1 text-sm sm:text-base">
            Change Settings
          </Button>
        </div>

        {testFinished && (
          <div className="mt-8 p-4 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg text-center">
            <p className="text-xl font-semibold text-green-700 dark:text-green-300 mb-2">Test Completed!</p>
            <p className="text-green-600 dark:text-green-400">
              Your speed: {wpm} WPM with {accuracy}% accuracy.
            </p>
            <p className="text-sm text-muted-foreground mt-1">Number of errors: {errors}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TypingTestPage;
