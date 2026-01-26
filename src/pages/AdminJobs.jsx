import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { 
  FaBars, FaWindowMaximize, FaWindowMinimize, 
  FaArrowUp, FaSync, FaTimes,
  FaChevronDown, FaChevronUp, FaBell, FaUserCircle
} from 'react-icons/fa';
import { supabaseAdmin } from '../supabaseClient';
// Import Components
import Sidebar from '../components/admin/Sidebar';
import StatsCards from '../components/admin/StatsCards';
import JobForm from '../components/admin/JobForm';
import JobsTab from '../components/admin/JobsTab';
import UsersTab from '../components/admin/UsersTab';
import DeleteModal from '../components/admin/DeleteModal';
import ApplicationsTab from '../components/admin/ApplicationsTab';
import MessagesTab from '../components/admin/MessagesTab';
import MessageModal from '../components/admin/MessageModal';

const AdminJobs = () => {
  // State Management
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    expired: 0,
    internships: 0,
    fullTime: 0,
    totalApplications: 0,
    pendingApplications: 0,
    unreadMessages: 0,
    users: 0,
    activeUsers: 0
  });
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [jobToDelete, setJobToDelete] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('jobs');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [mobileMenuCollapsed, setMobileMenuCollapsed] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  
  const navigate = useNavigate();
  const sidebarRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Applications states
  const [applications, setApplications] = useState([]);
  const [applicationSearchTerm, setApplicationSearchTerm] = useState('');
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);

  // Users states
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);

  // Message states
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [applicationMessages, setApplicationMessages] = useState([]);

  // Form states
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

  // Click outside to close mobile menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setShowMobileMenu(false);
      }
    };

    if (showMobileMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu]);

  // Fix input focus issue
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['Tab', 'Escape', 'Enter'].includes(e.key)) return;
      
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        e.stopPropagation();
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, true);
    return () => document.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const sendMessageToApplicant = async () => {
    if (!message.trim() || !selectedApplication) return;

    try {
      setSendingMessage(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('application_messages')
        .insert([{
          full_name: selectedApplication.full_name,
          email: selectedApplication.email,
          subject: 'Admin Message',
          message: message,
          message_type: 'admin_reply',
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      try {
        await supabase.functions.invoke('send-email', {
          body: {
            to: selectedApplication.email,
            subject: 'Message from Job Portal Admin',
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>New Message from Job Portal Admin</h2>
                <p>Hello ${selectedApplication.full_name},</p>
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  ${message.replace(/\n/g, '<br>')}
                </div>
                <p>Best regards,<br>Job Portal Team</p>
              </div>
            `
          }
        });
      } catch (emailError) {
        console.error('Failed to send email:', emailError);
      }

      setMessage('');
      setShowMessageModal(false);
      fetchApplicationMessages();
      showNotification('Success', 'Message sent successfully', 'success');
    } catch (error) {
      console.error('Error sending message:', error);
      showNotification('Error', 'Failed to send message', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

 const fetchApplicationMessages = useCallback(async (applicationId) => {
  try {
    // If fetching messages for a specific application
    if (applicationId) {
      const { data, error } = await supabase
        .from("application_messages")
        .select(`
          *,
          sender:sender_id (id, email)
        `)
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true });

      if (!error) {
        console.log("Application messages:", data);
        setApplicationMessages(data || []);
      }
    } else {
      // Fetch all messages for admin
      const { data, error } = await supabase
        .from("application_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) {
        console.log("All messages:", data);
        setApplicationMessages(data || []);
      }
    }
  } catch (error) {
    console.error("Error fetching messages:", error);
    setApplicationMessages([]);
  }
}, []);
  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchJobs();
    fetchApplications();
    fetchApplicationMessages();
    fetchUsers();
  }, []);

  // Filter jobs when search term changes
  useEffect(() => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredJobs(filtered);
  }, [searchTerm, jobs, sortConfig]);

  // Filter users
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

  // Calculate statistics
  useEffect(() => {
    if (jobs.length > 0) {
      const total = jobs.length;
      const active = jobs.filter(job => job.is_active).length;
      const expired = jobs.filter(job => new Date(job.deadline) < new Date()).length;
      const internships = jobs.filter(job => job.job_type === 'internship').length;
      const fullTime = jobs.filter(job => job.job_type === 'full-time').length;
      const totalApplications = applications.length;
      const pendingApplications = applications.filter(app => app.status === 'pending').length;
      const unreadMessages = applicationMessages.filter(msg => !msg.is_read && msg.sender_id !== (supabase.auth.getUser()?.data?.user?.id)).length;
      const usersCount = users.length;
      const activeUsers = users.filter(user => user.last_sign_in_at && new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;

      setStats({ total, active, expired, internships, fullTime, totalApplications, pendingApplications, unreadMessages, users: usersCount, activeUsers });
    }
  }, [jobs, applications, applicationMessages, users]);

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setJobs(data || []);
      setFilteredJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      showNotification('Error', 'Failed to load jobs', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Create new job
  const handleCreateJob = async () => {
    try {
      const jobData = {
        ...newJob,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('jobs')
        .insert([jobData]);

      if (error) throw error;

      setShowCreateModal(false);
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
      
      fetchJobs();
      showNotification('Success', 'Job created successfully', 'success');
    } catch (error) {
      console.error('Error creating job:', error);
      showNotification('Error', 'Failed to create job', 'error');
    }
  };

  // Update job
  const handleUpdateJob = async () => {
    try {
      const jobData = {
        ...editJob,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', editJob.id);

      if (error) throw error;

      setShowEditModal(false);
      fetchJobs();
      showNotification('Success', 'Job updated successfully', 'success');
    } catch (error) {
      console.error('Error updating job:', error);
      showNotification('Error', 'Failed to update job', 'error');
    }
  };

  // Delete job
  const handleDeleteJob = async () => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setJobToDelete(null);
      fetchJobs();
      showNotification('Success', 'Job deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting job:', error);
      showNotification('Error', 'Failed to delete job', 'error');
    }
  };

  // Toggle job status
  const toggleJobStatus = async (job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id);

      if (error) throw error;

      fetchJobs();
      showNotification('Success', `Job ${!job.is_active ? 'activated' : 'deactivated'}`, 'success');
    } catch (error) {
      console.error('Error toggling job status:', error);
      showNotification('Error', 'Failed to update job status', 'error');
    }
  };

  // Open edit modal
  const openEditModal = (job) => {
    setEditJob(job);
    setShowEditModal(true);
  };

  // Fetch applications
  const fetchApplications = async () => {
    try {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      showNotification('Error', 'Failed to load applications', 'error');
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      if (!supabaseAdmin) {
        throw new Error('Admin client not configured');
      }
      
      const { data: { users }, error: authError } = await supabaseAdmin.auth.admin.listUsers();
      
      if (authError) {
        throw new Error(`Failed to fetch users from Auth: ${authError.message}`);
      }
      
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
      
      if (profilesError) {
        console.warn('Profiles fetch warning:', profilesError.message);
      }
      
      const mergedUsers = (users || []).map(authUser => {
        const profile = profiles?.find(p => p.id === authUser.id) || {};
        
        const lastActive = authUser.last_sign_in_at 
          ? formatDistanceToNow(new Date(authUser.last_sign_in_at), { addSuffix: true })
          : 'Never';
        
        const joinedDate = authUser.created_at 
          ? formatDistanceToNow(new Date(authUser.created_at), { addSuffix: true })
          : 'Recently';
        
        return {
          id: authUser.id,
          email: authUser.email,
          full_name: profile.full_name || 
                    authUser.user_metadata?.full_name || 
                    authUser.email?.split('@')[0] || 
                    'User',
          role: profile.role || authUser.user_metadata?.role || 'user',
          status: authUser.banned ? 'banned' : 'active',
          phone: profile.phone || authUser.phone || null,
          created_at: authUser.created_at,
          formatted_created_at: joinedDate,
          last_sign_in_at: authUser.last_sign_in_at,
          formatted_last_active: lastActive,
          email_confirmed: authUser.email_confirmed_at !== null,
          last_active: authUser.last_sign_in_at || 'Never',
          is_super_admin: authUser.is_super_admin || false,
          raw_user: authUser
        };
      });
      
      mergedUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      
      setUsers(mergedUsers);
      setFilteredUsers(mergedUsers);
      
      setStats(prev => ({
        ...prev,
        users: mergedUsers.length,
        activeUsers: mergedUsers.filter(u => u.status === 'active').length
      }));
      
    } catch (error) {
      console.error('Error fetching users:', error);
      
      try {
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (profilesError) {
          throw profilesError;
        }
        
        const fallbackUsers = (profiles || []).map(profile => ({
          id: profile.id,
          email: profile.email || 'No email',
          full_name: profile.full_name || profile.email?.split('@')[0] || 'User',
          role: profile.role || 'user',
          status: profile.banned ? 'banned' : 'active',
          phone: profile.phone || null,
          created_at: profile.created_at,
          formatted_created_at: profile.created_at 
            ? formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })
            : 'Recently',
          last_sign_in_at: profile.last_sign_in_at || profile.created_at,
          formatted_last_active: profile.last_sign_in_at 
            ? formatDistanceToNow(new Date(profile.last_sign_in_at), { addSuffix: true })
            : 'Never',
          email_confirmed: true,
          is_super_admin: profile.role === 'admin'
        }));
        
        setUsers(fallbackUsers);
        setFilteredUsers(fallbackUsers);
        
        showNotification(
          'Info', 
          `Loaded ${fallbackUsers.length} users from profiles`, 
          'info'
        );
        
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
        
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          const singleUser = [{
            id: currentUser.id,
            email: currentUser.email,
            full_name: currentUser.user_metadata?.full_name || currentUser.email?.split('@')[0] || 'Admin',
            role: 'admin',
            status: 'active',
            created_at: currentUser.created_at,
            formatted_created_at: formatDistanceToNow(new Date(currentUser.created_at), { addSuffix: true }),
            last_sign_in_at: currentUser.last_sign_in_at,
            formatted_last_active: currentUser.last_sign_in_at 
              ? formatDistanceToNow(new Date(currentUser.last_sign_in_at), { addSuffix: true })
              : 'Now',
            email_confirmed: true,
            is_super_admin: true
          }];
          
          setUsers(singleUser);
          setFilteredUsers(singleUser);
          
          showNotification(
            'Limited View', 
            'Only showing current user. Check admin configuration.',
            'warning'
          );
        } else {
          setUsers([]);
          setFilteredUsers([]);
          showNotification('Error', 'Failed to load any user data', 'error');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  // Mobile navigation functions
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
  };

  const toggleMobileMenuCollapse = () => {
    setMobileMenuCollapsed(!mobileMenuCollapsed);
  };

  // Delete user from auth and profiles
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;
      
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      
      if (profileError) throw profileError;
      
      showNotification('Success', 'User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      showNotification('Error', 'Failed to delete user', 'error');
    }
  };

  // Update user status (ban/unban)
  const handleUpdateUserStatus = async (userId, status) => {
    try {
      if (status === 'banned') {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          ban_duration: 'permanent'
        });
        
        if (error) throw error;
        showNotification('Success', 'User banned successfully', 'success');
      } else {
        const { error } = await supabase.auth.admin.updateUserById(userId, {
          ban_duration: 'none'
        });
        
        if (error) throw error;
        showNotification('Success', 'User activated successfully', 'success');
      }
      
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      showNotification('Error', 'Failed to update user status', 'error');
    }
  };

  // Image upload handler
  const handleImageUpload = async (file, type) => {
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

      if (showCreateModal) {
        setNewJob(prev => ({ ...prev, [type]: publicUrl }));
      } else if (showEditModal) {
        setEditJob(prev => ({ ...prev, [type]: publicUrl }));
      }

      showNotification('Success', 'Image uploaded successfully', 'success');
    } catch (error) {
      console.error('Error uploading image:', error);
      showNotification('Error', 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
      setUploadType('');
    }
  };

  // Sign out handler
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Notification system
  const showNotification = (title, message, type = 'info') => {
    alert(`${title}: ${message}`);
  };

// In AdminJobs component - UPDATED markMessageAsRead function
const markMessageAsRead = async (messageId) => {
  try {
    const { error } = await supabase
      .from('application_messages')
      .update({ 
        is_read: true,
        updated_at: new Date().toISOString() 
      })
      .eq('id', messageId);

    if (error) throw error;
    
    // Immediately update the local state for instant UI feedback
    setApplicationMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      )
    );
    
    showNotification('Success', 'Message marked as read', 'success');
  } catch (error) {
    console.error('Error marking message as read:', error);
    showNotification('Error', 'Failed to mark message as read', 'error');
    throw error; // Re-throw so MessagesTab can handle it
  }
};

// Also update the deleteMessage function:
const deleteMessage = async (messageId) => {
  try {
    const { error } = await supabase
      .from('application_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
    
    // Immediately update the local state
    setApplicationMessages(prev => 
      prev.filter(msg => msg.id !== messageId)
    );
    
    showNotification('Success', 'Message deleted', 'success');
  } catch (error) {
    console.error('Error deleting message:', error);
    showNotification('Error', 'Failed to delete message', 'error');
    throw error; // Re-throw so MessagesTab can handle it
  }
};

  // Active tab content
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'jobs':
        return (
          <JobsTab
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filteredJobs={filteredJobs}
            loading={loading}
            fetchJobs={fetchJobs}
            openEditModal={openEditModal}
            toggleJobStatus={toggleJobStatus}
            setJobToDelete={setJobToDelete}
            setShowDeleteModal={setShowDeleteModal}
            setShowCreateModal={setShowCreateModal}
          />
        );
      case 'users':
        return (
          <UsersTab
            userSearchTerm={userSearchTerm}
            setUserSearchTerm={setUserSearchTerm}
            filteredUsers={filteredUsers}
            loading={loading}
            fetchUsers={fetchUsers}
            setSelectedUser={setSelectedUser}
            setShowUserDetails={setShowUserDetails}
            setShowMessageModal={setShowMessageModal}
            setMessage={setMessage}
            handleDeleteUser={handleDeleteUser}
            handleUpdateUserStatus={handleUpdateUserStatus}
          />
        );
      case 'applications':
        return (
          <ApplicationsTab
            applications={applications}
            applicationSearchTerm={applicationSearchTerm}
            setApplicationSearchTerm={setApplicationSearchTerm}
            applicationStatusFilter={applicationStatusFilter}
            setApplicationStatusFilter={setApplicationStatusFilter}
            loading={loading}
            fetchApplications={fetchApplications}
            setSelectedApplication={setSelectedApplication}
            setShowApplicationDetails={setShowApplicationDetails}
            acceptApplication={async (id) => {
              try {
                await supabase
                  .from('applications')
                  .update({ status: 'accepted' })
                  .eq('id', id);
                fetchApplications();
                showNotification('Success', 'Application accepted', 'success');
              } catch (error) {
                showNotification('Error', 'Failed to accept application', 'error');
              }
            }}
            rejectApplication={async (id) => {
              try {
                await supabase
                  .from('applications')
                  .update({ status: 'rejected' })
                  .eq('id', id);
                fetchApplications();
                showNotification('Success', 'Application rejected', 'success');
              } catch (error) {
                showNotification('Error', 'Failed to reject application', 'error');
              }
            }}
          />
        );
      case 'messages':
        return (
          <MessagesTab
            applicationMessages={applicationMessages}
            applications={applications}
            loading={loading}
            fetchApplicationMessages={fetchApplicationMessages}
            setSelectedApplication={setSelectedApplication}
            setShowMessageModal={setShowMessageModal}
            setShowApplicationDetails={setShowApplicationDetails}
            markMessageAsRead={markMessageAsRead}
            deleteMessage={deleteMessage}
          />
        );
      default:
        return null;
    }
  };

  // Enhanced Mobile Navigation Component
  const MobileNavigation = () => {
    return (
      <div className="md:hidden">
        {/* Top Navigation Bar */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-green-950 to-emerald-900 text-white shadow-2xl">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleMobileMenu}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 transition-all duration-300"
                aria-label="Toggle menu"
              >
                <FaBars className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold">Admin Panel</h1>
                <p className="text-xs text-emerald-200">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <FaBell className="w-5 h-5 text-emerald-200" />
                {stats.unreadMessages > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-xs rounded-full flex items-center justify-center">
                    {stats.unreadMessages}
                  </span>
                )}
              </div>
              {userProfile && (
                <div className="flex items-center space-x-2">
                  <FaUserCircle className="w-8 h-8 text-emerald-200" />
                  <span className="text-sm font-medium truncate max-w-[80px]">
                    {userProfile.email?.split('@')[0]}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        {showMobileMenu && (
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowMobileMenu(false)}>
            <div 
              ref={mobileMenuRef}
              className="absolute left-0 right-0 top-0 bg-gradient-to-b from-green-950 to-emerald-900 text-white shadow-2xl rounded-b-3xl overflow-hidden animate-slideInDown"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Menu Header */}
              <div className="p-6 border-b border-emerald-700/50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">Navigation</h2>
                    <p className="text-emerald-200 text-sm">Manage your admin tasks</p>
                  </div>
                  <button
                    onClick={() => setShowMobileMenu(false)}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-emerald-300">Active Jobs</p>
                    <p className="text-xl font-bold">{stats.active}</p>
                  </div>
                  <div className="bg-white/5 rounded-xl p-3">
                    <p className="text-xs text-emerald-300">Pending Apps</p>
                    <p className="text-xl font-bold">{stats.pendingApplications}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-4">
                <button
                  onClick={toggleMobileMenuCollapse}
                  className="flex items-center justify-between w-full p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 mb-3"
                >
                  <span className="font-medium">Dashboard Sections</span>
                  {mobileMenuCollapsed ? <FaChevronDown /> : <FaChevronUp />}
                </button>

                {!mobileMenuCollapsed && (
                  <div className="space-y-2 mb-6">
                    {['jobs', 'applications', 'messages', 'users'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => handleTabChange(tab)}
                        className={`w-full text-left p-4 rounded-xl transition-all duration-300 flex items-center space-x-3 ${
                          activeTab === tab
                            ? 'bg-emerald-600 text-white shadow-lg'
                            : 'bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                          <span className="text-sm font-bold">
                            {tab.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1">
                          <p className="font-medium capitalize">{tab}</p>
                          <p className="text-xs text-emerald-200">
                            {tab === 'jobs' && 'Manage job listings'}
                            {tab === 'applications' && 'Review applications'}
                            {tab === 'messages' && 'View messages'}
                            {tab === 'users' && 'Manage users'}
                          </p>
                        </div>
                        {activeTab === tab && (
                          <div className="w-2 h-2 bg-emerald-300 rounded-full"></div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => {
                      setShowCreateModal(true);
                      setShowMobileMenu(false);
                    }}
                    className="w-full p-4 bg-gradient-to-r from-emerald-600 to-green-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <span>+ Create New Job</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      fetchJobs();
                      fetchApplications();
                      fetchUsers();
                      setShowMobileMenu(false);
                    }}
                    className="w-full p-4 bg-white/10 rounded-xl font-medium hover:bg-white/20 transition-all duration-300 flex items-center justify-center space-x-2"
                  >
                    <FaSync className="w-4 h-4" />
                    <span>Refresh All</span>
                  </button>

                  <button
                    onClick={() => {
                      handleSignOut();
                      setShowMobileMenu(false);
                    }}
                    className="w-full p-4 bg-red-500/20 text-red-300 rounded-xl font-medium hover:bg-red-500/30 transition-all duration-300"
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add some spacing for the fixed header */}
        <div className="h-16"></div>
      </div>
    );
  };

  if (loading && activeTab === 'jobs') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin mx-auto mb-4"></div>
            </div>
            <p className="text-gray-600 text-lg font-medium mt-4">Loading admin panel...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Desktop Sidebar Toggle */}
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
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <FaWindowMinimize className="w-5 h-5" /> : <FaWindowMaximize className="w-5 h-5" />}
        </button>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-110"
          title="Scroll to Top"
          aria-label="Scroll to top"
        >
          <FaArrowUp className="w-5 h-5" />
        </button>
      </div>

      <div className="flex">
        {/* Desktop Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
          navigate={navigate}
          setShowCreateModal={setShowCreateModal}
          handleSignOut={handleSignOut}
          sidebarOpen={sidebarOpen}
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-gradient-to-r from-green-950 to-emerald-900 text-white hidden md:block">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-bold pt-16 md:pt-0">Administration Center</h1>
                  <p className="text-emerald-200 mt-2">
                    {activeTab === 'jobs' && 'Manage job postings and listings'}
                    {activeTab === 'applications' && 'Review and process job applications'}
                    {activeTab === 'messages' && 'Communicate with applicants'}
                    {activeTab === 'users' && 'Manage user accounts and permissions'}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {
                      if (activeTab === 'jobs') fetchJobs();
                      else if (activeTab === 'users') fetchUsers();
                      else if (activeTab === 'applications') fetchApplications();
                      else if (activeTab === 'messages') fetchApplicationMessages();
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <FaSync className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <StatsCards stats={stats} />
            
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                {renderActiveTab()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showCreateModal && (
        <JobForm
          isEdit={false}
          jobData={newJob}
          onChange={setNewJob}
          onSubmit={handleCreateJob}
          onClose={() => setShowCreateModal(false)}
          handleImageUpload={handleImageUpload}
          uploading={uploading}
          uploadType={uploadType}
        />
      )}

      {showEditModal && (
        <JobForm
          isEdit={true}
          jobData={editJob}
          onChange={setEditJob}
          onSubmit={handleUpdateJob}
          onClose={() => setShowEditModal(false)}
          handleImageUpload={handleImageUpload}
          uploading={uploading}
          uploadType={uploadType}
        />
      )}

      <DeleteModal
        showDeleteModal={showDeleteModal}
        setShowDeleteModal={setShowDeleteModal}
        jobToDelete={jobToDelete}
        handleDeleteJob={handleDeleteJob}
      />

      {showMessageModal && (
        <MessageModal
          showMessageModal={showMessageModal}
          setShowMessageModal={setShowMessageModal}
          selectedApplication={selectedApplication}
          message={message}
          setMessage={setMessage}
          sendingMessage={sendingMessage}
          sendMessageToApplicant={sendMessageToApplicant}
        />
      )}
    </div>
  );
};

export default AdminJobs;