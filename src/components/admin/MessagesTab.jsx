import React, { useState, useEffect, useRef } from 'react';
import { 
  FaInbox, FaSync, FaBell, FaEnvelope, FaUserFriends, 
  FaReply, FaCheckCircle, FaEye, FaPaperPlane, FaDownload,
  FaUser, FaTrash, FaExclamationCircle, FaShieldAlt, FaTimes,
  FaUserCircle, FaCalendarAlt, FaPhone, FaMapMarkerAlt,
  FaSearch, FaFilter, FaArrowLeft, FaCheckDouble, FaRegCheckCircle,
  FaClock, FaBuilding, FaBriefcase
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
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
  // State
  const [localMessages, setLocalMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all'); // all, unread, read, from_applicants, from_admin
  const [loadingActions, setLoadingActions] = useState({});
  const [actionError, setActionError] = useState(null);
  const [senderProfiles, setSenderProfiles] = useState({});
  const [adminUserId, setAdminUserId] = useState(null);
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  
  const messagesEndRef = useRef(null);
  const replyInputRef = useRef(null);

  // Initialize
  useEffect(() => {
    if (applicationMessages && applicationMessages.length > 0) {
      const sortedMessages = [...applicationMessages].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setLocalMessages(sortedMessages);
      setFilteredMessages(sortedMessages);
      fetchSenderProfiles(applicationMessages);
    }
  }, [applicationMessages]);

  // Get current admin user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAdminUserId(user.id);
      }
    };
    getCurrentUser();
  }, []);

  // Filter messages
  useEffect(() => {
    let filtered = [...localMessages];
    
    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(msg => 
        getSenderName(msg).toLowerCase().includes(searchTerm.toLowerCase()) ||
        getSenderEmail(msg).toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.subject?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Type filter
    switch (filterType) {
      case 'unread':
        filtered = filtered.filter(msg => !msg.is_read);
        break;
      case 'read':
        filtered = filtered.filter(msg => msg.is_read);
        break;
      case 'from_applicants':
        filtered = filtered.filter(msg => !isFromAdmin(msg));
        break;
      case 'from_admin':
        filtered = filtered.filter(msg => isFromAdmin(msg));
        break;
      default:
        break;
    }
    
    setFilteredMessages(filtered);
  }, [searchTerm, filterType, localMessages]);

  // Scroll to bottom when new message selected
  useEffect(() => {
    if (selectedMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMessage]);

  // Focus reply input when replying
  useEffect(() => {
    if (selectedMessage && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [selectedMessage]);

  // Fetch sender profiles
  const fetchSenderProfiles = async (messages) => {
    try {
      const senderIds = [...new Set(messages.map(msg => msg.sender_id).filter(Boolean))];
      if (senderIds.length === 0) return;

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone, role')
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

  // Get sender name
  const getSenderName = (message) => {
    if (message.full_name) return message.full_name;
    if (message.sender_id && senderProfiles[message.sender_id]) {
      return senderProfiles[message.sender_id].full_name || 
             senderProfiles[message.sender_id].email?.split('@')[0] || 
             'User';
    }
    if (message.sender_id === adminUserId) return 'You (Admin)';
    if (message.message_type === 'contact_form') return message.full_name || 'Applicant';
    if (message.message_type === 'admin_reply') return 'Admin';
    return 'Unknown User';
  };

  // Get sender email
  const getSenderEmail = (message) => {
    if (message.email) return message.email;
    if (message.sender_id && senderProfiles[message.sender_id]) {
      return senderProfiles[message.sender_id].email;
    }
    return 'No email';
  };

  // Get sender avatar
  const getSenderAvatar = (message) => {
    if (message.sender_id && senderProfiles[message.sender_id]) {
      return senderProfiles[message.sender_id].avatar_url;
    }
    return null;
  };

  // Check if message is from admin
  const isFromAdmin = (message) => {
    return message.sender_id === adminUserId || 
           message.message_type === 'admin_reply' ||
           message.full_name?.includes('Admin');
  };

  // Mark message as read
  const handleMarkAsRead = async (messageId) => {
    if (!markMessageAsRead) return;

    setLoadingActions(prev => ({ ...prev, [messageId]: true }));
    
    try {
      await markMessageAsRead(messageId);
      setLocalMessages(prev => 
        prev.map(msg => msg.id === messageId ? { ...msg, is_read: true } : msg)
      );
    } catch (error) {
      console.error('Error marking as read:', error);
      setActionError('Failed to mark as read');
    } finally {
      setLoadingActions(prev => ({ ...prev, [messageId]: false }));
    }
  };

  // Send reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage || sendingReply) return;

    setSendingReply(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Determine receiver ID
      let receiverId = selectedMessage.sender_id;
      if (!receiverId && selectedMessage.email) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('email', selectedMessage.email)
          .single();
        receiverId = profile?.id;
      }

      // Insert reply message
      const { data: newMessage, error } = await supabase
        .from('application_messages')
        .insert([{
          application_id: selectedMessage.application_id,
          sender_id: user.id,
          receiver_id: receiverId,
          message: replyText.trim(),
          subject: `Re: ${selectedMessage.subject || 'Your Message'}`,
          is_read: false,
          created_at: new Date().toISOString(),
          message_type: 'admin_reply'
        }])
        .select()
        .single();

      if (error) throw error;

      // Add to local messages
      const enhancedMessage = {
        ...newMessage,
        full_name: user.user_metadata?.full_name || 'Admin',
        email: user.email
      };
      
      setLocalMessages(prev => [enhancedMessage, ...prev]);
      
      // Clear reply and refresh
      setReplyText('');
      setSelectedMessage(enhancedMessage);
      
      // Fetch fresh messages
      if (fetchApplicationMessages) {
        fetchApplicationMessages();
      }
      
    } catch (error) {
      console.error('Error sending reply:', error);
      setActionError('Failed to send reply');
    } finally {
      setSendingReply(false);
    }
  };

  // Delete message
  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    setLoadingActions(prev => ({ ...prev, [`delete_${messageId}`]: true }));
    
    try {
      if (deleteMessage) {
        await deleteMessage(messageId);
      } else {
        const { error } = await supabase
          .from('application_messages')
          .delete()
          .eq('id', messageId);
        if (error) throw error;
      }
      
      setLocalMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
        setShowMobileConversation(false);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      setActionError('Failed to delete message');
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete_${messageId}`]: false }));
    }
  };

  // View application details
  const handleViewApplication = async (message) => {
    if (!setShowApplicationDetails || !setSelectedApplication) return;

    let application = null;
    
    if (message.application_id) {
      const { data } = await supabase
        .from('applications')
        .select('*, jobs:job_id (*)')
        .eq('id', message.application_id)
        .single();
      application = data;
    } else if (message.email) {
      const { data } = await supabase
        .from('applications')
        .select('*, jobs:job_id (*)')
        .eq('email', message.email)
        .limit(1);
      application = data?.[0];
    }

    if (application) {
      setSelectedApplication(application);
      setShowApplicationDetails(true);
    } else {
      setActionError('No related application found');
    }
  };

  // Format time
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return format(date, 'h:mm a');
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return format(date, 'EEE');
    } else {
      return format(date, 'MMM d');
    }
  };

  // Get conversation history for selected message
  const getConversationHistory = () => {
    if (!selectedMessage) return [];
    
    // Get all messages from same sender or related application
    return localMessages.filter(msg => 
      msg.sender_id === selectedMessage.sender_id ||
      msg.receiver_id === selectedMessage.sender_id ||
      msg.application_id === selectedMessage.application_id ||
      msg.email === selectedMessage.email
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  };

  // Stats
  const unreadCount = localMessages.filter(msg => !msg.is_read).length;
  const fromApplicantsCount = localMessages.filter(msg => !isFromAdmin(msg)).length;
  const fromAdminCount = localMessages.filter(msg => isFromAdmin(msg)).length;

  // Conversation component for mobile/desktop
  const ConversationList = () => (
    <div className={`${showMobileConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 lg:w-1/3 border-r border-gray-200 bg-white`}>
      {/* Search and Filter */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex space-x-2">
          {['all', 'unread', 'read', 'from_applicants', 'from_admin'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                filterType === type 
                  ? 'bg-green-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' && 'All'}
              {type === 'unread' && `Unread (${unreadCount})`}
              {type === 'read' && 'Read'}
              {type === 'from_applicants' && 'Applicants'}
              {type === 'from_admin' && 'Admin'}
            </button>
          ))}
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center">
            <FaInbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isUnread = !msg.is_read;
            const senderName = getSenderName(msg);
            const isAdmin = isFromAdmin(msg);
            
            return (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  setShowMobileConversation(true);
                  if (isUnread) handleMarkAsRead(msg.id);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedMessage?.id === msg.id ? 'bg-green-50 border-l-4 border-l-green-900' : ''
                } ${isUnread ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      isAdmin ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {getSenderAvatar(msg) ? (
                        <img src={getSenderAvatar(msg)} alt={senderName} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        isAdmin ? <FaShieldAlt className="w-5 h-5 text-green-900" /> : <FaUser className="w-5 h-5 text-purple-900" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                        {senderName}
                        {isAdmin && <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">Admin</span>}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {msg.message?.substring(0, 60)}...
                    </p>
                    {msg.subject && (
                      <p className="text-xs text-gray-400 truncate">Subject: {msg.subject}</p>
                    )}
                  </div>
                  {isUnread && (
                    <div className="w-2 h-2 bg-green-900 rounded-full flex-shrink-0 mt-2"></div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const ConversationDetail = () => {
    const conversationHistory = getConversationHistory();
    
    if (!selectedMessage) {
      return (
        <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-50">
          <FaInbox className="w-16 h-16 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select a message</h3>
          <p className="text-gray-500 text-center max-w-md">
            Choose a conversation from the list to view messages and reply to applicants
          </p>
        </div>
      );
    }

    const senderName = getSenderName(selectedMessage);
    const senderEmail = getSenderEmail(selectedMessage);
    const isFromAdminMsg = isFromAdmin(selectedMessage);

    return (
      <div className="flex flex-col flex-1 bg-gray-50">
        {/* Conversation Header */}
        <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowMobileConversation(false)}
                className="md:hidden text-gray-600 hover:text-gray-900"
              >
                <FaArrowLeft className="w-5 h-5" />
              </button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 flex items-center justify-center">
                {getSenderAvatar(selectedMessage) ? (
                  <img src={getSenderAvatar(selectedMessage)} alt={senderName} className="w-10 h-10 rounded-full object-cover" />
                ) : (
                  isFromAdminMsg ? <FaShieldAlt className="w-5 h-5 text-green-900" /> : <FaUser className="w-5 h-5 text-purple-900" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{senderName}</h3>
                <p className="text-xs text-gray-500">{senderEmail}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              {selectedMessage.application_id && (
                <button
                  onClick={() => handleViewApplication(selectedMessage)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="View Application"
                >
                  <FaBriefcase className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => handleDeleteMessage(selectedMessage.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Message"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Messages Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationHistory.length === 0 ? (
            <div className="text-center py-8">
              <FaEnvelope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversation history</p>
            </div>
          ) : (
            conversationHistory.map((msg) => {
              const isMyMessage = isFromAdmin(msg);
              const msgSenderName = getSenderName(msg);
              
              return (
                <div key={msg.id} className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md ${isMyMessage ? 'order-2' : 'order-1'}`}>
                    <div className={`px-4 py-2 rounded-2xl ${
                      isMyMessage 
                        ? 'bg-green-900 text-white rounded-br-none' 
                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                    }`}>
                      {!isMyMessage && (
                        <p className="text-xs font-medium text-gray-500 mb-1">{msgSenderName}</p>
                      )}
                      <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                      {msg.subject && (
                        <p className="text-xs opacity-75 mt-1">Subject: {msg.subject}</p>
                      )}
                      <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                        isMyMessage ? 'text-green-200' : 'text-gray-400'
                      }`}>
                        <span>{format(new Date(msg.created_at), 'h:mm a')}</span>
                        {isMyMessage && (
                          msg.is_read ? <FaCheckDouble className="w-3 h-3" /> : <FaRegCheckCircle className="w-3 h-3" />
                        )}
                      </div>
                    </div>
                  </div>
                  {!isMyMessage && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center ml-2 order-1">
                      {getSenderAvatar(msg) ? (
                        <img src={getSenderAvatar(msg)} alt="" className="w-8 h-8 rounded-full object-cover" />
                      ) : (
                        <FaUser className="w-4 h-4 text-gray-500" />
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Input */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                ref={replyInputRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={`Reply to ${senderName}...`}
                rows="2"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <p className="text-xs text-gray-400 mt-1">Press Enter to send, Shift+Enter for new line</p>
            </div>
            <button
              onClick={handleSendReply}
              disabled={!replyText.trim() || sendingReply}
              className="px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sendingReply ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <FaPaperPlane className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Error alert
  if (actionError) {
    setTimeout(() => setActionError(null), 3000);
  }

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Messages</p>
              <p className="text-2xl font-bold text-gray-900">{localMessages.length}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FaInbox className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-2xl font-bold text-blue-600">{unreadCount}</p>
            </div>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FaBell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">From Applicants</p>
              <p className="text-2xl font-bold text-purple-600">{fromApplicantsCount}</p>
            </div>
            <div className="p-2 bg-purple-50 rounded-lg">
              <FaUserFriends className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">From Admin</p>
              <p className="text-2xl font-bold text-green-600">{fromAdminCount}</p>
            </div>
            <div className="p-2 bg-green-50 rounded-lg">
              <FaShieldAlt className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Messaging Interface */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-[calc(100vh-350px)] min-h-[500px]">
        <div className="flex h-full">
          <ConversationList />
          <ConversationDetail />
        </div>
      </div>

      {/* Error Toast */}
      {actionError && (
        <div className="fixed bottom-4 right-4 z-50 animate-fadeIn">
          <div className="flex items-center space-x-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg shadow-lg">
            <FaExclamationCircle className="w-5 h-5" />
            <span>{actionError}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesTab;