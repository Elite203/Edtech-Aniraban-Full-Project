import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Mail, User, FileText, Calendar, Reply, X, Send } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const Queries = () => {
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [replyContent, setReplyContent] = useState('');
  const [replySubject, setReplySubject] = useState('');
  const [sending, setSending] = useState(false);
  const { isDarkMode } = useTheme();

  const buildUrl = (path) => `${import.meta.env.VITE_BACKEND_URL}${path}`;

  useEffect(() => {
    fetchQueries();
  }, []);



  const fetchQueries = async () => {
    try {
      const response = await fetch(buildUrl('/api/Content/get_queries.php'));
      const data = await response.json();
      
      if (data.success) {
        setQueries(data.data);
      } else {
        console.error('Failed to fetch queries:', data.message);
      }
    } catch (error) {
      console.error('Error fetching queries:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleReplyClick = (query) => {
    console.log('Opening reply modal for query:', query.id);
    setSelectedQuery(query);
    setReplySubject(`Re: ${query.subject}`);
    setReplyContent('');
    setShowReplyModal(true);
  };

  const handleCloseModal = () => {
    console.log('Closing reply modal');
    setShowReplyModal(false);
    setSelectedQuery(null);
    setReplyContent('');
    setReplySubject('');
  };

  const handleSendReply = async () => {
    if (!replyContent.trim() || !replySubject.trim()) {
      console.log('Reply validation failed - empty content or subject');
      alert('Please fill in both subject and message');
      return;
    }

    setSending(true);
    console.log('Sending reply to query:', selectedQuery.id);

    try {
      const response = await fetch(buildUrl('/api/Content/reply_query.php'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          queryId: selectedQuery.id,
          replySubject: replySubject,
          replyMessage: replyContent,
          recipientEmail: selectedQuery.email,
          recipientName: `${selectedQuery.first_name} ${selectedQuery.last_name}`
        })
      });

      const data = await response.json();
      console.log('Reply API response:', data);

      if (data.success) {
        console.log('Reply sent successfully');
        // Update the query state in local state
        setQueries(prevQueries => 
          prevQueries.map(query => 
            query.id === selectedQuery.id 
              ? { ...query, state: 'replied' }
              : query
          )
        );
        handleCloseModal();
        alert('Reply sent successfully!');
      } else {
        console.error('Failed to send reply:', data.message);
        alert('Failed to send reply: ' + data.message);
      }
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Error sending reply. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-white' : 'border-gray-900'}`}></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} p-4 sm:p-6`}>
      <div className="max-w-7xl mx-auto h-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg border shadow-sm h-full flex flex-col`}
        >
          {/* Header */}
          <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'} flex items-center`}>
                  <Mail className="mr-2" />
                  Contact Queries
                </h1>
                <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  {queries.length} total queries
                </p>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto overflow-y-auto">
            <table className="w-full table-auto">
              <thead className={`${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'} sticky top-0`}>
                <tr>
                  <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Name
                  </th>
                  <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Email
                  </th>
                  <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Subject
                  </th>
                  <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Message
                  </th>
                  <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Date
                  </th>
                  <th className={`px-2 sm:px-4 py-3 text-left text-xs font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} uppercase tracking-wider`}>
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {queries.map((query, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`${isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors duration-150`}
                  >
                    <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex-shrink-0 ${isDarkMode ? 'bg-blue-600' : 'bg-blue-500'} flex items-center justify-center mr-2`}>
                          <User className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className={`text-xs sm:text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} select-text`}>
                            {query.first_name} {query.last_name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-4">
                      <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} select-text break-all`}>
                        {query.email}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-4">
                      <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} select-text`}>
                        {query.subject}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-4">
                      <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-900'} max-w-[80px] sm:max-w-xs truncate select-text`}>
                        {query.message}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                      <div className={`text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-500'} flex items-center`}>
                        <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        {formatDate(query.created_at)}
                      </div>
                    </td>
                    <td className="px-2 sm:px-4 py-4 whitespace-nowrap">
                      {query.state === 'replied' ? (
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-green-900 text-green-200' : 'bg-green-100 text-green-800'}`}>
                          Replied
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReplyClick(query)}
                          className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${
                            isDarkMode 
                              ? 'text-white bg-blue-600 hover:bg-blue-700' 
                              : 'text-white bg-blue-600 hover:bg-blue-700'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
                        >
                          <Reply className="w-4 h-4 mr-1" />
                          Reply
                        </button>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {queries.length === 0 && !loading && (
            <div className={`flex-1 flex items-center justify-center text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <div>
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-40" />
                <p className="text-lg font-medium">No queries found</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reply Modal */}
      {showReplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden`}
          >
            {/* Modal Header */}
            <div className={`flex items-center justify-between p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <h3 className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                Reply to {selectedQuery?.first_name} {selectedQuery?.last_name}
              </h3>
              <button
                onClick={handleCloseModal}
                className={`${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'} transition-colors`}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {/* Original Query Display */}
                <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <h4 className={`font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'} mb-2`}>
                    Original Query:
                  </h4>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mb-2`}>
                    <strong>Subject:</strong> {selectedQuery?.subject}
                  </p>
                  <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    <strong>Message:</strong> {selectedQuery?.message}
                  </p>
                </div>

                {/* Reply Form */}
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={replySubject}
                      onChange={(e) => setReplySubject(e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Enter reply subject"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                      Message
                    </label>
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      rows={6}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        isDarkMode 
                          ? 'bg-gray-700 border-gray-600 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      }`}
                      placeholder="Type your reply here..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className={`flex justify-end space-x-3 p-6 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`}>
              <button
                onClick={handleCloseModal}
                disabled={sending}
                className={`px-4 py-2 text-sm font-medium rounded-md ${
                  isDarkMode 
                    ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' 
                    : 'text-gray-700 bg-gray-200 hover:bg-gray-300'
                } transition-colors duration-200 disabled:opacity-50`}
              >
                Cancel
              </button>
              <button
                onClick={handleSendReply}
                disabled={sending || !replyContent.trim() || !replySubject.trim()}
                className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200`}
              >
                {sending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Queries;