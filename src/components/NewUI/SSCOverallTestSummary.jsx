import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useStudentProfile } from './StudentProfileData';
import WatermarkComponent from './WatermarkComponent';

const SSCOverallTestSummary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useStudentProfile();

  useEffect(() => {
    window.history.pushState(null, null, window.location.href);

    const handlePopState = (event) => {
      window.history.pushState(null, null, window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);
  
  const { 
    examSet, 
    subjects = [], 
    questions = [], 
    questionStatus = {} 
  } = location.state || {};

  const stats = subjects.map((sub, index) => {
    const subQuestions = questions.filter(q => 
      q.subject_id === sub.id && 
      ((q.parent_question_id === null && q.question_type !== 'passage') || q.parent_question_id !== null)
    );
    const answered = subQuestions.filter(q => 
      questionStatus[q.id] === 'answered' || questionStatus[q.id] === 'marked_answered'
    ).length;
    const total = subQuestions.length;
    const notAnswered = total - answered;

    return {
      name: `PART-${String.fromCharCode(65 + index)}`,
      answered,
      notAnswered,
      total
    };
  });

  const grandTotal = stats.reduce((acc, curr) => ({
    answered: acc.answered + curr.answered,
    notAnswered: acc.notAnswered + curr.notAnswered,
    total: acc.total + curr.total
  }), { answered: 0, notAnswered: 0, total: 0 });

  const handleComplete = () => {
    const state = location.state || {};
    navigate('/ssc/thank-you', {
      state: {
        course_id: state.course_id || localStorage.getItem('sscCourseId'),
        exam_set_id: state.exam_set_id || state.examSetId || localStorage.getItem('sscExamSetId'),
        set_number: state.set_number || localStorage.getItem('sscSetNumber')
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#f4f6f8] dark:bg-slate-900 flex justify-center items-center p-4 relative">
      <WatermarkComponent text={user?.number} />
      
      <div className="summary-card bg-white dark:bg-slate-800 w-full max-w-[550px] rounded-lg shadow-xl p-8 text-center relative z-10">
        <img 
          src="/img/ssc.webp" 
          alt="SSC Logo" 
          className="h-[60px] mx-auto mb-3"
        />
        
        <div className="summary-title text-base font-bold text-black dark:text-white mb-6 uppercase">
          Overall Test Summary
        </div>

        <table className="details-table w-full mb-8 text-sm">
          <tbody>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <td className="py-2 text-left font-bold text-gray-600 dark:text-slate-400 w-[40%]">Reg Number</td>
              <td className="py-2 text-left font-bold text-black dark:text-white">: {user?.number || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <td className="py-2 text-left font-bold text-gray-600 dark:text-slate-400 w-[40%]">Roll Number</td>
              <td className="py-2 text-left font-bold text-black dark:text-white">: {user?.number || 'N/A'}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <td className="py-2 text-left font-bold text-gray-600 dark:text-slate-400 w-[40%]">Candidate Name</td>
              <td className="py-2 text-left font-bold text-black dark:text-white">: {user?.name || 'Candidate Name'}</td>
            </tr>
            <tr className="border-b border-gray-100 dark:border-slate-700">
              <td className="py-2 text-left font-bold text-gray-600 dark:text-slate-400 w-[40%]">Exam Name</td>
              <td className="py-2 text-left font-bold text-black dark:text-white">: {examSet?.setName || 'SSC-Mock Test'}</td>
            </tr>
          </tbody>
        </table>

        <table className="stats-table w-full mb-8 text-[13px]">
          <thead>
            <tr className="border-b border-gray-300 dark:border-slate-600">
              <th className="py-2.5"></th>
              <th className="py-2.5 font-normal text-gray-600 dark:text-slate-400">Answered</th>
              <th className="py-2.5 font-normal text-gray-600 dark:text-slate-400">Not Answered</th>
              <th className="py-2.5 font-normal text-blue-600 dark:text-blue-400">Total Per Part</th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, idx) => (
              <tr key={idx} className="border-b border-gray-100 dark:border-slate-700 font-bold text-black dark:text-white">
                <td className="py-2.5 text-left pl-2.5">{stat.name}</td>
                <td className="py-2.5">{stat.answered}</td>
                <td className="py-2.5">{stat.notAnswered}</td>
                <td className="py-2.5 text-blue-600 dark:text-blue-400">{stat.total}</td>
              </tr>
            ))}
            <tr className="total-row border-t-2 border-gray-300 dark:border-slate-600 text-sm text-blue-600 dark:text-blue-400 font-bold">
              <td className="py-2.5 text-left pl-2.5">TOTAL</td>
              <td className="py-2.5">{grandTotal.answered}</td>
              <td className="py-2.5">{grandTotal.notAnswered}</td>
              <td className="py-2.5">{grandTotal.total}</td>
            </tr>
          </tbody>
        </table>

        <button 
          className="complete-btn bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded transition-colors text-sm"
          onClick={handleComplete}
        >
          Click Here to Complete the Test
        </button>
      </div>
    </div>
  );
};

export default SSCOverallTestSummary;
