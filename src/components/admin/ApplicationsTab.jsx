import React, { useState, useEffect } from 'react';
import { 
  FaSearch, FaSync, FaEye, FaCheckCircle, 
  FaTimesCircle, FaClipboardCheck, FaEllipsisH,
  FaClock, FaStar, FaCommentDots
} from 'react-icons/fa';
import { format } from 'date-fns';

const ApplicationsTab = ({
  applications,
  filteredApplications,
  applicationSearchTerm,
  setApplicationSearchTerm,
  applicationStatusFilter,
  setApplicationStatusFilter,
  loading,
  fetchApplications,
  setSelectedApplication,
  setShowApplicationDetails,
  acceptApplication,
  rejectApplication
}) => {
  const [localFilteredApps, setLocalFilteredApps] = useState([]);

  useEffect(() => {
    let filtered = applications;

    if (applicationSearchTerm) {
      filtered = filtered.filter(app =>
        app.full_name?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.jobs?.title?.toLowerCase().includes(applicationSearchTerm.toLowerCase())
      );
    }

    if (applicationStatusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === applicationStatusFilter);
    }

    setLocalFilteredApps(filtered);
  }, [applicationSearchTerm, applications, applicationStatusFilter]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200',
      reviewed: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200',
      shortlisted: 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200',
      interviewed: 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200',
      offered: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200',
      accepted: 'bg-gradient-to-r from-green-50 to-green-50 text-green-700 border border-green-200',
      rejected: 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200'
    };
    return colors[status] || 'bg-gradient-to-r from-gray-50 to-gray-50 text-gray-700';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      reviewed: FaEye,
      shortlisted: FaStar,
      interviewed: FaCommentDots,
      offered: FaCheckCircle,
      accepted: FaCheckCircle,
      rejected: FaTimesCircle
    };
    return icons[status] || FaClock;
  };

  return (
    <div className="space-y-6">
      {/* Applications Header with Filters */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search applicants by name, email, or job title..."
                value={applicationSearchTerm}
                onChange={(e) => setApplicationSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all duration-300"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          
          <div>
            <select
              value={applicationStatusFilter}
              onChange={(e) => setApplicationStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 appearance-none transition-all duration-300"
              onKeyDown={(e) => e.stopPropagation()}
            >
              <option value="all">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="reviewed">👁️ Reviewed</option>
              <option value="shortlisted">⭐ Shortlisted</option>
              <option value="interviewed">💬 Interviewed</option>
              <option value="offered">💰 Offered</option>
              <option value="accepted">✅ Accepted</option>
              <option value="rejected">❌ Rejected</option>
            </select>
          </div>

          <button
            onClick={() => {
              setApplicationSearchTerm('');
              setApplicationStatusFilter('all');
            }}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-300 hover:shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="p-12 text-center">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      ) : localFilteredApps.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl flex items-center justify-center">
            <FaClipboardCheck className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {applications.length === 0 ? 'No Applications Yet' : 'No Applications Found'}
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {applications.length === 0 
              ? "No candidates have applied for jobs yet. Check back later." 
              : "No applications match your current filters. Try adjusting your search criteria."}
          </p>
          <button
            onClick={fetchApplications}
            className="px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
          >
            Refresh Applications
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {localFilteredApps.map((application) => {
            const StatusIcon = getStatusIcon(application.status);
            return (
              <div key={application.id} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900">{application.full_name || 'Anonymous Applicant'}</h4>
                      <p className="text-sm text-gray-600">{application.email}</p>
                      <div className="mt-2">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                          <StatusIcon className="w-3 h-3 mr-2" />
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600">
                      <FaEllipsisH className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="mb-6">
                    <p className="font-medium text-gray-900 mb-1">{application.jobs?.title || 'Unknown Position'}</p>
                    <p className="text-sm text-gray-600">{application.jobs?.company || 'Unknown Company'}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Applied {format(new Date(application.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowApplicationDetails(true);
                      }}
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg font-medium transition-all duration-300 hover:shadow-sm"
                    >
                      <FaEye className="w-4 h-4" />
                      <span>Review</span>
                    </button>
                    <button
                      onClick={() => acceptApplication(application.id)}
                      className="px-3 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg transition-all duration-300 hover:shadow-sm"
                      title="Accept"
                    >
                      <FaCheckCircle className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => rejectApplication(application.id)}
                      className="px-3 py-2.5 bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 rounded-lg transition-all duration-300 hover:shadow-sm"
                      title="Reject"
                    >
                      <FaTimesCircle className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Applications Stats */}
      {localFilteredApps.length > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{localFilteredApps.length}</p>
              <p className="text-sm text-gray-600">Showing</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{applications.filter(a => a.status === 'pending').length}</p>
              <p className="text-sm text-gray-600">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{applications.filter(a => a.status === 'accepted').length}</p>
              <p className="text-sm text-gray-600">Accepted</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">{applications.filter(a => a.status === 'rejected').length}</p>
              <p className="text-sm text-gray-600">Rejected</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationsTab;