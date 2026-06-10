import React, { useState } from 'react';
import { useToast } from "@/components/ui/use-toast";
import { createPortal } from "react-dom";
import { FaFlag, FaBookmark, FaRegBookmark, FaTimes } from "react-icons/fa";
import axios from 'axios';

/**
 * Shared component for Saving and Reporting questions across different UI types.
 * 
 * @param {Object} props
 * @param {string|number} props.questionId - The ID of the question.
 * @param {string} props.quizType - 'old_ui', 'new_ui', or 'current_affairs'.
 * @param {boolean} props.isSaved - Current save status.
 * @param {boolean} props.isReported - Current report status.
 * @param {boolean} props.isDarkMode - Explicit dark mode override.
 * @param {string|number} props.studentId - The ID of the logged-in student.
 * @param {function} props.onSaveToggle - Callback when save status changes.
 * @param {function} props.onReportSuccess - Callback when a report is successfully submitted.
 * @param {boolean} props.showIcons - Whether to show the bookmark/flag icons (default: true).
 * @param {string} props.iconSize - Size of the icons (default: "14").
 * @param {string} props.containerClass - Additional classes for the icon container.
 */
const SaveReportActions = ({
    questionId,
    quizType = 'old_ui',
    isSaved,
    isReported,
    isDarkMode: isDarkModeProp,
    studentId,
    onSaveToggle,
    onReportSuccess,
    showIcons = true,
    iconSize = "14",
    containerClass = "flex items-center gap-2.5 bg-gray-50 dark:bg-gray-900/50 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
}) => {
    // Detect dark mode from HTML class if not explicitly provided
    const [isDarkMode, setIsDarkMode] = useState(() => {
        if (isDarkModeProp !== undefined) return isDarkModeProp;
        return document.documentElement.classList.contains('dark');
    });

    // Update if prop changes
    React.useEffect(() => {
        if (isDarkModeProp !== undefined) {
            setIsDarkMode(isDarkModeProp);
        }
    }, [isDarkModeProp]);

    // Also listen for class changes on documentElement for system/global theme changes
    React.useEffect(() => {
        if (isDarkModeProp !== undefined) return;

        const observer = new MutationObserver(() => {
            setIsDarkMode(document.documentElement.classList.contains('dark'));
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['class']
        });

        return () => observer.disconnect();
    }, [isDarkModeProp]);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [reportForm, setReportForm] = useState({
        issue_type: "Wrong Translation to Hindi",
        description: "",
        remarks: "",
        rating: 5,
        image: null
    });

    const { toast } = useToast();

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const handleSaveClick = async () => {
        if (!studentId) {
            toast({
                title: "Login Required",
                description: "Please login to save questions",
                variant: "destructive"
            });
            return;
        }

        try {
            const resp = await axios.post(`${BASE_URL}api/SaveandReport/save_question.php`, {
                student_id: studentId,
                question_id: questionId,
                quiz_type: quizType,
                action: isSaved ? "unsave" : "save"
            });

            if (resp.data.success) {
                if (onSaveToggle) onSaveToggle(!isSaved);
            }
        } catch (err) {
            console.error("Error saving question:", err);
        }
    };

    const handleReportSubmit = async (e) => {
        e.preventDefault();
        if (!studentId) {
            toast({
                title: "Login Required",
                description: "Please login to report questions",
                variant: "destructive"
            });
            return;
        }

        if (!reportForm.description) {
            toast({
                title: "Required Field",
                description: "Description is required",
                variant: "destructive"
            });
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("student_id", studentId);
            formData.append("question_id", questionId);
            formData.append("quiz_type", quizType);
            formData.append("issue_type", reportForm.issue_type);
            formData.append("description", reportForm.description);
            formData.append("remarks", reportForm.remarks);
            formData.append("rating", reportForm.rating);
            if (reportForm.image) formData.append("image", reportForm.image);

            const response = await fetch(`${BASE_URL}api/SaveandReport/report_question.php`, {
                method: "POST",
                body: formData
            });
            const data = await response.json();

            if (data.success) {
                toast({
                    title: "Success",
                    description: "Report submitted successfully",
                });
                setIsReportModalOpen(false);
                if (onReportSuccess) onReportSuccess();
            } else {
                toast({
                    title: "Error",
                    description: data.message || "Failed to submit report",
                    variant: "destructive"
                });
            }
        } catch (err) {
            console.error("Error reporting question:", err);
            toast({
                title: "Error",
                description: "Error reporting question",
                variant: "destructive"
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {showIcons && (
                <div className={containerClass}>
                    <button
                        title={isSaved ? "Unsave Question" : "Save Question"}
                        onClick={handleSaveClick}
                        className={`transition-all duration-200 hover:scale-110 p-1 rounded-md ${isSaved ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-gray-400 hover:text-blue-500'}`}
                    >
                        {isSaved ? <FaBookmark size={iconSize} /> : <FaRegBookmark size={iconSize} />}
                    </button>
                    <button
                        title={isReported ? "Question Already Reported" : "Report Question"}
                        onClick={() => setIsReportModalOpen(true)}
                        className={`transition-all duration-200 hover:scale-110 p-1 rounded-md ${isReported ? 'text-red-600 bg-red-50 dark:bg-red-900/30' : 'text-gray-400 hover:text-red-500'}`}
                    >
                        <FaFlag size={iconSize} />
                    </button>
                </div>
            )}

            {isReportModalOpen && createPortal(
                <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className={`rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border ${isDarkMode ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                        <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}>
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FaFlag className="text-red-500" /> Report Question
                            </h3>
                            <button
                                onClick={() => setIsReportModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                            >
                                <FaTimes size={20} />
                            </button>
                        </div>
                        <form onSubmit={handleReportSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                            <div>
                                <label className="block text-sm font-semibold mb-1">Issue Type</label>
                                <select
                                    className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    value={reportForm.issue_type}
                                    onChange={(e) => setReportForm({ ...reportForm, issue_type: e.target.value })}
                                >
                                    <option>Wrong Translation to Hindi</option>
                                    <option>Repeated Question</option>
                                    <option>Wrong/Incomplete Question</option>
                                    <option>Wrong/Confusing Option</option>
                                    <option>Wrong/Incomplete Answer</option>
                                    <option>Answer not understand</option>
                                    <option>Multiple Correct Answers</option>
                                    <option>Explanation Missing</option>
                                    <option>Question Formatting Issue</option>
                                    <option>Image not visible</option>
                                    <option>Out of Syllabus</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    required
                                    rows="3"
                                    className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    placeholder="Describe the issue in detail..."
                                    value={reportForm.description}
                                    onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                                ></textarea>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold mb-1">Remarks (Optional)</label>
                                <input
                                    type="text"
                                    className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                    placeholder="Any additional remarks..."
                                    value={reportForm.remarks}
                                    onChange={(e) => setReportForm({ ...reportForm, remarks: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold mb-1">Rating (1-5)</label>
                                    <input
                                        type="number" min="1" max="5"
                                        className={`w-full p-2.5 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 ${isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'}`}
                                        value={reportForm.rating}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            if (val >= 1 && val <= 5) {
                                                setReportForm({ ...reportForm, rating: val });
                                            } else if (e.target.value === "") {
                                                setReportForm({ ...reportForm, rating: "" });
                                            }
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-sm font-semibold mb-1">Upload Image</label>
                                    <input
                                        type="file" accept="image/*"
                                        className={`w-full text-xs file:mr-2 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                                        onChange={(e) => setReportForm({ ...reportForm, image: e.target.files[0] })}
                                    />
                                </div>
                            </div>
                            <div className="pt-2 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsReportModalOpen(false)}
                                    className={`flex-1 py-3 rounded-xl font-bold transition-all ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold shadow-lg hover:bg-red-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                                >
                                    {isSubmitting ? "Submitting..." : "Submit Report"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
};

export default SaveReportActions;
