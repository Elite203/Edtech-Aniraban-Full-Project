import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Underline, List, ListOrdered, Image, Code, Eye } from 'lucide-react';

const CustomRichTextEditor = ({ value, onChange, placeholder, isDarkMode, lang = 'en' }) => {
  const editorRef = useRef(null);
  const [isSourceMode, setIsSourceMode] = useState(false);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleFormat = (command, val = null) => {
    document.execCommand(command, false, val);
    handleInput();
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          const html = `<img src="${base64}" style="max-width: 100%; height: auto; display: block; margin: 8px 0;" />`;
          document.execCommand('insertHTML', false, html);
          handleInput();
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const handleInsertPalette = (type) => {
    const canvas = document.createElement('canvas');
    canvas.width = 28;
    canvas.height = 28;
    const ctx = canvas.getContext('2d');

    let text = '';
    let className = '';

    if (type === 'nv') {
      ctx.fillStyle = '#f3f4f6';
      ctx.fillRect(0, 0, 28, 28);
      ctx.strokeStyle = '#d1d5db';
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, 0.5, 27, 27);
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('1', 14, 14);

      text = lang === 'hi' ? 'आपने अभी तक प्रश्न नहीं देखा है।' : 'You have not visited the question yet.';
      className = 'exam-icon-v';
    } else if (type === 'na') {
      ctx.fillStyle = '#cc0000';
      ctx.beginPath();
      ctx.moveTo(4, 4);
      ctx.lineTo(24, 4);
      ctx.lineTo(24, 16);
      ctx.lineTo(14, 24);
      ctx.lineTo(4, 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('2', 14, 13);

      text = lang === 'hi' ? 'आपने प्रश्न का उत्तर नहीं दिया है।' : 'You have not answered the question.';
      className = 'exam-icon-na';
    } else if (type === 'ans') {
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.moveTo(14, 4);
      ctx.lineTo(24, 12);
      ctx.lineTo(24, 24);
      ctx.lineTo(4, 24);
      ctx.lineTo(4, 12);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('3', 14, 15);

      text = lang === 'hi' ? 'आपने प्रश्न का उत्तर दे दिया है।' : 'You have answered the question.';
      className = 'exam-icon-ans';
    } else if (type === 'mr') {
      ctx.fillStyle = '#7b1fa2';
      ctx.beginPath();
      ctx.arc(14, 14, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('4', 14, 14);

      text = lang === 'hi' ? 'आपने प्रश्न का उत्तर नहीं दिया है, लेकिन समीक्षा के लिए चिह्नित किया है।' : 'You have NOT answered the question, but have marked the question for review.';
      className = 'exam-icon-m';
    } else if (type === 'amr') {
      ctx.fillStyle = '#7b1fa2';
      ctx.beginPath();
      ctx.arc(14, 14, 11, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(22, 22, 4.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(22, 22, 3.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('5', 13, 13);

      text = lang === 'hi' ? 'आपने प्रश्न का उत्तर दे दिया है, लेकिन समीक्षा के लिए चिह्नित किया है।' : 'You have answered the question, but marked it for review.';
      className = 'exam-icon-amr';
    }

    const base64 = canvas.toDataURL();
    const html = `<img src="${base64}" class="${className}" width="28" height="28" style="display: inline-block; vertical-align: middle; margin: 0 4px; width: 28px; height: 28px;" />&nbsp;${text}&nbsp;`;
    
    if (editorRef.current) {
      editorRef.current.focus();
    }
    document.execCommand('insertHTML', false, html);
    handleInput();
  };

  return (
    <div className={`w-full rounded-lg border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-white'}`}>
      {/* Toolbar */}
      <div className={`flex flex-wrap items-center gap-1 p-2 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
        {!isSourceMode && (
          <>
            <button
              type="button"
              onClick={() => handleFormat('bold')}
              title={lang === 'hi' ? "बोल्ड" : "Bold"}
              className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-700'}`}
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('italic')}
              title={lang === 'hi' ? "इटैलिक" : "Italic"}
              className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-700'}`}
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('underline')}
              title={lang === 'hi' ? "रेखांकित" : "Underline"}
              className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-700'}`}
            >
              <Underline className="w-4 h-4" />
            </button>
            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            <button
              type="button"
              onClick={() => handleFormat('insertUnorderedList')}
              title={lang === 'hi' ? "बुलेट सूची" : "Bullet List"}
              className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleFormat('insertOrderedList')}
              title={lang === 'hi' ? "क्रमबद्ध सूची" : "Numbered List"}
              className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-700'}`}
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleImageUpload}
              title={lang === 'hi' ? "छवि डालें" : "Insert Image"}
              className={`p-1.5 rounded transition-colors ${isDarkMode ? 'hover:bg-gray-700 text-gray-200' : 'hover:bg-gray-200 text-gray-700'}`}
            >
              <Image className="w-4 h-4" />
            </button>
            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
            
            {/* Palette Buttons */}
            <button
              type="button"
              onClick={() => handleInsertPalette('nv')}
              title={lang === 'hi' ? "देखा नहीं गया विकल्प जोड़ें" : "Insert Not Visited State"}
              className="px-2 py-0.5 text-xs font-bold rounded border bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300"
            >
              1
            </button>
            <button
              type="button"
              onClick={() => handleInsertPalette('na')}
              title={lang === 'hi' ? "उत्तर नहीं दिया गया विकल्प जोड़ें" : "Insert Not Answered State"}
              className="px-2 py-0.5 text-xs font-bold rounded bg-red-600 hover:bg-red-700 text-white"
            >
              2
            </button>
            <button
              type="button"
              onClick={() => handleInsertPalette('ans')}
              title={lang === 'hi' ? "उत्तर दिया गया विकल्प जोड़ें" : "Insert Answered State"}
              className="px-2 py-0.5 text-xs font-bold rounded bg-green-700 hover:bg-green-800 text-white"
            >
              3
            </button>
            <button
              type="button"
              onClick={() => handleInsertPalette('mr')}
              title={lang === 'hi' ? "पुनरावलोकन के लिए चिह्नित विकल्प जोड़ें" : "Insert Marked for Review State"}
              className="px-2 py-0.5 text-xs font-bold rounded bg-purple-700 hover:bg-purple-800 text-white"
            >
              4
            </button>
            <button
              type="button"
              onClick={() => handleInsertPalette('amr')}
              title={lang === 'hi' ? "उत्तरित और पुनरावलोकन के लिए चिह्नित विकल्प जोड़ें" : "Insert Answered & Marked State"}
              className="px-2 py-0.5 text-xs font-bold rounded bg-purple-700 hover:bg-purple-800 text-white relative"
            >
              5
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-green-500 rounded-full border border-white" />
            </button>
            <div className={`w-px h-6 mx-1 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />
          </>
        )}
        <button
          type="button"
          onClick={() => setIsSourceMode(!isSourceMode)}
          title={isSourceMode ? (lang === 'hi' ? "दृश्य संपादक" : "Visual Editor") : (lang === 'hi' ? "HTML स्रोत कोड" : "HTML Source Code")}
          className={`p-1.5 rounded transition-colors ml-auto flex items-center space-x-1 text-xs font-medium ${isDarkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-gray-200 text-gray-600'}`}
        >
          {isSourceMode ? (
            <>
              <Eye className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? "दृश्य" : "Visual"}</span>
            </>
          ) : (
            <>
              <Code className="w-3.5 h-3.5" />
              <span>HTML</span>
            </>
          )}
        </button>
      </div>

      {/* Editor Body */}
      {isSourceMode ? (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={lang === 'hi' ? "यहाँ कच्चे HTML निर्देश कोड को संपादित करें..." : "Edit raw HTML instructions code here..."}
          className={`w-full p-3 font-mono text-sm border-0 focus:ring-0 focus:outline-none h-48 rounded-b-lg ${isDarkMode ? 'bg-gray-800 text-gray-200 placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'}`}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable
          onInput={handleInput}
          onBlur={handleInput}
          className={`w-full p-3 border-0 focus:ring-0 focus:outline-none min-h-[150px] max-h-[300px] overflow-y-auto rounded-b-lg prose prose-sm max-w-none ${isDarkMode ? 'bg-gray-800 text-gray-200 placeholder-gray-500' : 'bg-white text-gray-800 placeholder-gray-400'}`}
          style={{ minHeight: '150px' }}
        />
      )}
    </div>
  );
};

export default CustomRichTextEditor;
