import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { 
  FaSearch, FaSync, FaUserShield, FaEllipsisH, 
  FaEye, FaEnvelope, FaUser, FaTrash, FaBan, FaUserCheck, 
  FaUsers, FaPlus, FaTimes, FaBriefcase, FaBuilding, FaUserTie, FaGraduationCap
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
  handleUpdateUserStatus,
  handleAddUser,
  handleUpdateUserRole
}) => {
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [showUpdateRoleModal, setShowUpdateRoleModal] = useState(false);
  const [selectedUserForRole, setSelectedUserForRole] = useState(null);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    full_name: '',
    role: 'user'
  });
  const [newRole, setNewRole] = useState('');
  const [addingUser, setAddingUser] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState(null);

  const roles = [
    { value: 'user', label: 'Regular User', icon: FaUser, color: 'text-gray-700' },
    { value: 'ess_officer', label: 'ESS Officer', icon: FaUserTie, color: 'text-gray-700' },
    { value: 'company', label: 'Company Representative', icon: FaBuilding, color: 'text-gray-700' },
    { value: 'admin', label: 'Administrator', icon: FaUserShield, color: 'text-gray-700' }
  ];

  // Handle Delete User - Delete only from profiles table
// Add this to the handleDeleteUser function
const handleDeleteUser = async (userId) => {
  if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }

  setDeletingUserId(userId);
  
  try {
    // Delete from profiles table only
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (profileError) {
      throw profileError;
    }
    
    // IMMEDIATELY remove from local state - this will hide it instantly
    // You need to have setFilteredUsers as a prop
    if (typeof setFilteredUsers === 'function') {
      setFilteredUsers(prev => prev.filter(user => user.id !== userId));
    }
    
    alert('User deleted successfully!');
    
    // Then refresh from database to be sure
    if (typeof fetchUsers === 'function') {
      await fetchUsers();
    }
    
  } catch (error) {
    console.error('Error deleting user:', error);
    alert('Error deleting user: ' + error.message);
  } finally {
    setDeletingUserId(null);
  }
};

  const getRoleIcon = (role) => {
    const roleData = roles.find(r => r.value === role);
    if (roleData) {
      const Icon = roleData.icon;
      return <Icon className="w-4 h-4 text-gray-700" />;
    }
    return <FaUser className="w-4 h-4 text-gray-700" />;
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    setAddingUser(true);
    try {
      await handleAddUser(newUser);
      setShowAddUserModal(false);
      setNewUser({ email: '', password: '', full_name: '', role: 'user' });
      alert('User added successfully!');
    } catch (error) {
      console.error('Error adding user:', error);
      alert(error.message || 'Failed to add user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleUpdateRoleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUserForRole || !newRole) return;
    
    setUpdatingRole(true);
    try {
      await handleUpdateUserRole(selectedUserForRole.id, newRole);
      setShowUpdateRoleModal(false);
      setSelectedUserForRole(null);
      setNewRole('');
      alert('User role updated successfully!');
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Error updating role: ' + error.message);
    } finally {
      setUpdatingRole(false);
    }
  };

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
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
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
              onClick={() => setShowAddUserModal(true)}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
            >
              <FaPlus className="w-4 h-4" />
              <span>Add User</span>
            </button>
            <button
              onClick={fetchUsers}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-white text-black rounded-xl font-medium transition-all duration-300 hover:shadow-lg border border-gray-200"
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
          <div className="w-12 h-12 border-4 border-purple-200 border-t-green-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading users...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
            <FaUsers className="w-10 h-10 text-gray-500" />
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
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-gray-100 to-gray-200 flex items-center justify-center">
                      {getRoleIcon(user.role)}
                    </div>
                    <div className="max-w-[180px]">
                      <h4 className="font-bold text-gray-900 truncate">{user.full_name || 'No Name'}</h4>
                      <p className="text-sm text-gray-600 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="relative group">
                    <button 
                      className="text-gray-500 hover:text-gray-700 p-1"
                      aria-label="More options"
                    >
                      <FaEllipsisH className="w-5 h-5" />
                    </button>
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 hidden group-hover:block z-10">
                      <div className="py-1">
                      
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowMessageModal(true);
                            setMessage('');
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                        >
                          <FaEnvelope className="w-4 h-4 text-gray-500" />
                          <span>Send Message</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedUserForRole(user);
                            setNewRole(user.role);
                            setShowUpdateRoleModal(true);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-purple-700 hover:bg-purple-50 flex items-center space-x-2"
                        >
                          <FaUserShield className="w-4 h-4 text-purple-500" />
                          <span>Update Role</span>
                        </button>
                        <hr className="my-1" />
                        <button
                          onClick={() => handleUpdateUserStatus(user.id, user.status === 'active' ? 'banned' : 'active')}
                          className="w-full px-4 py-2 text-left text-sm text-yellow-700 hover:bg-yellow-50 flex items-center space-x-2"
                        >
                          <FaBan className="w-4 h-4 text-yellow-500" />
                          <span>{user.status === 'active' ? 'Ban User' : 'Unban User'}</span>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={deletingUserId === user.id}
                          className="w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2 disabled:opacity-50"
                        >
                          {deletingUserId === user.id ? (
                            <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <FaTrash className="w-4 h-4 text-red-500" />
                          )}
                          <span>{deletingUserId === user.id ? 'Deleting...' : 'Delete User'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Role</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-700' 
                        : user.role === 'ess_officer' 
                        ? 'bg-purple-100 text-purple-700'
                        : user.role === 'company'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {getRoleIcon(user.role)}
                      <span>
                        {user.role === 'ess_officer' ? 'ESS Officer' : 
                         user.role === 'company' ? 'Company Rep' : 
                         user.role || 'User'}
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Status</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium flex items-center space-x-1 ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-700' 
                        : user.status === 'banned' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status === 'active' ? <FaUserCheck className="w-3 h-3" /> : <FaBan className="w-3 h-3" />}
                      <span>{user.status || 'active'}</span>
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

                <div className="grid grid-cols-3 gap-2">
                 
                  <button
                    onClick={() => {
                      setSelectedUserForRole(user);
                      setNewRole(user.role);
                      setShowUpdateRoleModal(true);
                    }}
                    className="flex items-center justify-center space-x-1 py-2.5 bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 rounded-lg font-medium transition-all duration-300 hover:shadow-sm"
                  >
                    <FaUserShield className="w-4 h-4 text-gray-700" />
                    <span className="text-sm">Role</span>
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={deletingUserId === user.id}
                    className="flex items-center justify-center space-x-1 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-700 rounded-lg font-medium transition-all duration-300 hover:shadow-sm disabled:opacity-50"
                  >
                    {deletingUserId === user.id ? (
                      <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <FaTrash className="w-4 h-4 text-gray-700" />
                        <span className="text-sm">Delete</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add User Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Add New User</h3>
                <button
                  onClick={() => setShowAddUserModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleAddUserSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={newUser.full_name}
                    onChange={(e) => setNewUser({...newUser, full_name: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Password *
                  </label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                    minLength="6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role *
                  </label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={addingUser}
                    className="px-6 py-2 bg-green-950 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
                  >
                    {addingUser ? 'Adding...' : 'Add User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Update Role Modal */}
      {showUpdateRoleModal && selectedUserForRole && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Update User Role</h3>
                <button
                  onClick={() => setShowUpdateRoleModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>
              <form onSubmit={handleUpdateRoleSubmit}>
                <div className="mb-6">
                  <p className="text-gray-600 mb-2">User: <strong>{selectedUserForRole.email}</strong></p>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Role
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    required
                  >
                    {roles.map(role => (
                      <option key={role.value} value={role.value}>{role.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowUpdateRoleModal(false)}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={updatingRole}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:shadow-lg disabled:opacity-50"
                  >
                    {updatingRole ? 'Updating...' : 'Update Role'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTab;