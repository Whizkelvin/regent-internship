import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  FaSearch, 
  FaFilter, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaEye,
  FaFileAlt,
  FaBuilding,
  FaBriefcase,
  FaSort,
  FaChevronRight,
  FaExternalLinkAlt,
  FaUserCircle,
  FaChartLine,
  FaBell,
  FaEllipsisH,
  FaPaperPlane
} from 'react-icons/fa';
import { HiOutlineSparkles } from 'react-icons/hi';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ total: 0, active: 0, successRate: 0 });

  useEffect(() => {
    fetchUserApplications();
  }, []);

  useEffect(() => {
    filterAndSortApplications();
    calculateStats();
  }, [searchTerm, statusFilter, sortBy, applications]);

  const fetchUserApplications = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (
            *,
            company:company
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setApplications(data || []);
      setFilteredApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = () => {
    const total = applications.length;
    const active = applications.filter(app => 
      ['pending', 'reviewed', 'shortlisted', 'interviewed'].includes(app.status)
    ).length;
    const accepted = applications.filter(app => app.status === 'accepted').length;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    
    setStats({ total, active, successRate });
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.jobs?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.jobs?.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'oldest':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'job-title':
          return (a.jobs?.title || '').localeCompare(b.jobs?.title || '');
        case 'company':
          return (a.jobs?.company || '').localeCompare(b.jobs?.company || '');
        default:
          return 0;
      }
    });

    setFilteredApplications(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'from-amber-400 to-orange-500',
      reviewed: 'from-blue-400 to-cyan-500',
      shortlisted: 'from-purple-400 to-pink-500',
      interviewed: 'from-indigo-400 to-violet-500',
      offered: 'from-emerald-400 to-teal-500',
      accepted: 'from-green-400 to-emerald-500',
      rejected: 'from-rose-400 to-red-500',
      withdrawn: 'from-gray-400 to-slate-500'
    };
    return colors[status] || 'from-gray-400 to-slate-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      reviewed: FaEye,
      shortlisted: FaBriefcase,
      interviewed: FaCalendarAlt,
      offered: FaDollarSign,
      accepted: FaCheckCircle,
      rejected: FaTimesCircle,
      withdrawn: FaTimesCircle
    };
    return icons[status] || FaFileAlt;
  };

  const getStatusGradient = (status) => {
    const gradients = {
      pending: 'bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400',
      reviewed: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400',
      shortlisted: 'bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-400',
      interviewed: 'bg-gradient-to-r from-indigo-50 to-violet-50 border-l-4 border-indigo-400',
      offered: 'bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-400',
      accepted: 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400',
      rejected: 'bg-gradient-to-r from-rose-50 to-red-50 border-l-4 border-rose-400',
      withdrawn: 'bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-400'
    };
    return gradients[status] || 'bg-gradient-to-r from-gray-50 to-slate-50';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysSinceApplied = (dateString) => {
    const appliedDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(today - appliedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const ApplicationCard = ({ application }) => {
    const StatusIcon = getStatusIcon(application.status);
    const daysApplied = getDaysSinceApplied(application.created_at);
    const isRecent = daysApplied <= 7;

    return (
      <div className={`${getStatusGradient(application.status)} rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm border border-white/50`}>
        <div className="p-6">
          {/* Header with job title and actions */}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-xl bg-gradient-to-r ${getStatusColor(application.status)} shadow-md`}>
                  <StatusIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {application.jobs?.title || 'Untitled Position'}
                  </h3>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="flex items-center text-sm text-gray-600">
                      <FaBuilding className="w-3 h-3 mr-1" />
                      {application.jobs?.company || 'Unknown Company'}
                    </span>
                    {isRecent && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-amber-100 to-orange-100 text-amber-700">
                        <HiOutlineSparkles className="w-3 h-3 mr-1" />
                        New
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/50 rounded-lg transition-colors">
                <FaEllipsisH className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Job details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {application.jobs?.location && (
              <div className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
                <FaMapMarkerAlt className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{application.jobs.location}</span>
              </div>
            )}
            {application.jobs?.salary && (
              <div className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
                <FaDollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-700">{application.jobs.salary}</span>
              </div>
            )}
            <div className="flex items-center space-x-2 p-3 bg-white/50 rounded-lg">
              <FaCalendarAlt className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">
                Applied {formatDate(application.created_at)}
              </span>
            </div>
          </div>

          {/* Status and progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Application Progress</span>
              <span className={`text-sm font-semibold ${application.status === 'accepted' ? 'text-green-600' : 'text-gray-600'}`}>
                {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
              </span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-gradient-to-r ${getStatusColor(application.status)} transition-all duration-500`}
                style={{ 
                  width: application.status === 'accepted' ? '100%' : 
                         application.status === 'offered' ? '85%' :
                         application.status === 'interviewed' ? '70%' :
                         application.status === 'shortlisted' ? '55%' :
                         application.status === 'reviewed' ? '40%' : '25%'
                }}
              />
            </div>
          </div>

          {/* Cover letter preview */}
          {application.cover_letter && (
            <div className="mb-6 p-4 bg-white/30 rounded-xl border border-white/50">
              <div className="flex items-center space-x-2 mb-2">
                <FaPaperPlane className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Cover Letter</span>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2 italic">
                "{application.cover_letter.substring(0, 120)}..."
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-6 border-t border-white/30">
            <div className="flex space-x-3">
              <button
                onClick={() => navigate(`/job/${application.job_id}`)}
                className="flex items-center space-x-2 px-4 py-2 bg-white text-gray-700 hover:bg-gray-50 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                <FaEye className="w-4 h-4" />
                <span>View Job</span>
              </button>
              <button
                onClick={() => navigate('/message')}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:from-blue-600 hover:to-cyan-600 rounded-xl font-medium transition-all duration-300 hover:shadow-md"
              >
                <FaBell className="w-4 h-4" />
                <span>Messages</span>
              </button>
            </div>
            <button
              onClick={() => navigate(`/job/${application.job_id}`)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 font-medium group"
            >
              <span>View Details</span>
              <FaChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatsCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-400 mt-2">Your career journey</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl">
            <FaFileAlt className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="mt-4 h-1 bg-gray-100 rounded-full">
          <div className="h-full w-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" />
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Active Applications</p>
            <p className="text-3xl font-bold text-amber-600">{stats.active}</p>
            <p className="text-sm text-gray-400 mt-2">Currently in progress</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl">
            <FaChartLine className="w-8 h-8 text-amber-500" />
          </div>
        </div>
        <div className="mt-4 h-1 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full" 
            style={{ width: `${(stats.active / Math.max(stats.total, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Success Rate</p>
            <p className="text-3xl font-bold text-emerald-600">{stats.successRate}%</p>
            <p className="text-sm text-gray-400 mt-2">Of applications accepted</p>
          </div>
          <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
            <FaCheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
        </div>
        <div className="mt-4 h-1 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 rounded-full" 
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin mx-auto mb-4"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <FaUserCircle className="w-10 h-10 text-emerald-500 animate-pulse" />
            </div>
          </div>
          <p className="text-gray-600 text-lg font-medium mt-4">Loading your career journey...</p>
          <p className="text-gray-400 text-sm mt-2">We're organizing your applications</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-900 via-teal-800 to-cyan-800" />
        <div className="absolute inset-0 " />
        
        <div className="relative container mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-6 md:space-y-0">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl">
                  <FaFileAlt className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white mb-2">My Applications</h1>
                  <p className="text-emerald-100 text-lg">
                    Your personal career dashboard
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-6">
                <div className="flex items-center space-x-2">
                  <FaUserCircle className="w-5 h-5 text-white/80" />
                  <span className="text-white/90">{user?.email || 'User'}</span>
                </div>
                <div className="h-4 w-px bg-white/30" />
                <span className="text-emerald-200 text-sm">
                  {applications.length} career opportunities tracked
                </span>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/jobs')}
              className="group relative overflow-hidden bg-gradient-to-r from-white to-gray-100 text-emerald-900 hover:text-emerald-800 px-8 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center space-x-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              <FaExternalLinkAlt className="w-5 h-5" />
              <span className="text-lg">Discover New Roles</span>
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 -mt-8">
        {/* Stats Overview */}
        <StatsCard />

        {/* Interactive Control Panel */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Application Dashboard</h2>
              <p className="text-gray-600">Filter and sort your applications with precision</p>
            </div>
            <div className="mt-4 lg:mt-0">
              <button
                onClick={fetchUserApplications}
                className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 rounded-xl font-medium transition-all duration-300"
              >
                <FaClock className="w-4 h-4" />
                <span>Refresh Data</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search with micro-interactions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <FaSearch className="w-4 h-4" />
                  <span>Intelligent Search</span>
                </div>
              </label>
              <div className="relative group">
                <input
                  type="text"
                  placeholder="Search jobs, companies, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all duration-300 group-hover:border-gray-300"
                />
                <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </div>
            </div>

            {/* Status Filter with visual feedback */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <FaFilter className="w-4 h-4" />
                  <span>Status Filter</span>
                </div>
              </label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 appearance-none transition-all duration-300 hover:border-gray-300"
                >
                  <option value="all">All Application Statuses</option>
                  <option value="pending">⏳ Pending Review</option>
                  <option value="reviewed">👁️ Reviewed</option>
                  <option value="shortlisted">💼 Shortlisted</option>
                  <option value="interviewed">📅 Interviewed</option>
                  <option value="offered">💰 Job Offered</option>
                  <option value="accepted">✅ Accepted</option>
                  <option value="rejected">❌ Rejected</option>
                  <option value="withdrawn">↩️ Withdrawn</option>
                </select>
                <FaFilter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <FaChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400" />
              </div>
            </div>

            {/* Sort with visual indicators */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                <div className="flex items-center space-x-2">
                  <FaSort className="w-4 h-4" />
                  <span>Sort Preferences</span>
                </div>
              </label>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full pl-12 pr-10 py-3.5 bg-white/80 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 appearance-none transition-all duration-300 hover:border-gray-300"
                >
                  <option value="newest">📅 Newest Applications First</option>
                  <option value="oldest">📅 Oldest Applications First</option>
                  <option value="job-title">🔤 Job Title (A-Z)</option>
                  <option value="company">🏢 Company Name (A-Z)</option>
                </select>
                <FaSort className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <FaChevronRight className="absolute right-4 top-1/2 transform -translate-y-1/2 rotate-90 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Active filters indicator */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>Active filters:</span>
                {searchTerm && (
                  <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
                {statusFilter !== 'all' && (
                  <span className={`px-3 py-1 rounded-full ${getStatusColor(statusFilter)}`}>
                    Status: {statusFilter}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-500">
                {filteredApplications.length} of {applications.length} applications shown
              </span>
            </div>
          </div>
        </div>

        {/* Applications List with empty state */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Your Applications <span className="text-emerald-600">({filteredApplications.length})</span>
              </h2>
              <p className="text-gray-600 mt-1">
                Track the progress of each application in real-time
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-gray-600">Live updates</span>
            </div>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-16 text-center">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-full flex items-center justify-center">
                <div className="relative">
                  <FaFileAlt className="w-16 h-16 text-emerald-400" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center">
                    <HiOutlineSparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                {applications.length === 0 ? 'Begin Your Career Journey' : 'No Matches Found'}
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                {applications.length === 0 
                  ? "Your career dashboard is ready for action. Start applying to amazing opportunities!"
                  : "We couldn't find applications matching your current filters. Try broadening your search."}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/jobs')}
                  className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 rounded-2xl font-semibold transition-all duration-300 hover:shadow-2xl hover:scale-105"
                >
                  Explore Available Positions
                </button>
                {applications.length > 0 && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setSortBy('newest');
                    }}
                    className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-gray-200 hover:to-gray-300 rounded-2xl font-semibold transition-all duration-300"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredApplications.map((application) => (
                <ApplicationCard 
                  key={application.id} 
                  application={application} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Status Guide with interactive elements */}
        <div className="bg-gradient-to-br from-white to-gray-50 rounded-3xl shadow-xl border border-gray-100 p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">Application Journey Guide</h3>
              <p className="text-gray-600 mt-1">Understand each stage of your application process</p>
            </div>
            <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <FaChartLine className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { status: 'pending', label: 'Pending Review', description: 'Your application has been submitted and is awaiting employer review', tip: 'Typically takes 3-7 business days' },
              { status: 'reviewed', label: 'Under Review', description: 'The employer is actively reviewing your application materials', tip: 'Keep an eye on your messages' },
              { status: 'shortlisted', label: 'Shortlisted', description: 'You\'ve been selected for further consideration!', tip: 'Prepare for potential interviews' },
              { status: 'interviewed', label: 'Interviewed', description: 'You\'ve completed the interview process', tip: 'Send a thank you note' },
              { status: 'offered', label: 'Job Offered', description: 'Congratulations! You\'ve received a job offer', tip: 'Review offer details carefully' },
              { status: 'accepted', label: 'Accepted', description: 'You\'ve accepted the job offer - welcome aboard!', tip: 'Complete onboarding paperwork' },
              { status: 'rejected', label: 'Not Selected', description: 'This opportunity wasn\'t the right fit this time', tip: 'Ask for feedback to improve' },
              { status: 'withdrawn', label: 'Withdrawn', description: 'You\'ve chosen to withdraw from this application', tip: 'Focus on other opportunities' },
            ].map((item, index) => {
              const Icon = getStatusIcon(item.status);
              return (
                <div 
                  key={item.status} 
                  className={`${getStatusGradient(item.status)} rounded-2xl p-5 hover:shadow-lg transition-all duration-300 cursor-help group`}
                  title={item.tip}
                >
                  <div className="flex items-start space-x-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${getStatusColor(item.status)} shadow-md group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-1">{item.label}</h4>
                      <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          💡 {item.tip}
                        </span>
                      </div>
                    </div>
                    <div className="text-xs font-semibold text-gray-400">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer note */}
        <div className="mt-8 text-center">
          <p className="text-gray-400 text-sm">
            Your career journey is unique. Every application brings you closer to your dream role. ✨
          </p>
        </div>
      </div>
    </div>
  );
};

export default MyApplications;