import React from 'react';
import { 
  FaHome, FaBriefcase, FaClipboardCheck, FaInbox, 
  FaUserShield, FaPlus, FaDownload, FaSignOutAlt,
  FaChartBar, FaCog, FaBell, FaEnvelope
} from 'react-icons/fa';

const Sidebar = ({ 
  activeTab, 
  setActiveTab, 
  stats, 
  navigate, 
  setShowCreateModal,
  handleSignOut,
  sidebarOpen 
}) => {
  const tabs = [
    { id: 'jobs', label: 'Manage Jobs', icon: FaBriefcase, badge: stats.total },
    { id: 'applications', label: 'Applications', icon: FaClipboardCheck, badge: stats.pendingApplications, color: 'bg-yellow-500' },
    { id: 'messages', label: 'Messages', icon: FaInbox, badge: stats.unreadMessages, color: 'bg-red-500' },
    { id: 'users', label: 'User Management', icon: FaUserShield, badge: stats.users }
  ];

  return (
    <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-30 w-72 bg-gradient-to-b from-green-950 to-emerald-900 text-white h-screen transition-all duration-500 shadow-2xl`}>
      <div className="p-6 h-full flex flex-col">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white pt-16">Admin Hub</h2>
          <p className="text-emerald-200 text-sm mt-1">Dashboard v2.0</p>
        </div>

        <nav className="space-y-1 flex-1">
          <button
            onClick={() => navigate('/adminpage')}
            className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
          >
            <FaHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span>Dashboard Home</span>
          </button>
          
          <div className="pt-6 border-t border-emerald-800">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-3 w-full p-4 rounded-xl transition-all duration-300 group ${
                  activeTab === tab.id 
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' 
                    : 'hover:bg-white/10'
                }`}
              >
                <tab.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${tab.color || 'bg-white/20'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
          
          <div className="pt-6 border-t border-emerald-800">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-3 w-full p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg transition-all duration-300 group"
            >
              <FaPlus className="w-5 h-5" />
              <span>Add New Job</span>
            </button>
            
            <button className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group">
              <FaDownload className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Export Data</span>
            </button>

            <button
              onClick={handleSignOut}
              className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
            >
              <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Sign Out</span>
            </button>
          </div>
        </nav>

        <div className="pt-6 border-t border-emerald-800">
          <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
              <FaUserShield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-medium">Administrator</p>
              <p className="text-sm text-emerald-200">Super Admin</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;