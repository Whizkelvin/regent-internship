import React from 'react';
import { 
  FaInbox, FaSync, FaBell, FaEnvelope, FaUserFriends, 
  FaReply, FaCheckCircle, FaEye, FaPaperPlane, FaDownload,
  FaUser, FaTrash
} from 'react-icons/fa';
import { format } from 'date-fns';
import { supabase } from '../../supabaseClient';

const MessagesTab = ({
  applicationMessages,
  applications,
  loading,
  fetchApplicationMessages,
  setSelectedApplication,
  setShowMessageModal,
  setShowApplicationDetails,
  markMessageAsRead, // Add this prop
  deleteMessage // Add this prop for deleting messages
}) => {
  const convertToCSV = (data) => {
    const headers = ['ID', 'Name', 'Email', 'Subject', 'Message', 'Date', 'Status'];
    const rows = data.map(msg => [
      msg.id,
      msg.full_name || 'Unknown',
      msg.email || 'No email',
      msg.subject || 'No subject',
      msg.message || 'No message',
      format(new Date(msg.created_at), 'yyyy-MM-dd HH:mm:ss'),
      msg.is_read ? 'Read' : 'Unread'
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Handle mark as read - use the passed function
  const handleMarkAsRead = async (messageId) => {
    if (markMessageAsRead) {
      await markMessageAsRead(messageId);
    }
  };

  // Handle delete message
  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      if (deleteMessage) {
        await deleteMessage(messageId);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Messages Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Messages Center</h2>
            <p className="text-gray-600">Communicate with applicants and manage conversations</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={fetchApplicationMessages}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
            >
              <FaSync className="w-4 h-4" />
              <span>Refresh Messages</span>
            </button>
          </div>
        </div>
      </div>

      {/* Messages Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{applicationMessages.length}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FaInbox className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-red-600">
                {applicationMessages.filter(msg => !msg.is_read).length}
              </p>
            </div>
            <div className="p-2 bg-red-50 rounded-lg">
              <FaBell className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Today</p>
              <p className="text-2xl font-bold text-green-600">
                {applicationMessages.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <FaEnvelope className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">From Applicants</p>
              <p className="text-2xl font-bold text-blue-600">
                {applicationMessages.filter(m => m.message_type === 'contact_form').length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaUserFriends className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Messages List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading messages...</p>
        </div>
      ) : applicationMessages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
            <FaInbox className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start conversations with applicants to track communication about their applications.
          </p>
          <button
            onClick={fetchApplicationMessages}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Refresh Messages
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Message
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {applicationMessages.map((msg) => {
                  const isUnread = !msg.is_read;
                  
                  return (
                    <tr 
                      key={msg.id} 
                      className={`hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center bg-purple-100">
                              <FaUser className="w-5 h-5 text-purple-600" />
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {msg.full_name || 'Unknown User'}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {msg.email || 'No email'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900">{msg.subject || 'No Subject'}</p>
                        <p className="text-xs text-gray-500 capitalize">
                          {msg.message_type?.replace('_', ' ') || 'general'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs">
                          {msg.message?.length > 50 ? `${msg.message.substring(0, 50)}...` : msg.message || 'No message'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {format(new Date(msg.created_at), 'MMM dd')}
                        </div>
                        <div className="text-xs text-gray-500">
                          {format(new Date(msg.created_at), 'hh:mm a')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isUnread ? (
                          <button
                            onClick={() => handleMarkAsRead(msg.id)}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors cursor-pointer"
                            title="Click to mark as read"
                          >
                            <FaBell className="w-3 h-3 mr-1" />
                            Unread
                          </button>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <FaCheckCircle className="w-3 h-3 mr-1" />
                            Read
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // For reply, we can use the email from the message
                              if (msg.email) {
                                // Create a dummy application for reply
                                const dummyApp = {
                                  id: msg.id,
                                  full_name: msg.full_name,
                                  email: msg.email,
                                  message: msg.message
                                };
                                setSelectedApplication(dummyApp);
                                setShowMessageModal(true);
                              }
                            }}
                            className="text-purple-600 hover:text-purple-900 p-1"
                            title="Reply"
                            aria-label="Reply to message"
                          >
                            <FaReply className="w-4 h-4" />
                          </button>
                          {isUnread && (
                            <button
                              onClick={() => handleMarkAsRead(msg.id)}
                              className="text-green-600 hover:text-green-900 p-1"
                              title="Mark as Read"
                              aria-label="Mark message as read"
                            >
                              <FaCheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-red-600 hover:text-red-900 p-1"
                            title="Delete"
                            aria-label="Delete message"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {applicationMessages.length} of {applicationMessages.length} messages
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const csvContent = convertToCSV(applicationMessages);
                    downloadCSV(csvContent, 'messages_export.csv');
                  }}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:shadow-sm transition-all duration-300"
                >
                  <FaDownload className="w-4 h-4" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FaPaperPlane className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Quick Reply</h4>
              <p className="text-sm text-gray-600 mb-3">Send a message to an applicant</p>
              <button
                onClick={() => {
                  if (applicationMessages.length > 0) {
                    const msg = applicationMessages[0];
                    const dummyApp = {
                      id: msg.id,
                      full_name: msg.full_name,
                      email: msg.email,
                      message: msg.message
                    };
                    setSelectedApplication(dummyApp);
                    setShowMessageModal(true);
                  } else {
                    alert('No messages found.');
                  }
                }}
                className="text-sm text-green-700 hover:text-green-900 font-medium"
              >
                Start Conversation →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FaEnvelope className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Mark All Read</h4>
              <p className="text-sm text-gray-600 mb-3">Mark all unread messages as read</p>
              <button
                onClick={async () => {
                  const unreadMessages = applicationMessages.filter(msg => !msg.is_read);
                  if (unreadMessages.length > 0) {
                    for (const msg of unreadMessages) {
                      await handleMarkAsRead(msg.id);
                    }
                    alert(`Marked ${unreadMessages.length} messages as read`);
                  } else {
                    alert('No unread messages');
                  }
                }}
                className="text-sm text-blue-700 hover:text-blue-900 font-medium"
              >
                Mark All Read →
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
          <div className="flex items-start space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <FaDownload className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Export Messages</h4>
              <p className="text-sm text-gray-600 mb-3">Download all conversations</p>
              <button
                onClick={() => {
                  const csvContent = convertToCSV(applicationMessages);
                  downloadCSV(csvContent, 'messages_export.csv');
                }}
                className="text-sm text-purple-700 hover:text-purple-900 font-medium"
              >
                Download CSV →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesTab;