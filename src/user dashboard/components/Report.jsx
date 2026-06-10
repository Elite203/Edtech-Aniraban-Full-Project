import React, { useState, useEffect } from 'react';
import { 
  AlertCircle,
  Calendar,
  Loader2,
  Tag,
  Star,
  MessageSquare
} from 'lucide-react';

export default function Report() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem("student_user") || localStorage.getItem("user") || "{}");
  const student_id = user.id;

  useEffect(() => {
    if (student_id) {
      fetchReports();
    }
  }, [student_id]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_BACKEND_URL || "";
      const response = await fetch(`${apiUrl}/api/SaveandReport/get_reported_questions.php?student_id=${student_id}`);
      const data = await response.json();
      if (data.success) {
        setReports(data.data);
      }
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtmlTags = (html) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My Reports</h1>
        <p className="text-gray-600 dark:text-gray-400">Track questions you've reported for errors or improvements</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading your reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <AlertCircle className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">No reports yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-center">Questions you report for errors will be listed here</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 transition-all hover:shadow-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Issue</span>
                    <span className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-xs font-bold uppercase tracking-wider">
                      {report.issue_type}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Subject</span>
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 rounded-lg text-xs font-medium">
                      {report.subject_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Course</span>
                    <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-400 rounded-lg text-xs font-medium">
                      {report.course_name}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Exam Set</span>
                    <span className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-400 rounded-lg text-xs font-medium">
                      {report.set_name || `Set ${report.set_number}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-yellow-500 mt-auto pb-1 ml-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={14} fill={i < (report.rating || 0) ? "currentColor" : "none"} className={i >= (report.rating || 0) ? "text-gray-300 dark:text-gray-600" : ""} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-4 h-4 mr-1" />
                  {new Date(report.created_at).toLocaleDateString()}
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1 flex items-center gap-1">
                    <Tag size={14} /> Question content:
                  </p>
                  <p className="text-gray-900 dark:text-white line-clamp-2">
                    {stripHtmlTags(report.question_english || report.question_hindi)}
                  </p>
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
                    <MessageSquare size={14} className="text-blue-500" /> Your Description:
                  </p>
                  <p className="text-gray-600 dark:text-gray-400 text-sm italic leading-relaxed">
                    "{report.description}"
                  </p>
                </div>

                {report.remarks && (
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      <span className="font-bold">Remarks:</span> {report.remarks}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
