import { useState, useCallback } from 'react';

/**
 * Custom hook for Speech Recognition
 */
export const useSpeechToText = (onTranscript) => {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      if (onTranscript) onTranscript(transcript);
    };

    recognition.start();
  }, [onTranscript]);

  return { isListening, startListening };
};

/**
 * Logic for translating English to Hindi using a free API
 */
export const translateToHindi = async (text) => {
  if (!text || text.trim() === "") return "";
  
  // Clean text but don't strip tags here anymore, 
  // we'll handle HTML separately in translateHtmlToHindi
  const cleanText = text.replace(/&nbsp;/g, ' ').trim();
  
  if (!cleanText) return "";

  try {
    const MAX_CHUNK_SIZE = 2000;
    const chunks = [];
    for (let i = 0; i < cleanText.length; i += MAX_CHUNK_SIZE) {
      chunks.push(cleanText.substring(i, i + MAX_CHUNK_SIZE));
    }

    const translatedResults = [];
    for (const chunk of chunks) {
      const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=${encodeURIComponent(chunk)}`);
      const data = await response.json();
      
      if (data && data[0]) {
        const translatedChunk = data[0].map(part => part[0]).join("");
        translatedResults.push(translatedChunk);
      } else {
        translatedResults.push(chunk);
      }
    }

    return translatedResults.join("");
  } catch (error) {
    console.error("Translation error:", error);
    return text;
  }
};

/**
 * Translates HTML content while preserving tags and formatting
 */
export const translateHtmlToHindi = async (html) => {
  if (!html || html.trim() === "") return "";
  
  // If it doesn't look like HTML, just use normal translation
  if (!html.includes('<')) {
    return await translateToHindi(html);
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // Recursive function to translate text nodes
  const walk = async (node) => {
    if (node.nodeType === 3) { // TEXT_NODE
      const text = node.nodeValue;
      if (text && text.trim().length > 0) {
        const translated = await translateToHindi(text);
        node.nodeValue = translated;
      }
    } else {
      // Don't translate script or style tags
      if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
      
      const promises = [];
      for (let i = 0; i < node.childNodes.length; i++) {
        promises.push(walk(node.childNodes[i]));
      }
      await Promise.all(promises);
    }
  };

  await walk(doc.body);
  return doc.body.innerHTML;
};

