// src/components/exam/SubmitModal.jsx
import React from "react";

const SubmitModal = ({
  subjects,
  questions,
  answers,
  reviewed,
  visited,
  setShowSubmitModal,
  handleFinalSubmit,
  handleSubmitCurrentSubject,
  isLastSubject,
  submittedSubjects,
  timeConfig,
  isTimeUp
}) => {
  const isSectional = timeConfig?.type === "sectional";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-6xl shadow-lg max-h-[90vh] overflow-y-auto relative">
        {!isTimeUp && (
          <button
            onClick={() => setShowSubmitModal(false)}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="p-4 sm:p-6">
          {/* Title */}
          <h3 className={`text-lg sm:text-xl font-bold mb-3 sm:mb-4 text-center sm:text-left ${isTimeUp ? "text-red-600 dark:text-red-400" : "dark:text-white"}`}>
            {isTimeUp ? "Time's Up! Final Submission Required" : "Review test before submit"}
          </h3>

          {/* Submitted subjects info */}
          {submittedSubjects.length > 0 && (
            <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
              <p className="text-sm font-medium dark:text-yellow-200">
                Already submitted sections: {submittedSubjects.join(", ")}
              </p>
            </div>
          )}

          {/* Table Scrollable */}
          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700">
                  {[
                    ...(isSectional ? ["Section"] : []),
                    "Subject Name",
                    "Status",
                    "Questions count",
                    "Answered",
                    "Not Answered",
                    "Marked Answered",
                    "Marked for Review",
                    "Visited",
                    "Not Visited",
                  ].map((head) => (
                    <th
                      key={head}
                      className="border p-2 sm:p-3 text-center sm:text-left dark:text-white whitespace-nowrap"
                    >
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {subjects.map((subject) => {
                  const subjectQuestions = questions.filter(
                    (q) => q.subject.toUpperCase() === subject
                  );
                  const total = subjectQuestions.length;
                  const isSubmitted = submittedSubjects.includes(subject);

                  const sectionName = isSectional
                    ? timeConfig?.sections?.find((sec) =>
                      sec.subjects
                        ?.map((s) => s.toUpperCase())
                        .includes(subject.toUpperCase())
                    )?.name || "N/A"
                    : "";

                  let answered = 0;
                  let notAnswered = 0;
                  let markedAnswered = 0;
                  let markedForReview = 0;
                  let visitedCount = 0;

                  subjectQuestions.forEach((q) => {
                    const qid = q.id;
                    const isAnswered = !!answers[qid];
                    const isVisited = visited.has(qid);
                    const reviewStatus = reviewed[qid];

                    if (isVisited) visitedCount++;

                    if (reviewStatus === "reviewedAnswered") {
                      markedAnswered++;
                    } else if (reviewStatus === "reviewedUnanswered") {
                      markedForReview++;
                    } else if (isAnswered) {
                      answered++;
                    } else if (isVisited) {
                      notAnswered++;
                    }
                  });

                  const notVisited = total - visitedCount;

                  return (
                    <tr key={subject} className="dark:border-gray-600">
                      {isSectional && (
                        <td className="border p-2 sm:p-3 dark:text-white text-center sm:text-left font-medium">
                          {sectionName}
                        </td>
                      )}
                      <td className="border p-2 sm:p-3 dark:text-white text-center sm:text-left font-medium">
                        {subject}
                      </td>
                      <td className="border p-2 sm:p-3 text-center">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${isSubmitted
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          }`}>
                          {isSubmitted ? "Submitted" : "Pending"}
                        </span>
                      </td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{total}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{answered}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{notAnswered}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{markedAnswered}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{markedForReview}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{visitedCount}</td>
                      <td className="border p-2 sm:p-3 text-center dark:text-white">{notVisited}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Buttons - responsive */}
          <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 mt-4 sm:mt-6">


            {!isLastSubject && !isTimeUp && (
              <button
                className="bg-blue-600 text-white px-4 py-2 sm:px-6 rounded-lg hover:bg-blue-700 text-sm sm:text-base"
                onClick={() => {
                  handleSubmitCurrentSubject();
                  setShowSubmitModal(false);
                }}
              >
                Submit Current Section & Move to Next
              </button>
            )}

            <button
              className="bg-green-600 text-white px-4 py-2 sm:px-6 rounded-lg hover:bg-green-700 text-sm sm:text-base"
              onClick={() => {
                handleFinalSubmit();
                setShowSubmitModal(false);
              }}
            >
              {isLastSubject ? "Final Submit Test" : "Submit All Remaining Sections"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubmitModal;