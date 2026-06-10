// src/components/exam/QuitModal.jsx
import React from "react";

const QuitModal = ({ setShowQuitModal, handleQuit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 dark:text-white">Confirm Quit Test</h3>
          <p className="mb-6 dark:text-gray-300">Are you sure you want to quit the test? All progress will be lost.</p>
          <div className="flex justify-end space-x-4">
            <button
              className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
              onClick={() => setShowQuitModal(false)}
            >
              Cancel
            </button>
            <button
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={handleQuit}
            >
              Quit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuitModal;