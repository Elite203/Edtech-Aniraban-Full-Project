import React, { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useTheme } from '../contexts/ThemeContext';

const QuestionEditor = ({ label, value, onChange, isOptional = false, className = '' }) => {
  const { isDarkMode } = useTheme();
  const [content, setContent] = useState(value || '');
  const quillRef = useRef(null);

  useEffect(() => {
    console.log(`🎨 Initializing editor for ${label}`);
    setContent(value || '');
  }, [value, label]);

  const handleChange = (newValue) => {
    console.log(`📝 Content changed in ${label}`);
    setContent(newValue);
    onChange(newValue);
  };

  const handleImageUpload = () => {
    console.log(`📸 Image upload triggered for ${label}`);
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const base64 = event.target.result;
          if (quillRef.current) {
            const quill = quillRef.current.getEditor();
            const range = quill.getSelection();
            if (range) {
              quill.insertEmbed(range.index, 'image', base64);
              quill.setSelection(range.index + 1);
              console.log(`✅ Image inserted into ${label}`);
            }
          }
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const modules = {
    toolbar: {
      container: [
        ['bold', 'italic', 'underline'],
        [{ image: 'image' }],
        ['clean']
      ],
      handlers: {
        image: handleImageUpload
      }
    }
  };

  return (
    <div className={`${className}`}>
      <label className={`block text-sm font-medium mb-2 ${
        isDarkMode ? 'text-gray-300' : 'text-gray-700'
      }`}>
        {label}
        {isOptional && <span className="text-gray-400 ml-1">(Optional)</span>}
      </label>
      <div className={`rounded border ${isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={content}
          onChange={handleChange}
          placeholder={isOptional ? `Enter ${label} (optional)` : `Enter ${label}`}
          modules={modules}
          className={`${isDarkMode ? 'quill-dark' : ''}`}
          style={{
            minHeight: '120px',
            borderRadius: '0.375rem'
          }}
        />
      </div>
      <style jsx>{`
        :global(.ql-toolbar) {
          border: 1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'} !important;
          border-radius: 0.375rem 0.375rem 0 0;
          background: ${isDarkMode ? '#374151' : '#f9fafb'} !important;
        }
        :global(.ql-container) {
          border: 1px solid ${isDarkMode ? '#4b5563' : '#e5e7eb'} !important;
          border-top: none;
          border-radius: 0 0 0.375rem 0.375rem;
        }
        :global(.ql-toolbar button) {
          color: ${isDarkMode ? '#9ca3af' : '#6b7280'} !important;
        }
        :global(.ql-toolbar button:hover),
        :global(.ql-toolbar button.ql-active) {
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'} !important;
        }
        :global(.ql-editor) {
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'} !important;
          background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
          min-height: 120px;
          max-height: 300px;
        }
        :global(.ql-editor.ql-blank::before) {
          color: ${isDarkMode ? '#6b7280' : '#d1d5db'} !important;
        }
        :global(.quill-dark .ql-editor) {
          background: ${isDarkMode ? '#1f2937' : '#ffffff'} !important;
          color: ${isDarkMode ? '#e5e7eb' : '#1f2937'} !important;
        }
      `}</style>
    </div>
  );
};

export default QuestionEditor;