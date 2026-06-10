import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import CustomRichTextEditor from '../../components/admin/CustomRichTextEditor';

const TestSeriesInstructionsOne = ({ instructionsData, setInstructionsData }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="max-h-64 md:max-h-72 overflow-y-auto pr-2">
      <div className="space-y-4">
        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Title in English
          </label>
          <input
            type="text"
            placeholder="Enter title in English"
            value={instructionsData.title_english || ''}
            onChange={(e) => setInstructionsData({
              ...instructionsData,
              title_english: e.target.value
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300'
              }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Instruction One English / Images (Optional)
          </label>
          <CustomRichTextEditor
            value={instructionsData.instruction_english}
            onChange={(value) => setInstructionsData({
              ...instructionsData,
              instruction_english: value
            })}
            placeholder="Enter instructions or images in English (text is not required)"
            isDarkMode={isDarkMode}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Title in Hindi
          </label>
          <input
            type="text"
            placeholder="हिंदी में शीर्षक दर्ज करें"
            value={instructionsData.title_hindi || ''}
            onChange={(e) => setInstructionsData({
              ...instructionsData,
              title_hindi: e.target.value
            })}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300'
              }`}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            Instruction One Hindi / Images (Optional)
          </label>
          <CustomRichTextEditor
            value={instructionsData.instruction_hindi}
            onChange={(value) => setInstructionsData({
              ...instructionsData,
              instruction_hindi: value
            })}
            placeholder="हिंदी में निर्देश या चित्र जोड़ें (पाठ आवश्यक नहीं है)"
            isDarkMode={isDarkMode}
            lang="hi"
          />
        </div>
      </div>
    </div>
  );
};

export default TestSeriesInstructionsOne;