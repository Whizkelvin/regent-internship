import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { 
  FaHome, 
  FaSearch, 
  FaEdit, 
  FaPaperPlane, 
  FaUserCircle, 
  FaRegBell, 
  FaEllipsisV, 
  FaCheckDouble, 
  FaRegCheckCircle, 
  FaClock,
  FaBuilding,
  FaBriefcase,
  FaGraduationCap,
  FaTrash,
  FaArchive,
  FaFilter,
  FaSort,
  FaTimes
} from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { format, formatDistanceToNow } from 'date-fns';

const Message = () => {
    const navigate = useNavigate();
    
    const [activeChat, setActiveChat] = useState(null);
    const [message, setMessage] = useState('');
    const [conversations, setConversations] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sendingMessage, setSendingMessage] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [showNewMessageModal, setShowNewMessageModal] = useState(false);
    const [selectedRecipient, setSelectedRecipient] = useState('');
    const [newMessageText, setNewMessageText] = useState('');
    const [applications, setApplications] = useState([]);
    const [user, setUser] = useState(null);

    useEffect(() => {
        fetchUserAndData();
    }, []);

    useEffect(() => {
        if (activeChat) {
            fetchMessages(activeChat.application_id);
            markMessagesAsRead(activeChat.application_id);
        }
    }, [activeChat]);

    useEffect(() => {
        filterConversations();
    }, [searchTerm, conversations]);

    const fetchUserAndData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            
            if (!user) {
                navigate('/login');
                return;
            }
            
            setUser(user);
            fetchConversations(user);
            fetchApplications(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            navigate('/login');
        }
    };

