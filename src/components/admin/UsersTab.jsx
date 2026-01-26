import React from 'react';
import { 
  FaSearch, FaSync, FaUserShield, FaEllipsisH, 
  FaEye, FaEnvelope, FaUser, FaTrash, FaBan, FaUserCheck, 
  FaUsers
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const UsersTab = ({ 
  userSearchTerm, 
  setUserSearchTerm, 
  filteredUsers, 
  loading, 
  fetchUsers, 
  setSelectedUser, 
  setShowUserDetails, 
  setShowMessageModal,
  setMessage,
  handleDeleteUser,
  handleUpdateUserStatus
}) => {
  return (
    <div className="space-y-6">
      {/* Users Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage registered users and their permissions</p>
          </div>
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
            >
              <FaSync className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Grid */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <FaUsers className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">No users are registered in the system</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div key={user.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      user.role === 'admin' 
                        ? 'bg-gradient-to-r from-red-100 to-pink-100' 
                        : 'bg-gradient-to-r from-blue-100 to-cyan-100'
                    }`}>
                      <FaUserShield className={`w-6 h-6 ${
                        user.role === 'admin' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="max-w-[180px]">
                      <h4 className="font-bold text-gray-900 truncate">{user.full_name}</h4>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  <button 
                    className="text-gray-400 hover:text-gray-600"
                    aria-label="More options"
                  >
                    <FaEllipsisH className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Role</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {user.role || 'user'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : user.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Joined</span>
                    <span className="text-sm text-gray-900">
                      {user.created_at 
                        ? formatDistanceToNow(new Date(user.created_at), { addSuffix: true }) 
                        : 'Recently'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                 
               
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-lg font-medium transition-all duration-300 hover:shadow-sm"
                  >
                    <FaTrash className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UsersTab;