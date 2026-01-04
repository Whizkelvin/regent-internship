import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

import { CiLocationOn, CiMenuBurger } from "react-icons/ci";
import { FaUserCircle, FaUserEdit, FaSignOutAlt, FaBriefcase, FaEnvelope, FaBuilding, FaHome, FaPhone, FaChevronDown } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import { MdMessage, MdWorkHistory } from "react-icons/md";
import { BellIcon, BriefcaseBusiness, UserRoundPen } from "lucide-react";

const Header = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [students, setStudents] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const navItems = [
    { name: "Home", path: "/home", icon: <FaHome className="w-4 h-4" /> },
    { name: "Internship Jobs", path: "/jobs", icon: <FaBriefcase className="w-4 h-4" /> },
    { name: "Contact", path: "/contact", icon: <FaEnvelope className="w-4 h-4" /> },
    { name: "About Us", path: "/about-us", icon: <FaUserCircle className="w-4 h-4" /> },
  ];

  const profileItems = [
    { name: "Profile", path: "/profile", icon: <UserRoundPen className="w-4 h-4" /> },
    { name: "Messages", path: "/message", icon: <BellIcon  className="w-4 h-4" /> },
    { name: "My Applications", path: "/whistlist ", icon: <BriefcaseBusiness className="w-4 h-4" /> },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleMenu = () => setOpenMenu(!openMenu);
  const profileMenu = () => setOpenProfile(!openProfile);

  useEffect(() => {
    const fetchProfilePic = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("profile_pic")
        .eq("id", session.user.id)
        .single();

      if (!error && data?.profile_pic) {
        setProfilePic(data.profile_pic);
      }
    };

    fetchProfilePic();
  }, [session]);

  // Fetch unread messages count
  useEffect(() => {
    const fetchUnreadMessages = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: false })
          .eq('receiver_id', session.user.id)
          .eq('is_read', false);

        if (!error) {
          setUnreadCount(data?.length || 0);
        }
      } catch (error) {
        console.error('Error fetching unread messages:', error);
      }
    };

    fetchUnreadMessages();

    // Set up real-time subscription for new messages
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${session?.user?.id}`
        },
        () => {
          fetchUnreadMessages();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  // Function to mark messages as read when clicking on bell
  const handleBellClick = () => {
    if (unreadCount > 0) {
      // Optionally mark all messages as read when clicking the bell
      // This could be implemented if desired
      console.log('Navigating to messages with', unreadCount, 'unread messages');
    }
    navigate('/message');
  };

  return (
    <div className="relative">
      {/* Mobile Header */}
      <div className=" py-4 flex justify-between items-center px-6 fixed z-50 w-full top-0 bg-gradient-to-r from-green-950 to-green-800 text-white shadow-2xl lg:hidden">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleMenu}
            className="transform transition-all duration-300 hover:scale-110"
          >
            {openMenu ? (
              <IoClose className="text-2xl" />
            ) : (
              <CiMenuBurger className="text-2xl" />
            )}
          </button>

          <div className="text-sm">
            <p className="font-semibold">
              Welcome, {session?.user?.user_metadata?.name?.split(' ')[0] || "User"}
            </p>
            <p className="text-green-200 text-xs">Ready to advance your career?</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={profilePic || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border-2 border-green-300 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <button 
            onClick={profileMenu}
            className="transform transition-all duration-300 hover:scale-110"
          >
            <FaChevronDown className={`w-4 h-4 transition-transform ${openProfile ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:hidden lg:flex  justify-between items-center px-8 lg:px-16 py-4 fixed z-50 w-full top-0 bg-white/95 backdrop-blur-sm shadow-2xl border-b border-gray-200">
        {/* Logo Section */}
        <div className="flex items-center space-x-4">
          <img 
            src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png" 
            alt="Regent University Logo" 
            className="w-12 h-12"
          />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              Regent <span className="text-green-950">Hub</span>
            </p>
            <p className="text-xs text-gray-600 -mt-1">Career Development Platform</p>
          </div>
        </div>
       
        {/* Navigation Items */}
        <nav className="flex items-center space-x-8">
          {navItems.map((item, index) => (
            <Link 
              key={index} 
              to={item.path}
              className="flex items-center space-x-2 text-gray-700 hover:text-green-900 font-medium transition-all duration-300 hover:scale-105 group"
            >
              <span className="text-green-900 group-hover:scale-110 transition-transform">{item.icon}</span>
              <span className="relative">
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-green-900 transition-all duration-300 group-hover:w-full"></span>
              </span>
            </Link>
          ))}
        </nav>

        {/* User Section */}
        <div className="flex items-center space-x-6">
          {/* Profile Icons */}
          <div className="flex items-center space-x-4 text-green-900">
            {profileItems.map((item, index) => {
              if (item.name === "Messages") {
                return (
                  <div key={index} className="relative">
                    <button
                      onClick={handleBellClick}
                      className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-all duration-300 hover:scale-110 hover:shadow-lg group relative"
                      title={item.name}
                    >
                      <div className="w-5 h-5 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </div>
                      {/* Notification Badge */}
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 flex items-center justify-center">
                          <div className="relative">
                            {/* Pulsing effect */}
                            <div className="absolute inset-0 animate-ping bg-red-400 rounded-full opacity-75"></div>
                            {/* Main badge */}
                            <div className="relative bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1 border-2 border-white">
                              {unreadCount > 9 ? '9+' : unreadCount}
                            </div>
                          </div>
                        </div>
                      )}
                    </button>
                  </div>
                );
              }
              
              return (
                <Link 
                  to={item.path} 
                  key={index}
                  className="p-2 rounded-lg bg-green-50 hover:bg-green-100 transition-all duration-300 hover:scale-110 hover:shadow-lg group"
                  title={item.name}
                >
                  <div className="w-5 h-5 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* User Profile & Sign Out */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">
                  {session?.user?.user_metadata?.name?.split(' ')[0] || "User"}
                </p>
                <p className="text-xs text-gray-600">Student</p>
              </div>
              <div className="relative">
                <img
                  src={profilePic || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border-2 border-green-900 shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-2"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={`fixed inset-0 z-40 transform transition-all duration-500 ease-in-out lg:hidden ${
          openMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleMenu}
        ></div>
        
        {/* Menu Panel */}
        <div className="relative w-4/5 max-w-sm h-full bg-gradient-to-b from-white to-gray-50 shadow-2xl flex flex-col">
          {/* Fixed Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200 bg-gradient-to-r from-green-950 to-green-800 text-white">
            <div className="flex items-center space-x-4 mb-2">
              <img
                src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                alt="Regent University Logo"
                className="w-12 h-12"
              />
              <div>
                <p className="text-xl font-bold">Regent Hub</p>
                <p className="text-green-200 text-sm">Career Platform</p>
              </div>
            </div>
            <p className="text-green-200 text-sm">
              Welcome, {session?.user?.user_metadata?.name || "User"}
            </p>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Navigation</h3>
              <div className="space-y-1">
                {navItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={handleMenu}
                    className="flex items-center space-x-3 p-2 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-900 transition-all duration-300 group"
                  >
                    <span className="text-green-900 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                ))}
              </div>

              {/* Profile Items in Mobile Menu */}
              <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">My Account</h3>
              <div className="space-y-1">
                {profileItems.map((item, index) => {
                  if (item.name === "Messages") {
                    return (
                      <div key={index} className="relative">
                        <Link
                          to={item.path}
                          onClick={handleMenu}
                          className="flex items-center space-x-3 p-2 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-900 transition-all duration-300 group"
                        >
                          <span className="text-green-900 group-hover:scale-110 transition-transform">
                            {item.icon}
                          </span>
                          <span className="font-medium">{item.name}</span>
                          {unreadCount > 0 && (
                            <div className="absolute right-3">
                              <div className="relative">
                                <div className="animate-ping bg-red-400 rounded-full w-2 h-2 absolute opacity-75"></div>
                                <div className="relative bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                                  {unreadCount > 9 ? '9+' : unreadCount}
                                </div>
                              </div>
                            </div>
                          )}
                        </Link>
                      </div>
                    );
                  }
                  
                  return (
                    <Link
                      key={index}
                      to={item.path}
                      onClick={handleMenu}
                      className="flex items-center space-x-3 p-2 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-900 transition-all duration-300 group"
                    >
                      <span className="text-green-900 group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Contact Information */}
              <div className="mt-6 p-4 bg-green-50 rounded-2xl border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center space-x-1">
                  <FaPhone className="w-4 h-4" />
                  <span>Contact Information</span>
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-start space-x-3">
                    <CiLocationOn className="w-5 h-5 text-green-900 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">
                      Regent University College<br />
                      Science & Technology<br />
                      Menskrom, Accra
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FaPhone className="w-4 h-4 text-green-900 flex-shrink-0" />
                    <span className="text-gray-700">+233 50 132 1208</span>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <FaPhone className="w-4 h-4 text-green-900 flex-shrink-0" />
                    <span className="text-gray-700">+233 54 574 7320</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fixed Footer */}
          <div className="flex-shrink-0 p-6 border-t border-gray-200 bg-white">
            <button
              onClick={() => {
                handleSignOut();
                handleMenu();
              }}
              className="w-full bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
            >
              <FaSignOutAlt className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Profile Menu */}
      <div
        className={`fixed inset-0 z-40 transform transition-all duration-300 ease-in-out lg:hidden ${
          openProfile ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={profileMenu}
        ></div>
        
        {/* Profile Panel */}
        <div className="absolute right-0 top-0 w-3/4 max-w-xs h-full bg-white shadow-2xl border-l border-gray-200">
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-green-950 to-green-800 text-white">
            <div className="flex items-center space-x-3">
              <img
                src={profilePic || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100&q=80"}
                alt="Profile"
                className="w-12 h-12 rounded-full object-cover border-2 border-green-300"
              />
              <div>
                <p className="font-semibold">{session?.user?.user_metadata?.name || "User"}</p>
                <p className="text-green-200 text-sm">{session?.user?.email}</p>
              </div>
            </div>
          </div>

          <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">My Account</h3>
            <div className="space-y-1">
              {profileItems.map((item, index) => {
                if (item.name === "Messages") {
                  return (
                    <div key={index} className="relative">
                      <Link
                        to={item.path}
                        onClick={profileMenu}
                        className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-900 transition-all duration-300 group"
                      >
                        <span className="text-green-900 group-hover:scale-110 transition-transform">
                          {item.icon}
                        </span>
                        <span className="font-medium">{item.name}</span>
                        {unreadCount > 0 && (
                          <div className="absolute right-3">
                            <div className="relative">
                              <div className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                                {unreadCount > 9 ? '9+' : unreadCount}
                              </div>
                            </div>
                          </div>
                        )}
                      </Link>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={index}
                    to={item.path}
                    onClick={profileMenu}
                    className="flex items-center space-x-3 p-3 rounded-xl text-gray-700 hover:bg-green-50 hover:text-green-900 transition-all duration-300 group"
                  >
                    <span className="text-green-900 group-hover:scale-110 transition-transform">
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Spacer for fixed header */}
      <div className="h-16 md:h-24"></div>
    </div>
  );
};

export default Header;