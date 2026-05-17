import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  FaBriefcase, 
  FaClipboardCheck, 
  FaUser, 
  FaChartLine,
  FaBuilding,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaFilter,
  FaDownload,
  FaFileAlt,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaPaperPlane,
  FaStar,
  FaRegStar,
  FaTimes,
  FaInbox,
  FaBell,
  FaReply,
  FaCheckDouble,
  FaRegCheckCircle,
  FaUserCircle,
  FaArrowLeft,
  FaShieldAlt
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

const ESSOfficerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Applications state
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [applicationSearchTerm, setApplicationSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Messages state
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [sendingReply, setSendingReply] = useState(false);
  const [messageSearchTerm, setMessageSearchTerm] = useState('');
  const [messageFilter, setMessageFilter] = useState('all');
  const [showMessageDetails, setShowMessageDetails] = useState(false);
  const [messageDetails, setMessageDetails] = useState(null);
  const [showMobileConversation, setShowMobileConversation] = useState(false);
  const [senderProfiles, setSenderProfiles] = useState({});
  const [adminUserId, setAdminUserId] = useState(null);
  
  const messagesEndRef = useRef(null);
  const replyInputRef = useRef(null);
  
  // Stats
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    shortlistedApplications: 0,
    hiredApplications: 0,
    totalMessages: 0,
    unreadMessages: 0
  });
  
  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    company_logo: '',
    job_image: '',
    location: '',
    job_type: 'internship',
    category: 'Technology',
    description: '',
    requirements: '',
    salary_range: '',
    deadline: '',
    is_active: true
  });
  
  // Edit Job Form State
  const [editJob, setEditJob] = useState({
    title: '',
    company: '',
    company_logo: '',
    job_image: '',
    location: '',
    job_type: 'internship',
    category: 'Technology',
    description: '',
    requirements: '',
    salary_range: '',
    deadline: '',
    is_active: true
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobSearchTerm, jobs]);

  useEffect(() => {
    filterApplications();
  }, [applicationSearchTerm, statusFilter, applications]);

  useEffect(() => {
    filterMessages();
  }, [messageSearchTerm, messageFilter, messages]);

  useEffect(() => {
    if (selectedMessage && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedMessage]);

  useEffect(() => {
    if (selectedMessage && replyInputRef.current) {
      replyInputRef.current.focus();
    }
  }, [selectedMessage]);

  const checkUserAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
      // Get current admin/ESS user ID
      setAdminUserId(user.id);
      
      // Check if user has ESS Officer role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role !== 'ess_officer' && profile?.role !== 'admin') {
        navigate('/unauthorized');
        return;
      }
      
      setUser(user);
      await fetchJobs();
      await fetchApplications();
      await fetchMessages();
      await fetchSenderProfiles();
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setJobs(data || []);
      setFilteredJobs(data || []);
      
      setStats(prev => ({
        ...prev,
        totalJobs: data?.length || 0,
        activeJobs: data?.filter(job => job.is_active).length || 0
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Error fetching jobs: ' + error.message);
    }
  };

  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (*),
          profiles:user_id (id, full_name, email, avatar_url, phone)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setApplications(data || []);
      setFilteredApplications(data || []);
      
      const pending = data?.filter(app => app.status === 'pending').length || 0;
      const reviewed = data?.filter(app => app.status === 'reviewed').length || 0;
      const shortlisted = data?.filter(app => app.status === 'shortlisted').length || 0;
      const hired = data?.filter(app => app.status === 'accepted').length || 0;
      
      setStats(prev => ({
        ...prev,
        totalApplications: data?.length || 0,
        pendingApplications: pending,
        reviewedApplications: reviewed,
        shortlistedApplications: shortlisted,
        hiredApplications: hired
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Error fetching applications: ' + error.message);
    }
  };

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('application_messages')
        .select(`
          *,
          sender:sender_id (id, email, full_name),
          receiver:receiver_id (id, email, full_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const enhancedMessages = (data || []).map(msg => ({
        ...msg,
        is_from_admin: msg.sender_id === adminUserId,
        sender_name: msg.sender?.full_name || (msg.sender_id === adminUserId ? 'You (ESS)' : 'Applicant'),
        receiver_name: msg.receiver?.full_name || 'User'
      }));
      
      setMessages(enhancedMessages);
      setFilteredMessages(enhancedMessages);
      
      const unreadCount = enhancedMessages.filter(msg => !msg.is_read && msg.receiver_id === adminUserId).length;
      
      setStats(prev => ({
        ...prev,
        totalMessages: enhancedMessages.length,
        unreadMessages: unreadCount
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const fetchSenderProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, avatar_url, phone, role');
      
      if (!error && data) {
        const profilesMap = {};
        data.forEach(profile => {
          profilesMap[profile.id] = profile;
        });
        setSenderProfiles(profilesMap);
      }
    } catch (error) {
      console.error('Error fetching sender profiles:', error);
    }
  };

  const filterJobs = () => {
    if (!jobSearchTerm.trim()) {
      setFilteredJobs(jobs);
      return;
    }
    
    const filtered = jobs.filter(job =>
      job.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.company?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.category?.toLowerCase().includes(jobSearchTerm.toLowerCase())
    );
    
    setFilteredJobs(filtered);
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    if (applicationSearchTerm) {
      filtered = filtered.filter(app =>
        app.jobs?.title?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.jobs?.company?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.full_name?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(applicationSearchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(filtered);
  };

  const filterMessages = () => {
    let filtered = [...messages];
    
    if (messageSearchTerm) {
      filtered = filtered.filter(msg =>
        msg.sender_name?.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
        msg.message?.toLowerCase().includes(messageSearchTerm.toLowerCase()) ||
        msg.email?.toLowerCase().includes(messageSearchTerm.toLowerCase())
      );
    }
    
    switch (messageFilter) {
      case 'unread':
        filtered = filtered.filter(msg => !msg.is_read && msg.receiver_id === adminUserId);
        break;
      case 'read':
        filtered = filtered.filter(msg => msg.is_read);
        break;
      case 'from_applicants':
        filtered = filtered.filter(msg => msg.sender_id !== adminUserId);
        break;
      case 'from_admin':
        filtered = filtered.filter(msg => msg.sender_id === adminUserId);
        break;
      default:
        break;
    }
    
    setFilteredMessages(filtered);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('jobs')
        .insert([{
          ...newJob,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setShowCreateJobModal(false);
      setNewJob({
        title: '',
        company: '',
        company_logo: '',
        job_image: '',
        location: '',
        job_type: 'internship',
        category: 'Technology',
        description: '',
        requirements: '',
        salary_range: '',
        deadline: '',
        is_active: true
      });
      
      await fetchJobs();
      alert('Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job: ' + error.message);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          ...editJob,
          updated_at: new Date().toISOString()
        })
        .eq('id', editJob.id);
      
      if (error) throw error;
      
      setShowEditJobModal(false);
      await fetchJobs();
      alert('Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job: ' + error.message);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id);
      
      if (error) throw error;
      
      setShowDeleteModal(false);
      setJobToDelete(null);
      await fetchJobs();
      alert('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job: ' + error.message);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(true);
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      await supabase
        .from('application_status_history')
        .insert([{
          application_id: applicationId,
          status: newStatus,
          notes: `Status updated by ESS Officer`,
          created_at: new Date().toISOString()
        }]);
      
      await fetchApplications();
      alert(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleMarkMessageAsRead = async (messageId) => {
    try {
      const { error } = await supabase
        .from('application_messages')
        .update({ is_read: true })
        .eq('id', messageId);
      
      if (error) throw error;
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));
      
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(prev => ({ ...prev, is_read: true }));
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage || sendingReply) return;

    setSendingReply(true);
    
    try {
      let receiverId = selectedMessage.sender_id;
      let applicationId = selectedMessage.application_id;
      
      // If no application_id, find related application
      if (!applicationId && selectedMessage.email) {
        const { data: application } = await supabase
          .from('applications')
          .select('id')
          .eq('email', selectedMessage.email)
          .limit(1)
          .single();
        applicationId = application?.id;
      }
      
      const { data: newMessage, error } = await supabase
        .from('application_messages')
        .insert([{
          application_id: applicationId,
          sender_id: adminUserId,
          receiver_id: receiverId,
          message: replyText.trim(),
          subject: `Re: ${selectedMessage.subject || 'Your Message'}`,
          is_read: false,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      const enhancedMessage = {
        ...newMessage,
        is_from_admin: true,
        sender_name: 'You (ESS)',
        receiver_name: selectedMessage.sender_name
      };
      
      setMessages(prev => [enhancedMessage, ...prev]);
      setReplyText('');
      
      if (selectedMessage) {
        setSelectedMessage(prev => ({
          ...prev,
          messages: [...(prev.messages || []), enhancedMessage]
        }));
      }
      
      await fetchMessages();
      
    } catch (error) {
      console.error('Error sending reply:', error);
      alert('Failed to send reply: ' + error.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      const { error } = await supabase
        .from('application_messages')
        .delete()
        .eq('id', messageId);
      
      if (error) throw error;
      
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      if (selectedMessage?.id === messageId) {
        setSelectedMessage(null);
        setShowMobileConversation(false);
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const getConversationHistory = (message) => {
    if (!message) return [];
    
    return messages.filter(msg => 
      msg.sender_id === message.sender_id ||
      msg.receiver_id === message.sender_id ||
      msg.application_id === message.application_id ||
      msg.email === message.email
    ).sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
  };

  const handleImageUpload = async (file, type, isEdit = false) => {
    if (!file) return;
    
    try {
      setUploading(true);
      setUploadType(type);
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `job-portal-images/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('job-portal-images')
        .upload(filePath, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('job-portal-images')
        .getPublicUrl(filePath);
      
      if (isEdit) {
        setEditJob(prev => ({ ...prev, [type]: publicUrl }));
      } else {
        setNewJob(prev => ({ ...prev, [type]: publicUrl }));
      }
      
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
      setUploadType('');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interviewed: 'bg-indigo-100 text-indigo-800',
      offered: 'bg-green-100 text-green-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getJobTypeColor = (jobType) => {
    const colors = {
      internship: 'bg-purple-100 text-purple-800',
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      contract: 'bg-orange-100 text-orange-800'
    };
    return colors[jobType] || 'bg-gray-100 text-gray-800';
  };

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

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
            <p className="text-xs text-green-600 mt-1">{stats.activeJobs} active</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FaBriefcase className="w-6 h-6 text-green-900" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            <p className="text-xs text-yellow-600 mt-1">{stats.pendingApplications} pending</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaClipboardCheck className="w-6 h-6 text-blue-900" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Shortlisted</p>
            <p className="text-3xl font-bold text-gray-900">{stats.shortlistedApplications}</p>
            <p className="text-xs text-purple-600 mt-1">For interview</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FaUserCheck className="w-6 h-6 text-purple-900" />
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Unread Messages</p>
            <p className="text-3xl font-bold text-red-600">{stats.unreadMessages}</p>
            <p className="text-xs text-gray-600 mt-1">Total: {stats.totalMessages}</p>
          </div>
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
            <FaInbox className="w-6 h-6 text-red-900" />
          </div>
        </div>
      </div>
    </div>
  );

  // Conversation List Component
  const ConversationList = () => (
    <div className={`${showMobileConversation ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 border-r border-gray-200 bg-white`}>
      <div className="p-4 border-b border-gray-200">
        <div className="relative mb-3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={messageSearchTerm}
            onChange={(e) => setMessageSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'unread', 'from_applicants', 'from_admin'].map((type) => (
            <button
              key={type}
              onClick={() => setMessageFilter(type)}
              className={`px-3 py-1 text-xs rounded-full transition-colors ${
                messageFilter === type 
                  ? 'bg-green-900 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' && 'All'}
              {type === 'unread' && `Unread (${messages.filter(m => !m.is_read && m.receiver_id === adminUserId).length})`}
              {type === 'from_applicants' && 'From Applicants'}
              {type === 'from_admin' && 'From Me'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredMessages.length === 0 ? (
          <div className="p-8 text-center">
            <FaInbox className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No messages found</p>
          </div>
        ) : (
          filteredMessages.map((msg) => {
            const isUnread = !msg.is_read && msg.receiver_id === adminUserId;
            const senderName = msg.sender_name || (msg.sender_id === adminUserId ? 'You' : 'Applicant');
            
            return (
              <div
                key={msg.id}
                onClick={() => {
                  setSelectedMessage(msg);
                  setShowMobileConversation(true);
                  if (isUnread) handleMarkMessageAsRead(msg.id);
                }}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                  selectedMessage?.id === msg.id ? 'bg-green-50 border-l-4 border-l-green-900' : ''
                } ${isUnread ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      msg.sender_id === adminUserId ? 'bg-green-100' : 'bg-purple-100'
                    }`}>
                      {msg.sender_id === adminUserId ? 
                        <FaShieldAlt className="w-5 h-5 text-green-900" /> : 
                        ""
                      }
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-medium truncate ${isUnread ? 'text-gray-900 font-semibold' : 'text-gray-700'}`}>
                        {senderName}
                        {msg.sender_id === adminUserId && <span className="ml-2 text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded">ESS</span>}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                        {formatMessageTime(msg.created_at)}
                      </span>
                    </div>
                    <p className={`text-sm truncate ${isUnread ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                      {msg.message?.substring(0, 60)}...
                    </p>
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

  // Conversation Detail Component
  const ConversationDetail = () => {
    const conversationHistory = getConversationHistory(selectedMessage);
    
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

    const senderName = selectedMessage.sender_name || (selectedMessage.sender_id === adminUserId ? 'You' : 'Applicant');

    return (
      <div className="flex flex-col flex-1 bg-gray-50">
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
                {selectedMessage.sender_id === adminUserId ? 
                  <FaShieldAlt className="w-5 h-5 text-green-900" /> : 
                  <FaUser className="w-5 h-5 text-purple-900" />
                }
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{senderName}</h3>
                <p className="text-xs text-gray-500">
                  {selectedMessage.email || (selectedMessage.sender_id === adminUserId ? 'ESS Officer' : 'Applicant')}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              {selectedMessage.application_id && (
                <button
                  onClick={() => {
                    const app = applications.find(a => a.id === selectedMessage.application_id);
                    if (app) {
                      setSelectedApplication(app);
                      setShowApplicationDetails(true);
                    }
                  }}
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

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {conversationHistory.length === 0 ? (
            <div className="text-center py-8">
              <FaEnvelope className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No conversation history</p>
            </div>
          ) : (
            conversationHistory.map((msg) => {
              const isMyMessage = msg.sender_id === adminUserId;
              const msgSenderName = msg.sender_name || (isMyMessage ? 'You (ESS)' : 'Applicant');
              
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
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

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

  const MessagesTab = () => (
    <div className="h-[calc(100vh-350px)] min-h-[500px] bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="flex h-full">
        <ConversationList />
        <ConversationDetail />
      </div>
    </div>
  );

  const JobsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Jobs</h2>
          <p className="text-gray-600">Create, edit, and manage job postings</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowCreateJobModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Add Job</span>
          </button>
          <button
            onClick={fetchJobs}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaSync className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <FaBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Found</h3>
          <p className="text-gray-600">Create your first job posting to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {job.job_image && (
                <img src={job.job_image} alt={job.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-green-900 font-medium">{job.company}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.job_type)}`}>
                    {job.job_type?.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    {job.salary_range || 'Competitive'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="w-4 h-4 mr-2 text-gray-400" />
                    Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditJob(job);
                        setShowEditJobModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setJobToDelete(job);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Manage Applications</h2>
          <p className="text-gray-600">Review and process job applications</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search applications..."
              value={applicationSearchTerm}
              onChange={(e) => setApplicationSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchApplications}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaSync className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <FaClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Found</h3>
          <p className="text-gray-600">Applications will appear here when candidates apply</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{app.full_name || app.profiles?.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{app.jobs?.title || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{app.jobs?.company}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                        disabled={updatingStatus}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-green-500 ${getStatusColor(app.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="offered">Offered</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setSelectedApplication(app);
                            setShowApplicationDetails(true);
                          }}
                          className="text-green-900 hover:text-green-700 font-medium text-sm flex items-center space-x-1"
                        >
                          <FaEye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                        <button
                          onClick={() => {
                            // Find message for this application
                            const msg = messages.find(m => m.application_id === app.id);
                            if (msg) {
                              setSelectedMessage(msg);
                              setActiveTab('messages');
                            } else {
                              alert('No conversation started for this application yet');
                            }
                          }}
                          className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                        >
                          <FaEnvelope className="w-4 h-4" />
                          <span>Message</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Modals (CreateJobModal, EditJobModal, DeleteConfirmModal, ApplicationDetailsModal)
  const CreateJobModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Create New Job</h3>
            <button onClick={() => setShowCreateJobModal(false)} className="text-gray-400 hover:text-gray-600">
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                <input
                  type="text"
                  value={newJob.company}
                  onChange={(e) => setNewJob({...newJob, company: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={newJob.job_type}
                  onChange={(e) => setNewJob({...newJob, job_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input
                type="text"
                value={newJob.salary_range}
                onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="e.g., $50,000 - $70,000"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <textarea
                value={newJob.requirements}
                onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
                <input
                  type="date"
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newJob.category}
                  onChange={(e) => setNewJob({...newJob, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'company_logo', false)}
                  className="w-full"
                />
                {uploading && uploadType === 'company_logo' && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'job_image', false)}
                  className="w-full"
                />
                {uploading && uploadType === 'job_image' && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setShowCreateJobModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800">
                Create Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  const ApplicationDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Application Details</h3>
            <button onClick={() => setShowApplicationDetails(false)} className="text-gray-400 hover:text-gray-600">
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Applicant Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedApplication.full_name || selectedApplication.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedApplication.phone || selectedApplication.profiles?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applied Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Job Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium text-gray-900">{selectedApplication.jobs?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Company</p>
                    <p className="font-medium text-gray-900">{selectedApplication.jobs?.company}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{selectedApplication.jobs?.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium text-gray-900">{selectedApplication.jobs?.job_type}</p>
                  </div>
                </div>
              </div>
              
              {selectedApplication.cover_letter && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                </div>
              )}
              
              {selectedApplication.resume_url && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Resume/CV</h4>
                  <a
                    href={selectedApplication.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-green-900 hover:text-green-700"
                  >
                    <FaFileAlt className="w-4 h-4" />
                    <span>View Resume</span>
                  </a>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowApplicationDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowApplicationDetails(false);
                    const msg = messages.find(m => m.application_id === selectedApplication.id);
                    if (msg) {
                      setSelectedMessage(msg);
                      setActiveTab('messages');
                    } else {
                      alert('Start a conversation by sending a message');
                    }
                  }}
                  className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 flex items-center space-x-2"
                >
                  <FaEnvelope className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button onClick={handleDeleteJob} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ESS Officer Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-950 to-green-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">ESS Officer Dashboard</h1>
              <p className="text-green-200 mt-1">Manage jobs, applications, and messages</p>
            </div>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards />
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6 overflow-x-auto">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'jobs'
                    ? 'border-green-900 text-green-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBriefcase className="inline mr-2" />
                Manage Jobs
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'applications'
                    ? 'border-green-900 text-green-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaClipboardCheck className="inline mr-2" />
                Manage Applications
              </button>
              <button
                onClick={() => setActiveTab('messages')}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === 'messages'
                    ? 'border-green-900 text-green-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaEnvelope className="inline mr-2" />
                Messages
                {stats.unreadMessages > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                    {stats.unreadMessages}
                  </span>
                )}
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'jobs' && <JobsTab />}
            {activeTab === 'applications' && <ApplicationsTab />}
            {activeTab === 'messages' && <MessagesTab />}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showCreateJobModal && <CreateJobModal />}
      {showEditJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Job</h3>
                <button onClick={() => setShowEditJobModal(false)} className="text-gray-400 hover:text-gray-600">
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateJob} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={editJob.title}
                      onChange={(e) => setEditJob({...editJob, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company *</label>
                    <input
                      type="text"
                      value={editJob.company}
                      onChange={(e) => setEditJob({...editJob, company: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowEditJobModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800">
                    Update Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && <DeleteConfirmModal />}
      {showApplicationDetails && <ApplicationDetailsModal />}
    </div>
  );
};

export default ESSOfficerDashboard;