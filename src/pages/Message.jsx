import React, { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { FaHome, FaSearch, FaEdit, FaPaperPlane, FaUserCircle, FaRegBell, FaEllipsisV, FaCheckDouble, FaRegCheckCircle, FaClock } from "react-icons/fa";
import { IoMdArrowBack } from "react-icons/io";

const Message = () => {
    const navigate = useNavigate();
    
    const [activeChat, setActiveChat] = useState(null);
    const [message, setMessage] = useState('');
    
    // Mock data for messages
    const conversations = [
        {
            id: 1,
            name: "Career Services",
            avatar: "",
            role: "University Career Department",
            lastMessage: "Your internship application has been reviewed",
            time: "10:30 AM",
            unread: 2,
            online: true,
            messages: [
                { id: 1, text: "Hello! Your internship application has been reviewed by our team.", time: "10:25 AM", sender: "them", status: "read" },
                { id: 2, text: "We are impressed with your qualifications and would like to schedule an interview.", time: "10:28 AM", sender: "them", status: "read" },
                { id: 3, text: "Thank you! When would be a good time for the interview?", time: "10:30 AM", sender: "me", status: "delivered" }
            ]
        },
        {
            id: 2,
            name: "Google Recruitment",
            avatar: "",
            role: "Tech Internship Program",
            lastMessage: "Technical interview scheduled for next week",
            time: "Yesterday",
            unread: 0,
            online: false,
            messages: [
                { id: 1, text: "Congratulations! You've been selected for the technical interview round.", time: "Yesterday", sender: "them", status: "read" },
                { id: 2, text: "The interview is scheduled for next Tuesday at 2:00 PM.", time: "Yesterday", sender: "them", status: "read" }
            ]
        },
        {
            id: 3,
            name: "MTN HR Team",
            avatar: "",
            role: "Human Resources",
            lastMessage: "Please submit your availability for the final round",
            time: "2 days ago",
            unread: 1,
            online: true,
            messages: [
                { id: 1, text: "We were very impressed with your performance in the previous rounds.", time: "2 days ago", sender: "them", status: "read" },
                { id: 2, text: "Could you please submit your availability for the final interview round?", time: "2 days ago", sender: "them", status: "read" }
            ]
        },
        {
            id: 4,
            name: "Unilever Campus",
            avatar: "",
            role: "Campus Recruitment",
            lastMessage: "Welcome to our internship program!",
            time: "1 week ago",
            unread: 0,
            online: false,
            messages: [
                { id: 1, text: "Welcome to the Unilever Internship Program!", time: "1 week ago", sender: "them", status: "read" },
                { id: 2, text: "We're excited to have you join our team starting next month.", time: "1 week ago", sender: "them", status: "read" }
            ]
        }
    ];

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (message.trim() === '') return;
        
        // In a real app, you would send the message to your backend
        console.log('Sending message:', message);
        setMessage('');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Mobile Header */}
            <div className="bg-gradient-to-r from-green-950 to-green-800 h-16 md:hidden flex items-center justify-between w-full px-4 fixed top-0 z-50 shadow-lg">
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigate("/home")}
                        className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
                    >
                        <IoMdArrowBack className="text-xl" />
                    </button>
                    <div>
                        <p className="text-white font-semibold text-lg">Messages</p>
                        <p className="text-green-200 text-xs">Stay connected</p>
                    </div>
                </div>
                <button className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300">
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
                        <p className="text-gray-600 text-sm">Professional Messaging</p>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <button className="bg-green-100 text-green-900 px-4 py-2 rounded-xl font-semibold hover:bg-green-200 transition-all duration-300 flex items-center space-x-2">
                        <FaEdit className="w-4 h-4" />
                        <span>New Message</span>
                    </button>
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
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-900 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Conversations List */}
                    <div className="flex-1 overflow-y-auto">
                        {conversations.map((conversation) => (
                            <div
                                key={conversation.id}
                                onClick={() => setActiveChat(conversation)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-all duration-300 hover:bg-gray-50 ${
                                    activeChat?.id === conversation.id ? 'bg-green-50 border-l-4 border-l-green-900' : ''
                                }`}
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="relative">
                                        <img
                                            src={conversation.avatar}
                                            alt={conversation.name}
                                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                                        />
                                        {conversation.online && (
                                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-semibold text-gray-900 truncate">{conversation.name}</h3>
                                            <span className="text-xs text-gray-500">{conversation.time}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 truncate">{conversation.role}</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <p className="text-sm text-gray-500 truncate">{conversation.lastMessage}</p>
                                            {conversation.unread > 0 && (
                                                <span className="bg-green-900 text-white text-xs rounded-full px-2 py-1 min-w-5 text-center">
                                                    {conversation.unread}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                                            <img
                                                src={activeChat.avatar}
                                                alt={activeChat.name}
                                                className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                                            />
                                            {activeChat.online && (
                                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white"></div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{activeChat.name}</h3>
                                            <p className="text-sm text-gray-600">{activeChat.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                                            <FaRegBell className="w-5 h-5" />
                                        </button>
                                        <button className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100">
                                            <FaEllipsisV className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                                <div className="space-y-4">
                                    {activeChat.messages.map((msg) => (
                                        <div
                                            key={msg.id}
                                            className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                                                    msg.sender === 'me'
                                                        ? 'bg-gradient-to-r from-green-900 to-green-800 text-white rounded-br-none'
                                                        : 'bg-white text-gray-900 border border-gray-200 rounded-bl-none shadow-sm'
                                                }`}
                                            >
                                                <p className="text-sm">{msg.text}</p>
                                                <div className={`flex items-center justify-end space-x-1 mt-1 text-xs ${
                                                    msg.sender === 'me' ? 'text-green-200' : 'text-gray-500'
                                                }`}>
                                                    <span>{msg.time}</span>
                                                    {msg.sender === 'me' && (
                                                        msg.status === 'read' ? (
                                                            <FaCheckDouble className="w-3 h-3" />
                                                        ) : msg.status === 'delivered' ? (
                                                            <FaRegCheckCircle className="w-3 h-3" />
                                                        ) : (
                                                            <FaClock className="w-3 h-3" />
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
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
                                    />
                                    <button
                                        type="submit"
                                        disabled={!message.trim()}
                                        className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white p-3 rounded-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                                    >
                                        <FaPaperPlane className="w-5 h-5" />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        /* Empty State */
                        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                            <div className="w-24 h-24 bg-gradient-to-r from-green-100 to-green-50 rounded-full flex items-center justify-center mb-6">
                                <FaPaperPlane className="w-12 h-12 text-green-900" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">Your Messages</h3>
                            <p className="text-gray-600 mb-6 max-w-md">
                                Connect with recruiters, career advisors, and internship coordinators through secure messaging.
                            </p>
                            <button className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2">
                                <FaEdit className="w-4 h-4" />
                                <span>Start New Conversation</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Message;