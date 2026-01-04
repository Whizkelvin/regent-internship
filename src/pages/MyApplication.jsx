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
  FaEllipsisV,
  FaPaperPlane,
  
  FaDownload
} from 'react-icons/fa';

const MyApplications = () => {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
   const [exporting, setExporting] = useState(false);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ 
    total: 0, 
    active: 0, 
    accepted: 0,
    interviewStage: 0,
    successRate: 0 
  });

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
    const interviewStage = applications.filter(app => 
      ['shortlisted', 'interviewed', 'offered'].includes(app.status)
    ).length;
    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0;
    
    setStats({ total, active, accepted, interviewStage, successRate });
  };

  const filterAndSortApplications = () => {
    let filtered = [...applications];

    if (searchTerm) {
      filtered = filtered.filter(app => 
        app.jobs?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        gradient: 'from-amber-500 to-amber-600',
        label: 'Pending Review'
      },
      reviewed: {
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        gradient: 'from-blue-500 to-blue-600',
        label: 'Under Review'
      },
      shortlisted: {
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
        borderColor: 'border-purple-200',
        gradient: 'from-purple-500 to-purple-600',
        label: 'Shortlisted'
      },
      interviewed: {
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
        borderColor: 'border-indigo-200',
        gradient: 'from-indigo-500 to-indigo-600',
        label: 'Interviewed'
      },
      offered: {
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50',
        borderColor: 'border-emerald-200',
        gradient: 'from-emerald-500 to-teal-600',
        label: 'Offer Received'
      },
      accepted: {
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        gradient: 'from-green-500 to-emerald-600',
        label: 'Accepted'
      },
      rejected: {
        color: 'text-rose-600',
        bgColor: 'bg-rose-50',
        borderColor: 'border-rose-200',
        gradient: 'from-rose-500 to-red-600',
        label: 'Not Selected'
      },
      withdrawn: {
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        gradient: 'from-gray-500 to-slate-600',
        label: 'Withdrawn'
      }
    };
    return configs[status] || configs.pending;
  };

  const getProgressPercentage = (status) => {
    const progress = {
      pending: 25,
      reviewed: 40,
      shortlisted: 55,
      interviewed: 70,
      offered: 85,
      accepted: 100,
      rejected: 100,
      withdrawn: 100
    };
    return progress[status] || 25;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const ApplicationCard = ({ application }) => {
    const config = getStatusConfig(application.status);
    const progress = getProgressPercentage(application.status);

    return (
      <div className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg ${config.bgColor} ${config.borderColor} border`}>
                  <FaBriefcase className={`w-4 h-4 ${config.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {application.jobs?.title || 'Position Title'}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="flex items-center text-sm text-gray-600">
                      <FaBuilding className="w-3 h-3 mr-1.5" />
                      {application.jobs?.company || 'Company'}
                    </span>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${config.bgColor} ${config.color}`}>
                      {config.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <FaEllipsisV className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            {application.jobs?.location && (
              <div className="flex items-center text-sm text-gray-600">
                <FaMapMarkerAlt className="w-3.5 h-3.5 mr-2 text-gray-400" />
                <span>{application.jobs.location}</span>
              </div>
            )}
            {application.jobs?.salary && (
              <div className="flex items-center text-sm text-gray-600">
                <FaDollarSign className="w-3.5 h-3.5 mr-2 text-gray-400" />
                <span>{application.jobs.salary}</span>
              </div>
            )}
            <div className="flex items-center text-sm text-gray-600">
              <FaCalendarAlt className="w-3.5 h-3.5 mr-2 text-gray-400" />
              <span>Applied {formatDate(application.created_at)}</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>Application Progress</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className={`h-full bg-gradient-to-r ${config.gradient} rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="flex space-x-2">
              <button
                onClick={() => navigate(`/job/${application.job_id}`)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
              >
                View Details
              </button>
              {application.cover_letter && (
                <button className="px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors">
           
                </button>
              )}
            </div>
            <button
              onClick={() => navigate(`/job/${application.job_id}`)}
              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
            >
              View Job
              <FaChevronRight className="w-3 h-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  const StatsCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Applications</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <FaFileAlt className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <div className="mt-3 h-1 bg-gray-100 rounded-full">
          <div className="h-full w-full bg-blue-500 rounded-full" />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Active</p>
            <p className="text-2xl font-semibold text-amber-600">{stats.active}</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <FaClock className="w-5 h-5 text-amber-600" />
          </div>
        </div>
        <div className="mt-3 h-1 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-amber-500 rounded-full" 
            style={{ width: `${(stats.active / Math.max(stats.total, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Interview Stage</p>
            <p className="text-2xl font-semibold text-purple-600">{stats.interviewStage}</p>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <FaChartLine className="w-5 h-5 text-purple-600" />
          </div>
        </div>
        <div className="mt-3 h-1 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-purple-500 rounded-full" 
            style={{ width: `${(stats.interviewStage / Math.max(stats.total, 1)) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Success Rate</p>
            <p className="text-2xl font-semibold text-green-600">{stats.successRate}%</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <FaCheckCircle className="w-5 h-5 text-green-600" />
          </div>
        </div>
        <div className="mt-3 h-1 bg-gray-100 rounded-full">
          <div 
            className="h-full bg-green-500 rounded-full" 
            style={{ width: `${stats.successRate}%` }}
          />
        </div>
      </div>
    </div>
  );

  const exportToCSV = () => {
  setExporting(true);
  
  try {
    // Prepare data for export
    const exportData = filteredApplications.map(app => ({
      'Job Title': app.jobs?.title || 'N/A',
      'Company': app.jobs?.company || 'N/A',
      'Location': app.jobs?.location || 'N/A',
      'Salary': app.jobs?.salary || 'N/A',
      'Status': app.status.charAt(0).toUpperCase() + app.status.slice(1),
      'Applied Date': formatDate(app.created_at),
      'Last Updated': formatDate(app.updated_at || app.created_at),
      'Cover Letter': app.cover_letter || 'N/A'
    }));

    // Create CSV content
    const headers = Object.keys(exportData[0] || {});
    const csvContent = [
      headers.join(','),
      ...exportData.map(row => 
        headers.map(header => 
          `"${String(row[header] || '').replace(/"/g, '""')}"`
        ).join(',')
      )
    ].join('\n');

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `applications_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
  } catch (error) {
    console.error('Export failed:', error);
    alert('Failed to export applications. Please try again.');
  } finally {
    setExporting(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center mb-4">
            <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-600">Loading your applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Applications</h1>
              <p className="text-gray-600 mt-1">
                Track and manage your job applications
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={fetchUserApplications}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
               
                Refresh
              </button>
              <button
                onClick={() => navigate('/jobs')}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                <FaExternalLinkAlt className="w-4 h-4 mr-2" />
                Find Jobs
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <StatsCard />

        {/* Filters */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Applications
              </label>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by job title, company..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="interviewed">Interviewed</option>
                <option value="offered">Offer Received</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="job-title">Job Title</option>
                <option value="company">Company</option>
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(searchTerm || statusFilter !== 'all') && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Active filters:</span>
                  {searchTerm && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                      Search: "{searchTerm}"
                    </span>
                  )}
                  {statusFilter !== 'all' && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                      Status: {statusFilter}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Applications ({filteredApplications.length})
            </h2>
            <span className="text-sm text-gray-600">
              Showing {filteredApplications.length} of {applications.length}
            </span>
          </div>

          {filteredApplications.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <FaFileAlt className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {applications.length === 0 ? 'No Applications Yet' : 'No Applications Found'}
              </h3>
              <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                {applications.length === 0 
                  ? "You haven't applied to any jobs yet. Start your job search today."
                  : "No applications match your current filters."}
              </p>
              <button
                onClick={() => navigate('/jobs')}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
              >
                Browse Jobs
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredApplications.map((application) => (
                <ApplicationCard 
                  key={application.id} 
                  application={application} 
                />
              ))}
            </div>
          )}
        </div>

        {/* Export Section */}
       <div className="mt-8 bg-white rounded-lg border border-gray-200 p-6">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-lg font-medium text-gray-900">Export Applications</h3>
      <p className="text-gray-600 mt-1">Download your application history as a CSV file</p>
    </div>
    <button 
      onClick={exportToCSV}
      disabled={exporting || filteredApplications.length === 0}
      className={`inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg ${
        exporting || filteredApplications.length === 0
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'text-gray-700 bg-white hover:bg-gray-50'
      }`}
    >
      {exporting ? (
        <>
          <div className="w-4 h-4 mr-2 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
          Exporting...
        </>
      ) : (
        <>
          <FaDownload className="w-4 h-4 mr-2" />
          Export CSV ({filteredApplications.length})
        </>
      )}
    </button>
  </div>
  
  {filteredApplications.length === 0 && (
    <p className="text-sm text-gray-500 mt-3">
      No applications available for export. Apply to some jobs first!
    </p>
  )}
</div>
      </div>
    </div>
  );
};

export default MyApplications;