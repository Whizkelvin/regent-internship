import React from 'react';
import { FaBriefcase, FaClipboardCheck, FaUsers, FaInbox } from 'react-icons/fa';

const StatsCards = ({ stats }) => {
  const statItems = [
    { 
      label: 'Total Jobs', 
      value: stats.total, 
      icon: FaBriefcase, 
      color: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Active Applications', 
      value: stats.pendingApplications, 
      icon: FaClipboardCheck, 
      color: 'from-amber-500 to-orange-500'
    },
    { 
      label: 'Total Users', 
      value: stats.users, 
      icon: FaUsers, 
      color: 'from-purple-500 to-pink-500'
    },
    { 
      label: 'Unread Messages', 
      value: stats.unreadMessages, 
      icon: FaInbox, 
      color: 'from-rose-500 to-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statItems.map((stat, index) => (
        <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
            <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-md`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;