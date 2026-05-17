import React, { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { supabase } from '../supabaseClient';
import { 
  FaHome, 
  FaSearch, 
  FaPaperPlane, 
  FaUserCircle, 
  FaCheckDouble, 
  FaRegCheckCircle, 
  FaClock,
  FaBriefcase,
  FaTimes,
  FaArchive,
  FaEye,
  FaBuilding,
  FaEnvelope
} from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";
import { format } from 'date-fns';

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
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState('applicant');

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
            
            // Get user role from profiles
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', user.id)
                .single();
            
            setUserRole(profile?.role || 'applicant');
            await fetchConversations(user);
        } catch (error) {
            console.error('Error fetching user:', error);
            navigate('/login');
        } finally {
            setLoading(false);
        }
    };

    const fetchConversations = async (currentUser) => {
        try {
            setLoading(true);
            
            console.log('Fetching conversations for user:', currentUser.id);
            console.log('User role:', userRole);

            // Fetch ALL applications for the current user
            let query = supabase
                .from('applications')
                .select(`
                    *,
                    jobs:job_id (*),
                    profiles:user_id (id, full_name, email, avatar_url)
                `);

            // For applicant, get their own applications
            if (userRole === 'applicant') {
                query = query.eq('user_id', currentUser.id);
            }
            // For employer/admin, get applications for their jobs

            const { data: applicationsData, error } = await query.order('created_at', { ascending: false });

            if (error) {
                console.error('Error fetching applications:', error);
                throw error;
            }
            
            console.log('Applications found:', applicationsData?.length);
            console.log('Applications data:', applicationsData);

            if (!applicationsData || applicationsData.length === 0) {
                console.log('No applications found');
                setConversations([]);
                setFilteredConversations([]);
                setLoading(false);
                return;
            }

            // For each application, fetch messages (if any)
            const conversationsWithMessages = await Promise.all(
                applicationsData.map(async (app) => {
                    console.log('Processing application:', app.id);
                    
                    // Get messages for this application
                    const { data: messagesData, error: msgError } = await supabase
                        .from('application_messages')
                        .select('*')
                        .eq('application_id', app.id)
                        .order('created_at', { ascending: false });

                    if (msgError) {
                        console.error('Error fetching messages for app:', app.id, msgError);
                    }

                    console.log(`Messages found for app ${app.id}:`, messagesData?.length || 0);

                    const lastMessage = messagesData?.[0] || null;
                    
                    // Count unread messages
                    const unreadCount = messagesData?.filter(msg => 
                        !msg.is_read && msg.receiver_id === currentUser.id
                    ).length || 0;

                    // Determine other party info based on user role
                    let otherPartyName = '';
                    let otherPartyEmail = '';
                    let otherPartyAvatar = '';
                    
                    if (userRole === 'applicant') {
                        // Applicant sees employer/company
                        otherPartyName = app.jobs?.company || 'Employer';
                        otherPartyEmail = app.jobs?.company_email || '';
                        otherPartyAvatar = app.jobs?.company_logo;
                    } else {
                        // Employer/Admin sees applicant
                        otherPartyName = app.profiles?.full_name || 'Applicant';
                        otherPartyEmail = app.profiles?.email || '';
                        otherPartyAvatar = app.profiles?.avatar_url;
                    }

                    // Create conversation object - ALWAYS show the application even without messages
                    return {
                        id: app.id,
                        application_id: app.id,
                        name: otherPartyName,
                        email: otherPartyEmail,
                        avatar: otherPartyAvatar,
                        role: `Applied for: ${app.jobs?.title || 'Position'}`,
                        job: app.jobs,
                        lastMessage: lastMessage?.message || 'No messages yet. Start a conversation...',
                        lastMessageTime: lastMessage?.created_at || app.created_at,
                        unread: unreadCount,
                        status: app.status,
                        userRole: userRole,
                        company_logo: app.jobs?.company_logo,
                        job_image: app.jobs?.job_image,
                        applicant_name: app.profiles?.full_name,
                        applicant_email: app.profiles?.email,
                        created_at: app.created_at
                    };
                })
            );

            // Sort by last message time (most recent first)
            conversationsWithMessages.sort((a, b) => 
                new Date(b.lastMessageTime) - new Date(a.lastMessageTime)
            );

            console.log('Total conversations created:', conversationsWithMessages.length);
            setConversations(conversationsWithMessages);
            setFilteredConversations(conversationsWithMessages);
            
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setConversations([]);
            setFilteredConversations([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (applicationId) => {
        try {
            console.log('Fetching messages for application:', applicationId);
            
            const { data, error } = await supabase
                .from('application_messages')
                .select(`
                    *,
                    sender:sender_id (id, full_name, email),
                    receiver:receiver_id (id, full_name, email)
                `)
                .eq('application_id', applicationId)
                .order('created_at', { ascending: true });

            if (error) throw error;
            
            console.log('Messages fetched:', data?.length || 0);
            
            // Enhance messages with sender info
            const enhancedMessages = (data || []).map(msg => ({
                ...msg,
                is_current_user: msg.sender_id === user?.id,
                sender_name: msg.sender?.full_name || 
                    (msg.sender_id === user?.id ? 'You' : 'Other')
            }));
            
            setMessages(enhancedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
            setMessages([]);
        }
    };

    const markMessagesAsRead = async (applicationId) => {
        if (!user) return;

        try {
            const { error } = await supabase
                .from('application_messages')
                .update({ is_read: true })
                .eq('application_id', applicationId)
                .neq('sender_id', user.id)
                .eq('is_read', false);

            if (error) throw error;
            
            // Update unread count in conversations list
            setConversations(prev => prev.map(conv => 
                conv.application_id === applicationId 
                    ? { ...conv, unread: 0 } 
                    : conv
            ));
            
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
            conv.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            conv.status?.toLowerCase().includes(searchTerm.toLowerCase())
        );

        setFilteredConversations(filtered);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!message.trim() || !activeChat || !user) return;

        try {
            setSendingMessage(true);

            // Determine receiver_id based on user role
            let receiverId;
            
            if (userRole === 'applicant') {
                // Get the job owner (employer)
                const { data: job } = await supabase
                    .from('jobs')
                    .select('user_id')
                    .eq('id', activeChat.job?.id)
                    .single();
                receiverId = job?.user_id;
            } else {
                // Employer sends to applicant
                receiverId = activeChat.user_id;
            }

            if (!receiverId) {
                // Try to get from the application
                const { data: application } = await supabase
                    .from('applications')
                    .select('user_id')
                    .eq('id', activeChat.application_id)
                    .single();
                receiverId = application?.user_id;
            }

            if (!receiverId) {
                throw new Error('Could not determine recipient');
            }

            // Send message
            const { data: newMessage, error: msgError } = await supabase
                .from('application_messages')
                .insert([{
                    application_id: activeChat.application_id,
                    sender_id: user.id,
                    receiver_id: receiverId,
                    message: message.trim(),
                    is_read: false,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();

            if (msgError) throw msgError;

            // Add sender info to message
            const enhancedMessage = {
                ...newMessage,
                is_current_user: true,
                sender_name: 'You'
            };

            // Update UI
            setMessages(prev => [...prev, enhancedMessage]);
            setMessage('');
            
            // Refresh conversations to update last message
            await fetchConversations(user);

        } catch (error) {
            console.error('Error sending message:', error);
            alert(error.message || 'Failed to send message');
        } finally {
            setSendingMessage(false);
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

    if (loading) {
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
                        <p className="text-green-200 text-xs">Application Updates</p>
                    </div>
                </div>
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
                                placeholder="Search by job title, company, or status..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            {conversations.length} application(s) found
                        </p>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.length === 0 ? (
                            <div className="p-8 text-center">
                                <FaUserCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500">No applications found</p>
                                <p className="text-gray-400 text-sm mt-2">
                                    {userRole === 'applicant' 
                                        ? 'Apply for jobs to start conversations with employers.' 
                                        : 'No applications have been submitted yet.'}
                                </p>
                                <button
                                    onClick={() => navigate('/jobs')}
                                    className="mt-4 px-4 py-2 bg-green-900 text-white rounded-lg hover:bg-green-800"
                                >
                                    Browse Jobs
                                </button>
                            </div>
                        ) : (
                            conversations.map((conversation) => (
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
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center overflow-hidden">
                                                {conversation.avatar ? (
                                                    <img
                                                        src={conversation.avatar}
                                                        alt={conversation.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : conversation.company_logo ? (
                                                    <img
                                                        src={conversation.company_logo}
                                                        alt={conversation.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FaBuilding className="w-6 h-6 text-green-900" />
                                                )}
                                            </div>
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
                                            
                                            {/* Status Badge */}
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
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-green-100 to-green-50 flex items-center justify-center overflow-hidden">
                                                {activeChat.avatar ? (
                                                    <img
                                                        src={activeChat.avatar}
                                                        alt={activeChat.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : activeChat.company_logo ? (
                                                    <img
                                                        src={activeChat.company_logo}
                                                        alt={activeChat.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <FaBuilding className="w-6 h-6 text-green-900" />
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{activeChat.name}</h3>
                                            <p className="text-sm text-gray-600">{activeChat.role}</p>
                                            <div className="flex items-center space-x-2 mt-1">
                                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(activeChat.status)}`}>
                                                    {React.createElement(getStatusIcon(activeChat.status), { className: "w-3 h-3 mr-1" })}
                                                    Status: {activeChat.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => navigate(`/job/${activeChat.job?.id}`)}
                                            className="text-green-900 hover:text-green-800 font-medium text-sm flex items-center space-x-1"
                                        >
                                            <FaEye className="w-4 h-4" />
                                            <span>View Job</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                {messages.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full text-center">
                                        <div className="w-20 h-20 bg-gradient-to-r from-green-100 to-green-50 rounded-full flex items-center justify-center mb-4">
                                            <FaEnvelope className="w-10 h-10 text-green-900" />
                                        </div>
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            No messages yet
                                        </h3>
                                        <p className="text-gray-600 max-w-md">
                                            Start a conversation about your application for:
                                        </p>
                                        <p className="font-semibold text-green-900 mt-2">
                                            {activeChat.job?.title} at {activeChat.job?.company}
                                        </p>
                                        <p className="text-gray-500 text-sm mt-4 max-w-md">
                                            Send a message to the employer to ask questions or get updates about your application.
                                        </p>
                                        {activeChat.job?.job_image && (
                                            <img
                                                className="mt-6 rounded-lg shadow-md w-64 h-48 object-cover"
                                                src={activeChat.job.job_image}
                                                alt={activeChat.job.title}
                                            />
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {messages.map((msg) => {
                                            const isMe = msg.is_current_user;
                                            
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
                                                                {msg.sender_name || activeChat.name}
                                                            </p>
                                                        )}
                                                        <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
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
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                                        disabled={sendingMessage}
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim() || sendingMessage}
                                        className="bg-gradient-to-r from-green-900 to-green-800 text-white px-6 py-3 rounded-xl hover:from-green-800 hover:to-green-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaPaperPlane className="w-5 h-5" />
                                    </button>
                                </form>
                                <p className="text-xs text-gray-500 text-center mt-2">
                                    Your message will be sent to {activeChat.name}
                                </p>
                            </div>
                        </>
                    ) : (
                        /* Empty State - No Chat Selected */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-green-50 rounded-full flex items-center justify-center mb-6">
                                <FaPaperPlane className="w-12 h-12 text-green-900" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h3>
                            <p className="text-gray-600 mb-6 max-w-md">
                                Select an application from the sidebar to view or send messages
                            </p>
                            <div className="text-sm text-gray-500 space-y-2">
                                <p>💬 Communicate with employers about your applications</p>
                                <p>📝 Get updates on your application status</p>
                                <p>✅ Receive interview invitations and offers</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Message;