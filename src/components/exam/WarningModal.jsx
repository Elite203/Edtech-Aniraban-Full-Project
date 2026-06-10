// src/components/exam/WarningModal.jsx
import React from "react";

const WarningModal = ({ setShowWarningModal }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="p-6">
          <h3 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Warning!</h3>
          <p className="mb-4 dark:text-gray-300">
            You have switched tabs/windows multiple times. This behavior is not allowed during the exam.
          </p>
          <p className="mb-6 font-semibold dark:text-gray-300">
            Further violations may result in automatic test submission.
          </p>
          <div className="flex justify-center">
            <button
              className="bg-red-600 text-white px-6 py-2 rounded hover:bg-red-700"
              onClick={() => setShowWarningModal(false)}
            >
              I Understand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;