const fetchConversations = async (currentUser) => {
    try {
        setLoading(true);

        const { data: applicationsData, error } = await supabase
            .from('applications')
            .select(`
                *,
                jobs:job_id (*)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const userRole = currentUser?.user_metadata?.role ?? 'applicant';

        const filteredApplications =
            userRole === 'applicant'
                ? applicationsData.filter(app => app.user_id === currentUser.id)
                : applicationsData;

        const conversationsWithMessages = await Promise.all(
            filteredApplications.map(async (app) => {
                const { data: messagesData } = await supabase
                    .from('application_messages')
                    .select('*')
                    .eq('application_id', app.id)
                    .order('created_at', { ascending: false })
                    .limit(1);

                const lastMessage = messagesData?.[0] || null;
                const unreadCount = await getUnreadCount(app.id, currentUser.id);

                return {
                    id: app.id,
                    application_id: app.id,
                    name:
                        userRole === 'applicant'
                            ? app.jobs?.company_name || 'Employer'
                            : 'Applicant',
                    email: '',
                    avatar: '',
                    role: `Applied for: ${app.jobs?.title}`,
                    job: app.jobs,
                    lastMessage:
                        lastMessage?.message ||
                        'Start a conversation about this application...',
                    lastMessageTime:
                        lastMessage?.created_at || app.created_at,
                    unread: unreadCount,
                    online: false,
                    status: app.status,
                    userRole
                };
            })
        );

        conversationsWithMessages.sort(
            (a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
        );

        setConversations(conversationsWithMessages);
        setFilteredConversations(conversationsWithMessages);
    } catch (error) {
        console.error('Error fetching conversations:', error);
    } finally {
        setLoading(false);
    }
};


 const fetchApplications = async (currentUser) => {
    try {
        const { data: applicationsData, error } = await supabase
            .from('applications')
            .select(`
                *,
                jobs:job_id (*),
                profiles:user_id (
                    id,
                    full_name,
                    email
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;

        const userRole = currentUser?.user_metadata?.role ?? 'applicant';

        if (userRole === 'applicant') {
            setApplications(
                applicationsData.filter(app => app.user_id === currentUser.id)
            );
        } else {
            setApplications(applicationsData);
        }
    } catch (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
    }
};


    const getUnreadCount = async (applicationId, userId) => {
        try {
            const { count, error } = await supabase
                .from('application_messages')
                .select('*', { count: 'exact', head: true })
                .eq('application_id', applicationId)
                .eq('is_read', false)
                .neq('sender_id', userId);

            if (error) throw error;
            return count || 0;
        } catch (error) {
            console.error('Error getting unread count:', error);
            return 0;
        }
    };

    const fetchMessages = async (applicationId) => {
        try {
            const { data, error } = await supabase
                .from('application_messages')
                .select(`
                    *,
                    sender:profiles!sender_id (full_name, avatar_url),
                    receiver:profiles!receiver_id (full_name, avatar_url)
                `)
                .eq('application_id', applicationId)
                .order('created_at', { ascending: true });

            if (!error) setMessages(data || []);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const markMessagesAsRead = async (applicationId) => {
    if (!user) return;

    try {
        await supabase
            .from('application_messages')
            .update({ is_read: true })
            .eq('application_id', applicationId)
            .neq('sender_id', user.id)
            .eq('is_read', false);
    } catch (error) {
        console.error('Error marking messages as read:', error);
    }
};
    const filterConversations = () => {
        if (!searchTerm.trim()) {
            setFilteredConversations(conversations);
            return;
        }

        const filtered = conversations.filter(conv =>
            conv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.job?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.status.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredConversations(filtered);
    };

const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!message.trim() || !activeChat || !user) return;

    try {
        setSendingMessage(true);

        // ✅ SAFELY RESOLVE APPLICATION ID
        const applicationId = activeChat.application_id || activeChat.id;

        if (!applicationId) {
            throw new Error('Application not found');
        }

        // 1️⃣ Fetch application (single source of truth)
        const { data: application, error } = await supabase
            .from('applications')
            .select(`
                id,
                user_id,
                job_id,
                jobs:job_id ( user_id )
            `)
            .eq('id', applicationId)
            .single();

        if (error || !application) {
            throw new Error('Application not found');
        }

        // 2️⃣ Define admin ID (replace with your real admin user ID)
        const ADMIN_ID = 'c8a86987-db69-4a56-a9a0-6afc927f7f89'; // <-- replace with your admin's Supabase ID

        // 3️⃣ Send message to admin only
        const { data: newMessage, error: msgError } = await supabase
            .from('application_messages')
            .insert([{
                application_id: application.id,
                sender_id: user.id,
                receiver_id: ADMIN_ID,
                message: message.trim(),
                is_read: false
            }])
            .select()
            .single();

        if (msgError) throw msgError;

        // 4️⃣ Update UI
        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        fetchConversations(user);

    } catch (error) {
        console.error('Error sending message:', error);
        alert(error.message);
    } finally {
        setSendingMessage(false);
    }
};


  const handleStartNewConversation = async (e) => {
    e.preventDefault();
    if (!selectedRecipient || !newMessageText.trim() || !user) return;

    try {
        // selectedRecipient is ALWAYS application.id
        const application = applications.find(
            app => app.id === selectedRecipient
        );

        if (!application) {
            alert('No application found');
            return;
        }

        const userRole = user?.user_metadata?.role ?? 'applicant';
        let receiverId;

        if (userRole === 'applicant') {
            const { data: job, error } = await supabase
                .from('jobs')
                .select('user_id')
                .eq('id', application.job_id)
                .single();

            if (error) throw error;
            receiverId = job.user_id;
        } else {
            receiverId = application.user_id;
        }

        const { error } = await supabase
            .from('application_messages')
            .insert([{
                application_id: application.id,
                sender_id: user.id,
                receiver_id: receiverId,
                message: newMessageText.trim(),
                is_read: false
            }]);

        if (error) throw error;

        setSelectedRecipient('');
        setNewMessageText('');
        setShowNewMessageModal(false);

        await fetchConversations(user);

        setActiveChat({
            application_id: application.id,
            name: userRole === 'applicant'
                ? application.jobs?.company_name
                : application.profiles?.full_name,
            role: `Applied for: ${application.jobs?.title}`,
            job: application.jobs,
            status: application.status,
            email: application.profiles?.email
        });

    } catch (error) {
        console.error('Error starting new conversation:', error);
        alert('Error sending message');
    }
};


    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-800',
            reviewed: 'bg-blue-100 text-blue-800',
            shortlisted: 'bg-purple-100 text-purple-800',
            interviewed: 'bg-indigo-100 text-indigo-800',
            offered: 'bg-green-100 text-green-800',
            rejected: 'bg-red-100 text-red-800',
            accepted: 'bg-green-100 text-green-800',
            withdrawn: 'bg-gray-100 text-gray-800'
        };
        return colors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: FaClock,
            reviewed: FaRegCheckCircle,
            shortlisted: FaBriefcase,
            interviewed: FaUserCircle,
            offered: FaCheckDouble,
            rejected: FaTimes,
            accepted: FaCheckDouble,
            withdrawn: FaArchive
        };
        return icons[status?.toLowerCase()] || FaClock;
    };

    const formatTime = (timestamp) => {
        if (!timestamp) return '';
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

    const NewMessageModal = () => {
        const userRole = user?.user_metadata?.role || 'applicant';
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full">
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-gray-900">New Message</h3>
                            <button
                                onClick={() => setShowNewMessageModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <FaTimes className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleStartNewConversation}>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        {userRole === 'applicant' ? 'Select Job Application' : 'Select Applicant'}
                                    </label>
                                    <select
                                        value={selectedRecipient}
                                        onChange={(e) => setSelectedRecipient(e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                                        required
                                    >
                                        <option value="">Choose {userRole === 'applicant' ? 'a job application' : 'an applicant'}</option>
                                        {applications.map((app) => (
                                            <option 
                                                key={app.id} 
                                                value={userRole === 'applicant' ? app.id : app.user_id}
                                            >
                                                {userRole === 'applicant' 
                                                    ? `${app.jobs?.title} at ${app.jobs?.company_name} (${app.status})`
                                                    : `${app.profiles?.full_name || 'Unknown'} - ${app.jobs?.title} (${app.status})`
                                                }
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Message
                                    </label>
                                    <textarea
                                        value={newMessageText}
                                        onChange={(e) => setNewMessageText(e.target.value)}
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none"
                                        placeholder="Type your message..."
                                        required
                                    />
                                </div>

                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowNewMessageModal(false)}
                                        className="px-4 py-2 text-gray-600 hover:text-gray-900"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-6 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800 font-medium"
                                    >
                                        Send Message
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    };

    if (loading && !activeChat) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 text-lg">Loading messages...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Mobile Header */}
            <div className="bg-gradient-to-r from-green-950 to-green-800 h-16 md:hidden flex items-center justify-between w-full px-4 fixed top-0 z-50 shadow-lg">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                        <IoMdArrowBack className="text-xl" />
                    </button>
                    <div>
                        <p className="text-white font-semibold text-lg">Messages</p>
                        <p className="text-green-200 text-xs">Stay connected</p>
                    </div>
                </div>
                <button 
                    onClick={() => setShowNewMessageModal(true)}
                    className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                >
                    <FaEdit className="text-xl" />
                </button>
            </div>

            {/* Desktop Header */}
            <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
                <div className="flex items-center space-x-4">
                    <img
                        src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                        alt="Regent University Logo"
                        className="w-10 h-10"
                    />
                    <div>
                        <p className="text-2xl font-bold text-gray-900">
                            Regent <span className="text-green-950">Hub</span>
                        </p>
                        <p className="text-gray-600 text-sm">Application Messages</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                   
                    <button
                        onClick={() => navigate("/home")}
                        className="bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2"
                    >
                        <FaHome className="w-4 h-4" />
                        <span>Back to Home</span>
                    </button>
                </div>
            </div>

            <div className="pt-16 md:pt-8 flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]">
                {/* Conversations Sidebar */}
                <div className={`${activeChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white`}>
                    {/* Search Bar */}
                    <div className="p-4 border-b border-gray-200">
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search conversations..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredConversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <FaUserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No conversations found</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {user?.user_metadata?.role === 'applicant' 
                                        ? 'You have no job applications yet.' 
                                        : 'No applicants have messaged yet.'}
                                </p>
                            </div>
                        ) : (
                            filteredConversations.map((conversation) => (
                                <div
                                    key={conversation.id}
                                    onClick={() => setActiveChat(conversation)}
                                    className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                                        activeChat?.application_id === conversation.application_id 
                                            ? 'bg-green-50 border-l-4 border-l-green-900' 
                                            : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center">
                                                {conversation.avatar ? (
                                                    <img
                                                        src={conversation.avatar}
                                                        alt={conversation.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <FaUserCircle className="w-6 h-6 text-green-900" />
                                                )}
                                            </div>
                                            {conversation.online && (
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {conversation.name}
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-xs text-gray-500">
                                                        {formatTime(conversation.lastMessageTime)}
                                                    </span>
                                                    {conversation.unread > 0 && (
                                                        <span className="bg-green-900 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                                                            {conversation.unread}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-600 truncate">{conversation.role}</p>
                                            
                                            {/* Status Badge - Shows application status */}
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(conversation.status)}`}>
                                                    {React.createElement(getStatusIcon(conversation.status), { className: "w-3 h-3 mr-1" })}
                                                    {conversation.status}
                                                </span>
                                            </div>

                                            <div className="mt-2">
                                                <p className="text-sm text-gray-500 truncate">
                                                    {conversation.lastMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 flex-col bg-white`}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 bg-white">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <button
                                            onClick={() => setActiveChat(null)}
                                            className="md:hidden text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                                        >
                                            <IoMdArrowBack className="w-5 h-5" />
                                        </button>
                                        <div className="relative">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center">
                                                {activeChat.avatar ? (
                                                    <img
                                                        src={activeChat.avatar}
                                                        alt={activeChat.name}
                                                        className="w-full h-full rounded-full object-cover"
                                                    />
                                                ) : (
                                                    <FaUserCircle className="w-5 h-5 text-green-900" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{activeChat.name}</h3>
                                            <p className="text-sm text-gray-600">{activeChat.role}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activeChat.status)}`}>
                                                    <span className="mr-1">Application Status:</span> {activeChat.status}
                                                </span>
                                                <span className="text-xs text-gray-500">
                                                    {activeChat.email}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => navigate(`/applications`)}
                                            className="text-green-900 hover:text-green-800 font-medium text-sm"
                                        >
                                            View Application
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <FaPaperPlane className="w-16 h-16 text-gray-300 mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                                        <p className="text-gray-600 max-w-md">
                                            Start the conversation about {activeChat.job?.title} application.
                                        </p>
                                        <p className="text-gray-500 text-sm mt-2">
                                            Current application status: <span className={`font-medium ${getStatusColor(activeChat.status)} px-2 py-1 rounded`}>
                                                {activeChat.status}
                                            </span>
                                        </p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg) => {
                                            const isMe = msg.sender_id === user?.id;
                                            
                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                >
                                                    <div
                                                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                                            isMe
                                                                ? 'bg-gradient-to-r from-green-900 to-green-800 text-white rounded-br-none'
                                                                : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                                                        }`}
                                                    >
                                                        {!isMe && (
                                                            <p className="text-xs font-medium text-gray-700 mb-1">
                                                                {msg.sender?.full_name || 'Unknown'}
                                                            </p>
                                                        )}
                                                        <p className="text-sm">{msg.message}</p>
                                                        <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                                                            isMe ? 'text-green-200' : 'text-gray-500'
                                                        }`}>
                                                            <span>{format(new Date(msg.created_at), 'h:mm a')}</span>
                                                            {isMe && (
                                                                msg.is_read ? (
                                                                    <FaCheckDouble className="w-3 h-3" />
                                                                ) : (
                                                                    <FaRegCheckCircle className="w-3 h-3" />
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                                    <input
                                        type="text"
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Type your message..."
                                        className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                                        disabled={sendingMessage}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim() || sendingMessage}
                                        className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white p-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
                                    >
                                        {sendingMessage ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <FaPaperPlane className="w-5 h-5" />
                                        )}
                                    </button>
                                </form>
                                <div className="mt-2 text-xs text-gray-500 text-center">
                                    Application status: <span className={`font-medium ${getStatusColor(activeChat.status)} px-2 py-1 rounded`}>
                                        {activeChat.status}
                                    </span>
                                </div>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-green-50 rounded-full flex items-center justify-center mb-6">
                                <FaPaperPlane className="w-12 h-12 text-green-900" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Application Messages</h3>
                            <p className="text-gray-600 mb-6 max-w-md">
                                {user?.user_metadata?.role === 'applicant'
                                    ? 'Communicate with employers about your job applications. Message them for updates, questions, or follow-ups.'
                                    : 'Communicate with job applicants about their applications. Send updates, ask questions, or provide feedback.'}
                            </p>
                            
                        </div>
                    )}
                </div>
            </div>

            {/* New Message Modal */}
            {showNewMessageModal && <NewMessageModal />}
        </div>
    );
}

export default Message;