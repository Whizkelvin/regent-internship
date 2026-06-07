import React, { useState } from 'react';
import { 
  FaEye, FaCheck, FaTimes, FaDownload, FaFilePdf, 
  FaFileWord, FaUser, FaEnvelope, FaPhone, FaBriefcase, 
  FaCalendarAlt, FaBuilding, FaMapMarkerAlt, FaClock,
  FaFileAlt, FaFileSignature, FaAward, FaExternalLinkAlt
} from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const ApplicationsTab = ({
  applications,
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
  const [expandedApplication, setExpandedApplication] = useState(null);

  // Filter applications based on search term and status
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.full_name?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
      app.email?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
      app.jobs?.title?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
      app.jobs?.company?.toLowerCase().includes(applicationSearchTerm.toLowerCase());
    
    const matchesStatus = applicationStatusFilter === 'all' || app.status === applicationStatusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      reviewed: 'bg-blue-100 text-blue-800 border-blue-200',
      shortlisted: 'bg-purple-100 text-purple-800 border-purple-200',
      interviewed: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      offered: 'bg-green-100 text-green-800 border-green-200',
      accepted: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200'
    };
    return badges[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setShowApplicationDetails(true);
  };

  const toggleExpand = (applicationId) => {
    setExpandedApplication(expandedApplication === applicationId ? null : applicationId);
  };

  const handleDownload = async (url, fileName) => {
    if (!url) {
      alert('No file available');
      return;
    }
    
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      alert('Failed to download file');
    }
  };

  const getFileIcon = (url) => {
    if (!url) return null;
    if (url.includes('.pdf')) return <FaFilePdf className="text-red-500" />;
    return <FaFileWord className="text-blue-500" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, email, job title, or company..."
            value={applicationSearchTerm}
            onChange={(e) => setApplicationSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
          />
        </div>
        <div>
          <select
            value={applicationStatusFilter}
            onChange={(e) => setApplicationStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button
          onClick={fetchApplications}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Refresh
        </button>
      </div>

      {/* Applications List */}
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <FaFileAlt className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No applications found</p>
            <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <div key={app.id} className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-300">
              {/* Application Header */}
              <div className="p-5 cursor-pointer" onClick={() => toggleExpand(app.id)}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <div className="w-10 h-10 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full flex items-center justify-center">
                        <FaUser className="w-5 h-5 text-green-900" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 text-lg">
                          {app.full_name || 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-500">{app.email}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <FaBriefcase className="w-4 h-4" />
                        <span>{app.jobs?.title || 'Position not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <FaBuilding className="w-4 h-4" />
                        <span>{app.jobs?.company || 'Company not specified'}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <FaClock className="w-4 h-4" />
                        <span>Applied {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadge(app.status)}`}>
                      {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                    </span>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(app);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View Full Details"
                      >
                        <FaEye className="w-5 h-5" />
                      </button>
                      
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Accept this application?')) {
                                acceptApplication(app.id);
                              }
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Accept"
                          >
                            <FaCheck className="w-5 h-5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (window.confirm('Reject this application?')) {
                                rejectApplication(app.id);
                              }
                            }}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Reject"
                          >
                            <FaTimes className="w-5 h-5" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Document Details */}
              {expandedApplication === app.id && (
                <div className="border-t border-gray-200 bg-gray-50 p-5">
                  <h4 className="font-semibold text-gray-900 mb-4">Application Documents</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* CV Section */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaFileAlt className="w-5 h-5 text-green-600" />
                        <h5 className="font-medium text-gray-900">Curriculum Vitae (CV)</h5>
                      </div>
                      {app.cv_url || app.resume_url ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            {getFileIcon(app.cv_url || app.resume_url)}
                            <span className="text-sm text-gray-600 truncate flex-1">
                              {app.cv_url?.split('/').pop() || app.resume_url?.split('/').pop() || 'CV Document'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(app.cv_url || app.resume_url, 'CV_Document.pdf')}
                            className="w-full mt-2 px-3 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            <FaDownload className="w-4 h-4" />
                            <span>Download CV</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No CV uploaded</p>
                      )}
                    </div>

                    {/* Recommendation Letter Section */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaFileSignature className="w-5 h-5 text-blue-600" />
                        <h5 className="font-medium text-gray-900">Recommendation Letter</h5>
                      </div>
                      {app.recommendation_letter_url ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            {getFileIcon(app.recommendation_letter_url)}
                            <span className="text-sm text-gray-600 truncate flex-1">
                              {app.recommendation_letter_name || 'Recommendation Letter'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(app.recommendation_letter_url, app.recommendation_letter_name || 'Recommendation_Letter.pdf')}
                            className="w-full mt-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            <FaDownload className="w-4 h-4" />
                            <span>Download Letter</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No recommendation letter uploaded</p>
                      )}
                    </div>

                    {/* Evaluation Form Section */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <FaAward className="w-5 h-5 text-purple-600" />
                        <h5 className="font-medium text-gray-900">Evaluation Form</h5>
                      </div>
                      {app.evaluation_letter_url ? (
                        <div>
                          <div className="flex items-center space-x-2 mb-2">
                            {getFileIcon(app.evaluation_letter_url)}
                            <span className="text-sm text-gray-600 truncate flex-1">
                              {app.evaluation_letter_name || 'Evaluation Form'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDownload(app.evaluation_letter_url, app.evaluation_letter_name || 'Evaluation_Form.pdf')}
                            className="w-full mt-2 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors flex items-center justify-center space-x-2 text-sm"
                          >
                            <FaDownload className="w-4 h-4" />
                            <span>Download Form</span>
                          </button>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No evaluation form uploaded</p>
                      )}
                    </div>
                  </div>

                  {/* Additional Info */}
                  {(app.phone || app.cover_letter) && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      {app.phone && (
                        <div className="flex items-center space-x-2 mb-2">
                          <FaPhone className="w-4 h-4 text-gray-500" />
                          <span className="text-sm text-gray-700">{app.phone}</span>
                        </div>
                      )}
                      {app.cover_letter && (
                        <div className="mt-2">
                          <p className="text-sm font-medium text-gray-700 mb-1">Cover Letter:</p>
                          <p className="text-sm text-gray-600 bg-white p-3 rounded-lg border border-gray-200">
                            {app.cover_letter}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApplicationsTab;