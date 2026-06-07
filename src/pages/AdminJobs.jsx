import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { FaBars, FaWindowMaximize, FaWindowMinimize, FaArrowUp, FaUserCog, FaChartLine } from 'react-icons/fa';
import UsersTab from '../components/admin/UsersTab';

const AdminDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  // Users state
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  
  const navigate = useNavigate();

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserProfile(user);
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users when search term changes
  useEffect(() => {
    let filtered = users;
    
    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase())
      );
    }
    
    setFilteredUsers(filtered);
  }, [userSearchTerm, users]);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (profilesError) throw profilesError;
      
      const formattedUsers = (profiles || []).map(profile => ({
        id: profile.id,
        email: profile.email || 'No email',
        full_name: profile.full_name || profile.email?.split('@')[0] || 'User',
        role: profile.role || 'user',
        status: profile.status || 'active',
        phone: profile.phone || null,
        created_at: profile.created_at,
        updated_at: profile.updated_at,
        avatar_url: profile.avatar_url,
        banned: profile.banned || false
      }));
      
      setUsers(formattedUsers);
      setFilteredUsers(formattedUsers);
      
    } catch (error) {
      console.error('Error fetching users:', error);
      alert('Failed to load users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      alert('User deleted successfully');
      
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      setFilteredUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user: ' + error.message);
    }
  };

  // Update user status (ban/unban)
  const handleUpdateUserStatus = async (userId, status) => {
    try {
      const newStatus = status === 'banned' ? 'banned' : 'active';
      
      const { error } = await supabase
        .from('profiles')
        .update({ 
          status: newStatus,
          banned: status === 'banned',
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      alert(`User ${newStatus === 'active' ? 'activated' : 'banned'} successfully`);
      
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus, banned: status === 'banned' } : user
      ));
      setFilteredUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus, banned: status === 'banned' } : user
      ));
      
    } catch (error) {
      console.error('Error updating user status:', error);
      alert('Failed to update user status: ' + error.message);
    }
  };

  // Update user role
  const handleUpdateUserRole = async (userId, newRole) => {
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      alert(`User role updated to ${newRole}`);
      
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      setFilteredUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role: ' + error.message);
    }
  };

  // Add new user
  const handleAddUser = async (userData) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            full_name: userData.full_name,
            role: userData.role
          }
        }
      });
      
      if (signUpError) throw signUpError;
      
      if (!authData.user) {
        throw new Error('Failed to create user');
      }
      
      alert(`User ${userData.email} added successfully with role: ${userData.role}`);
      
      await fetchUsers();
      
    } catch (error) {
      console.error('Error adding user:', error);
      alert('Failed to add user: ' + error.message);
      throw error;
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Get stats
  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'active').length;
  const adminUsers = users.filter(u => u.role === 'admin').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Sidebar Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-40 bg-gradient-to-r from-green-900 to-emerald-800 text-white p-3 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 hidden md:block"
        aria-label="Toggle sidebar"
      >
        <FaBars className="w-5 h-5" />
      </button>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col space-y-3">
        <button
          onClick={toggleFullscreen}
          className="bg-gradient-to-r from-green-900 to-emerald-800 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <FaWindowMinimize className="w-5 h-5" /> : <FaWindowMaximize className="w-5 h-5" />}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          title="Scroll to Top"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-20'}`}>
        <div className="h-full bg-gradient-to-b from-green-950 to-emerald-900 text-white shadow-2xl">
          <div className="p-6">
            {sidebarOpen ? (
              <>
                <h2 className="text-2xl font-bold">Admin Panel</h2>
                <p className="text-emerald-300 text-sm mt-1">Dashboard</p>
              </>
            ) : (
              <div className="flex justify-center">
                <FaUserCog className="w-8 h-8" />
              </div>
            )}
          </div>
          
          <nav className="mt-8">
            <div className="px-4 space-y-2">
              <button
                className={`w-full text-left p-3 rounded-xl transition-all duration-300 flex items-center space-x-3 bg-emerald-600 text-white shadow-lg`}
              >
                <FaUserCog className="w-5 h-5" />
                {sidebarOpen && <span>Users</span>}
              </button>
            </div>
          </nav>
          
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <button
              onClick={handleSignOut}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-300 p-3 rounded-xl transition-all duration-300 flex items-center justify-center space-x-2"
            >
              {sidebarOpen ? (
                <>
                  <span>Sign Out</span>
                </>
              ) : (
                <span>🚪</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-green-950 to-emerald-900 text-white">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold">
                  Welcome to Admin Dashboard
                </h1>
                <p className="text-emerald-200 mt-3 text-lg">
                  Manage users, monitor activity, and control system settings
                </p>
                {userProfile && (
                  <p className="text-emerald-300 mt-2 text-sm">
                    Logged in as: {userProfile.email}
                  </p>
                )}
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
                  <p className="text-2xl font-bold">{totalUsers}</p>
                  <p className="text-xs text-emerald-200">Total Users</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
                  <p className="text-2xl font-bold">{activeUsers}</p>
                  <p className="text-xs text-emerald-200">Active Users</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-3 text-center">
                  <p className="text-2xl font-bold">{adminUsers}</p>
                  <p className="text-xs text-emerald-200">Admins</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                  <p className="text-gray-600 mt-1">View and manage all registered users</p>
                </div>
                <button
                  onClick={fetchUsers}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                >
                  Refresh
                </button>
              </div>
              
              <UsersTab
                userSearchTerm={userSearchTerm}
                setUserSearchTerm={setUserSearchTerm}
                filteredUsers={filteredUsers}
                setFilteredUsers={setFilteredUsers}
                loading={loading}
                fetchUsers={fetchUsers}
                setSelectedUser={() => {}} // No-op for now
                setShowUserDetails={() => {}} // No-op for now
                setShowMessageModal={() => {}} // No-op for now
                setMessage={() => {}} // No-op for now
                handleDeleteUser={handleDeleteUser}
                handleUpdateUserStatus={handleUpdateUserStatus}
                handleAddUser={handleAddUser}
                handleUpdateUserRole={handleUpdateUserRole}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;