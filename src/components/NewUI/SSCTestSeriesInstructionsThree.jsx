import React, { useRef, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../../contexts/ThemeContext';

const quillModules = {
  toolbar: {
    container: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image', 'blockquote', 'code-block', 'html'],
      ['clean']
    ],
    handlers: {
      'html': function() {
        const html = prompt('Paste your HTML icon code here:');
        if (html) {
          const range = this.quill.getSelection();
          if (range) {
            this.quill.clipboard.dangerouslyPasteHTML(range.index, html);
          } else {
            this.quill.clipboard.dangerouslyPasteHTML(0, html);
          }
        }
      }
    }
  }
};

const quillFormats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'list', 'bullet', 'align', 'link', 'image', 'blockquote', 'code-block'
];

const SSCTestSeriesInstructionsThree = ({ instructionsData, setInstructionsData }) => {
  const { isDarkMode } = useTheme();
  const quillEnglishRef = useRef(null);
  const quillHindiRef = useRef(null);

  // Setup image handler for both editors
  useEffect(() => {
    const setupImageHandler = (quillRef) => {
      if (!quillRef.current) return;
      
      const quill = quillRef.current.getEditor();
      const imageHandler = () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();

        input.onchange = () => {
          const file = input.files[0];
          if (!file) {
            console.log('🖼️ Image upload cancelled');
            return;
          }

          console.log('🖼️ Image selected:', file.name, 'Size:', file.size);

          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              const base64Image = e.target.result;
              console.log('🖼️ Image converted to base64, length:', base64Image.length);
              
              // Insert image into editor
              const range = quill.getSelection();
              if (range) {
                quill.insertEmbed(range.index, 'image', base64Image);
                console.log('✅ Image inserted into editor');
              }
            } catch (error) {
              console.error('❌ Error processing image:', error);
            }
          };
          reader.onerror = () => {
            console.error('❌ Error reading file');
          };
          reader.readAsDataURL(file);
        };
      };

      // Override the image handler
      quill.getModule('toolbar').addHandler('image', imageHandler);
      console.log('✅ Image handler attached to editor');

      // Add delete key handler for images
      const handleKeyDown = (e) => {
        const selection = quill.getSelection();
        if (selection && (e.key === 'Delete' || e.key === 'Backspace')) {
          const [blot] = quill.getLeaf(selection.index);
          if (blot && blot.blotName === 'image') {
            e.preventDefault();
            quill.deleteText(selection.index, 1);
            console.log('🗑️ Image removed');
          }
        }
      };

      const editorElement = quillRef.current.editor.root;
      editorElement.addEventListener('keydown', handleKeyDown);

      return () => {
        editorElement.removeEventListener('keydown', handleKeyDown);
      };
    };

    const cleanup1 = setupImageHandler(quillEnglishRef);
    const cleanup2 = setupImageHandler(quillHindiRef);

    return () => {
      cleanup1?.();
      cleanup2?.();
    };
  }, []);

  return (
    <div className="max-h-64 md:max-h-72 overflow-y-auto pr-2">
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            SSC Instruction 3 English / Images (Optional)
          </label>
          <div className={`rounded-lg border ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <ReactQuill
              ref={quillEnglishRef}
              theme="snow"
              value={instructionsData.instruction_english}
              onChange={(value) => setInstructionsData({
                ...instructionsData, 
                instruction_english: value
              })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="Enter instructions or images in English (text is not required)"
              style={{ 
                minHeight: '80px',
                backgroundColor: isDarkMode ? '#374151' : '#ffffff'
              }}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            SSC Instruction 3 Hindi / Images (Optional)
          </label>
          <div className={`rounded-lg border ${
            isDarkMode ? 'border-gray-600' : 'border-gray-300'
          }`}>
            <ReactQuill
              ref={quillHindiRef}
              theme="snow"
              value={instructionsData.instruction_hindi}
              onChange={(value) => setInstructionsData({
                ...instructionsData, 
                instruction_hindi: value
              })}
              modules={quillModules}
              formats={quillFormats}
              placeholder="हिंदी में निर्देश या चित्र जोड़ें (पाठ आवश्यक नहीं है)"
              style={{ 
                minHeight: '80px',
                backgroundColor: isDarkMode ? '#374151' : '#ffffff'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SSCTestSeriesInstructionsThree;