import React, { useState, useEffect } from 'react';
import { 
  FaInbox, FaSync, FaBell, FaEnvelope, FaUserFriends, 
  FaReply, FaCheckCircle, FaEye, FaPaperPlane, FaDownload,
  FaUser, FaTrash, FaExclamationCircle, FaShieldAlt
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
  markMessageAsRead,
  deleteMessage
}) => {
  // Local state
  const [loadingActions, setLoadingActions] = useState({});
  const [localMessages, setLocalMessages] = useState([]);
  const [actionError, setActionError] = useState(null);
  const [senderProfiles, setSenderProfiles] = useState({});
  const [adminUserId, setAdminUserId] = useState(null);

  // Initialize local messages
  useEffect(() => {
    if (applicationMessages && applicationMessages.length > 0) {
      setLocalMessages(applicationMessages);
      // Extract unique sender IDs and fetch their profiles
      fetchSenderProfiles(applicationMessages);
    }
  }, [applicationMessages]);

  // Get current admin user ID
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Clear error after 3 seconds
  useEffect(() => {
    if (actionError) {
      const timer = setTimeout(() => setActionError(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [actionError]);

  // Fetch sender profiles
  const fetchSenderProfiles = async (messages) => {
    try {
      // Extract unique sender IDs
      const senderIds = [...new Set(messages.map(msg => msg.sender_id).filter(Boolean))];
      
      if (senderIds.length === 0) return;

      // Fetch profiles for these sender IDs
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url')
        .in('id', senderIds);

      if (!error && profiles) {
        const profilesMap = {};
        profiles.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
        setSenderProfiles(profilesMap);
      }
    } catch (error) {
      console.error('Error fetching sender profiles:', error);
    }
  };

  // Get sender name for a message
  const getSenderName = (message) => {
    // If message has direct sender info (from application_messages)
    if (message.full_name) {
      return message.full_name;
    }
    
    // If we have sender profile in our map
    if (message.sender_id && senderProfiles[message.sender_id]) {
      return senderProfiles[message.sender_id].full_name || 
             senderProfiles[message.sender_id].email?.split('@')[0] || 
             'User';
    }
    
    // If it's an admin message (admin is sender)
    if (message.sender_id === adminUserId) {
      return 'You (Admin)';
    }
    
    // If it's from contact form
    if (message.message_type === 'contact_form' || message.message_type === 'inquiry') {
      return message.full_name || 'Applicant';
    }
    
    // Default fallback
    if (message.message_type === 'admin_reply') {
      return 'Admin';
    }
    
    return 'Unknown User';
  };

  // Get sender email for a message
  const getSenderEmail = (message) => {
    if (message.email) {
      return message.email;
    }
    
    if (message.sender_id && senderProfiles[message.sender_id]) {
      return senderProfiles[message.sender_id].email;
    }
    
    return 'No email';
  };

  // Check if message is from admin
  const isFromAdmin = (message) => {
    return message.sender_id === adminUserId || 
           message.message_type === 'admin_reply' ||
           message.full_name?.includes('Admin') ||
           (message.sender && message.sender.full_name?.includes('Admin'));
  };

  const convertToCSV = (data) => {
    const headers = ['ID', 'Sender', 'Email', 'Subject', 'Message', 'Date', 'Status', 'Type'];
    const rows = data.map(msg => [
      msg.id,
      getSenderName(msg),
      getSenderEmail(msg),
      msg.subject || 'No subject',
      msg.message || 'No message',
      format(new Date(msg.created_at), 'yyyy-MM-dd HH:mm:ss'),
      msg.is_read ? 'Read' : 'Unread',
      msg.message_type || 'general'
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

  const handleMarkAsRead = async (messageId) => {
    if (!markMessageAsRead) {
      setActionError('Function not available');
      return;
    }

    setLoadingActions(prev => ({ ...prev, [messageId]: true }));
    setActionError(null);
    
    try {
      await markMessageAsRead(messageId);
      
      // Update local state immediately for UI feedback
      setLocalMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? { ...msg, is_read: true } : msg
        )
      );
      
    } catch (error) {
      console.error('Error marking message as read:', error);
      setActionError('Failed to mark as read');
    } finally {
      setLoadingActions(prev => ({ ...prev, [messageId]: false }));
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!deleteMessage) {
      setActionError('Function not available');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    setLoadingActions(prev => ({ ...prev, [`delete_${messageId}`]: true }));
    setActionError(null);
    
    try {
      await deleteMessage(messageId);
      
      // Update local state immediately
      setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
      
    } catch (error) {
      console.error('Error deleting message:', error);
      setActionError('Failed to delete message');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete_${messageId}`]: false }));
    }
  };

  const handleReply = (msg) => {
    const email = getSenderEmail(msg);
    if (!email || email === 'No email') {
      setActionError('No email address available');
      return;
    }

    if (!setSelectedApplication || !setShowMessageModal) {
      setActionError('Reply functionality not available');
      return;
    }

    const appForReply = {
      id: msg.application_id || msg.id,
      full_name: getSenderName(msg),
      email: email,
      subject: `Re: ${msg.subject || 'Your Message'}`,
      message: msg.message,
      phone: msg.phone || '',
      status: msg.status || 'pending'
    };

    setSelectedApplication(appForReply);
    setShowMessageModal(true);
  };

  const handleMarkAllAsRead = async () => {
    const unreadMessages = localMessages.filter(msg => !msg.is_read);
    
    if (unreadMessages.length === 0) {
      setActionError('No unread messages');
      return;
    }

    if (!markMessageAsRead) {
      setActionError('Function not available');
      return;
    }

    if (!window.confirm(`Mark all ${unreadMessages.length} unread messages as read?`)) {
      return;
    }

    setLoadingActions(prev => ({ ...prev, 'all': true }));
    setActionError(null);
    
    try {
      // Process all unread messages
      const promises = unreadMessages.map(msg => markMessageAsRead(msg.id));
      await Promise.all(promises);
      
      // Update all messages at once
      setLocalMessages(prev => 
        prev.map(msg => 
          !msg.is_read ? { ...msg, is_read: true } : msg
        )
      );
      
    } catch (error) {
      console.error('Error marking all as read:', error);
      setActionError('Failed to mark all as read');
    } finally {
      setLoadingActions(prev => ({ ...prev, 'all': false }));
    }
  };

  // View application details
  const handleViewApplication = (msg) => {
    if (!setShowApplicationDetails || !setSelectedApplication) {
      setActionError('Cannot view application details');
      return;
    }

    // Try to find related application
    const email = getSenderEmail(msg);
    const relatedApp = applications?.find(app => 
      app.email === email || 
      app.full_name === getSenderName(msg) ||
      app.id === msg.application_id
    );

    if (relatedApp) {
      setSelectedApplication(relatedApp);
      setShowApplicationDetails(true);
    } else {
      setActionError('No related application found');
    }
  };

  // Error display component
  const ErrorAlert = () => {
    if (!actionError) return null;
    
    return (
      <div className="fixed top-4 right-4 z-50 animate-fadeIn">
        <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
          <FaExclamationCircle className="w-5 h-5" />
          <span>{actionError}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      <ErrorAlert />

      {/* Messages Header */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Messages Center</h2>
            <p className="text-gray-600">Communicate with applicants and manage conversations</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => {
                fetchApplicationMessages();
                if (applicationMessages) {
                  setLocalMessages(applicationMessages);
                }
              }}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FaSync className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Loading...' : 'Refresh Messages'}</span>
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
              <p className="text-2xl font-bold text-gray-900">{localMessages.length}</p>
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
                {localMessages.filter(msg => !msg.is_read).length}
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
              <p className="text-sm text-gray-600">From Applicants</p>
              <p className="text-2xl font-bold text-blue-600">
                {localMessages.filter(m => !isFromAdmin(m)).length}
              </p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaUserFriends className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">From Admin</p>
              <p className="text-2xl font-bold text-green-600">
                {localMessages.filter(m => isFromAdmin(m)).length}
              </p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <FaShieldAlt className="w-6 h-6 text-green-500" />
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
      ) : localMessages.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
            <FaInbox className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Start conversations with applicants to track communication about their applications.
          </p>
          <button
            onClick={() => {
              fetchApplicationMessages();
              if (applicationMessages) {
                setLocalMessages(applicationMessages);
              }
            }}
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
                    Type
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
                {localMessages.map((msg) => {
                  const isUnread = !msg.is_read;
                  const isLoading = loadingActions[msg.id];
                  const isDeleting = loadingActions[`delete_${msg.id}`];
                  const isAdminMessage = isFromAdmin(msg);
                  const senderName = getSenderName(msg);
                  const senderEmail = getSenderEmail(msg);
                  
                  return (
                    <tr 
                      key={msg.id} 
                      className={`hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50' : ''} ${
                        isAdminMessage ? 'bg-green-50/50' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              isAdminMessage ? 'bg-green-100' : 'bg-purple-100'
                            }`}>
                              {isAdminMessage ? (
                                <FaShieldAlt className="w-5 h-5 text-green-600" />
                              ) : (
                                <FaUser className="w-5 h-5 text-purple-600" />
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {senderName}
                              {isAdminMessage && (
                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  Admin
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 truncate max-w-[150px]">
                              {senderEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 capitalize">
                          {msg.message_type?.replace('_', ' ') || 'general'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {msg.application_id ? 'Application' : 'General'}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-900 truncate max-w-xs" title={msg.message}>
                          {msg.message?.length > 50 ? `${msg.message.substring(0, 50)}...` : msg.message || 'No message'}
                        </p>
                        {msg.subject && (
                          <p className="text-xs text-gray-500 mt-1" title={msg.subject}>
                            Subj: {msg.subject}
                          </p>
                        )}
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
                            onClick={() => !isLoading && handleMarkAsRead(msg.id)}
                            disabled={isLoading}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isLoading ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800 hover:bg-red-200'} transition-colors ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                            title={isLoading ? 'Marking as read...' : 'Click to mark as read'}
                          >
                            {isLoading ? (
                              <span className="w-3 h-3 mr-1 border-2 border-yellow-800 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <FaBell className="w-3 h-3 mr-1" />
                            )}
                            {isLoading ? 'Processing...' : 'Unread'}
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
                          {!isAdminMessage && (
                            <button
                              onClick={() => handleReply(msg)}
                              disabled={!senderEmail || senderEmail === 'No email' || isLoading || isDeleting}
                              className={`text-purple-600 hover:text-purple-900 p-1 ${(!senderEmail || senderEmail === 'No email' || isLoading || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={senderEmail && senderEmail !== 'No email' ? "Reply" : "No email address"}
                              aria-label="Reply to message"
                            >
                              <FaReply className="w-4 h-4" />
                            </button>
                          )}
                          
                          {msg.application_id && (
                            <button
                              onClick={() => handleViewApplication(msg)}
                              disabled={isLoading || isDeleting}
                              className={`text-blue-600 hover:text-blue-900 p-1 ${(isLoading || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title="View Application"
                              aria-label="View related application"
                            >
                              <FaEye className="w-4 h-4" />
                            </button>
                          )}
                          
                          {isUnread && (
                            <button
                              onClick={() => !isLoading && handleMarkAsRead(msg.id)}
                              disabled={isLoading || isDeleting}
                              className={`text-green-600 hover:text-green-900 p-1 ${(isLoading || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                              title={isLoading ? 'Processing...' : 'Mark as Read'}
                              aria-label="Mark message as read"
                            >
                              {isLoading ? (
                                <span className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></span>
                              ) : (
                                <FaCheckCircle className="w-4 h-4" />
                              )}
                            </button>
                          )}
                          
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            disabled={isLoading || isDeleting}
                            className={`text-red-600 hover:text-red-900 p-1 ${(isLoading || isDeleting) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isDeleting ? 'Deleting...' : 'Delete'}
                            aria-label="Delete message"
                          >
                            {isDeleting ? (
                              <span className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></span>
                            ) : (
                              <FaTrash className="w-4 h-4" />
                            )}
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
                Showing {localMessages.length} of {localMessages.length} messages
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const csvContent = convertToCSV(localMessages);
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
                  const nonAdminMsg = localMessages.find(msg => !isFromAdmin(msg));
                  if (nonAdminMsg) {
                    handleReply(nonAdminMsg);
                  } else {
                    setActionError('No applicant messages found');
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
                onClick={handleMarkAllAsRead}
                disabled={loadingActions['all']}
                className={`text-sm font-medium ${loadingActions['all'] ? 'text-blue-400 cursor-not-allowed' : 'text-blue-700 hover:text-blue-900'}`}
              >
                {loadingActions['all'] ? 'Processing...' : 'Mark All Read →'}
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
                  const csvContent = convertToCSV(localMessages);
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