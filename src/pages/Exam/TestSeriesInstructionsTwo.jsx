import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import CustomRichTextEditor from '../../components/admin/CustomRichTextEditor';

const TestSeriesInstructionsTwo = ({ instructionsData, setInstructionsData }) => {
  const { isDarkMode } = useTheme();

  return (
    <div className="max-h-56 md:max-h-72 overflow-y-auto pr-2">
      <div className="space-y-4">
        {/* Test Duration */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Test Duration (Minutes) *
          </label>
          <input
            type="number"
            placeholder="Enter test duration in minutes"
            value={instructionsData.test_duration || ''}
            onChange={(e) => {
              console.log('⏱️ TestSeriesInstructionsTwo: Duration changed:', e.target.value);
              setInstructionsData({
                ...instructionsData,
                test_duration: e.target.value
              });
            }}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>

        {/* Total Marks */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Total Marks *
          </label>
          <input
            type="number"
            placeholder="Enter total marks"
            value={instructionsData.total_marks || ''}
            onChange={(e) => {
              console.log('📊 TestSeriesInstructionsTwo: Total marks changed:', e.target.value);
              setInstructionsData({
                ...instructionsData,
                total_marks: e.target.value
              });
            }}
            min="1"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>

        {/* Instruction Two English */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Instruction Two English / Images (Optional)
          </label>
          <CustomRichTextEditor
            value={instructionsData.instruction_two_english || ''}
            onChange={(value) => {
              console.log('📝 TestSeriesInstructionsTwo: Instruction Two English changed');
              setInstructionsData({
                ...instructionsData,
                instruction_two_english: value
              });
            }}
            placeholder="Enter instructions or images in English (text is not required)"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Instruction Two Hindi */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Instruction Two Hindi / Images (Optional)
          </label>
          <CustomRichTextEditor
            value={instructionsData.instruction_two_hindi || ''}
            onChange={(value) => {
              console.log('📝 TestSeriesInstructionsTwo: Instruction Two Hindi changed');
              setInstructionsData({
                ...instructionsData,
                instruction_two_hindi: value
              });
            }}
            placeholder="हिंदी में निर्देश या चित्र जोड़ें (पाठ आवश्यक नहीं है)"
            isDarkMode={isDarkMode}
            lang="hi"
          />
        </div>

        {/* Red Warning English */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Red Warning Text (English) *
          </label>
          <textarea
            placeholder="Enter warning text in English (displayed in red)"
            value={instructionsData.red_warning_english || ''}
            onChange={(e) => {
              console.log('⚠️ TestSeriesInstructionsTwo: Red warning English changed');
              setInstructionsData({
                ...instructionsData,
                red_warning_english: e.target.value
              });
            }}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>

        {/* Red Warning Hindi */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Red Warning Text (Hindi) *
          </label>
          <textarea
            placeholder="हिंदी में चेतावनी पाठ दर्ज करें (लाल रंग में प्रदर्शित)"
            value={instructionsData.red_warning_hindi || ''}
            onChange={(e) => {
              console.log('⚠️ TestSeriesInstructionsTwo: Red warning Hindi changed');
              setInstructionsData({
                ...instructionsData,
                red_warning_hindi: e.target.value
              });
            }}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>

        {/* Declaration English */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Declaration (English) *
          </label>
          <textarea
            placeholder="Enter declaration text in English"
            value={instructionsData.declaration_english || ''}
            onChange={(e) => {
              console.log('📋 TestSeriesInstructionsTwo: Declaration English changed');
              setInstructionsData({
                ...instructionsData,
                declaration_english: e.target.value
              });
            }}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>

        {/* Declaration Hindi */}
        <div>
          <label className={`block text-sm font-medium mb-2 ${
            isDarkMode ? 'text-gray-300' : 'text-gray-700'
          }`}>
            Declaration (Hindi)
          </label>
          <textarea
            placeholder="हिंदी में घोषणा पाठ दर्ज करें"
            value={instructionsData.declaration_hindi || ''}
            onChange={(e) => {
              console.log('📋 TestSeriesInstructionsTwo: Declaration Hindi changed');
              setInstructionsData({
                ...instructionsData,
                declaration_hindi: e.target.value
              });
            }}
            rows="3"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
              isDarkMode
                ? 'bg-gray-700 border-gray-600 text-white'
                : 'bg-white border-gray-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
};

export default TestSeriesInstructionsTwo;