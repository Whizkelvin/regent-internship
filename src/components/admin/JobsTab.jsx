import React from 'react';
import { FaSearch, FaSync, FaEdit, FaEye, FaEyeSlash, FaTrash, FaBriefcase, FaPlus } from 'react-icons/fa';
import { format } from 'date-fns';

const JobsTab = ({ 
  searchTerm, 
  setSearchTerm, 
  filteredJobs, 
  loading, 
  fetchJobs, 
  openEditModal, 
  toggleJobStatus, 
  setJobToDelete, 
  setShowDeleteModal,
  setShowCreateModal
}) => {
  const handleCreateJob = () => {
    if (setShowCreateModal) {
      setShowCreateModal(true);
    } else {
      console.error('setShowCreateModal function not provided');
      // You could also show an alert or toast notification
      alert('Create job functionality is not available');
    }
  };

  return (
    <div className="space-y-6">
      {/* Jobs search bar */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search jobs by title, company, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300"
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Jobs Grid/Table */}
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-bold text-gray-900">Job Listings ({filteredJobs.length})</h3>
            <div className="flex space-x-3">
              <button
                onClick={fetchJobs}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-sm transition-all duration-300"
              >
                <FaSync className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              <button
                onClick={handleCreateJob}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
              >
                <FaPlus className="w-4 h-4" />
                <span>Create Job</span>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading jobs...</p>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center">
              <FaBriefcase className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
            <p className="text-gray-600 mb-6">Create your first job listing to get started</p>
            <button
              onClick={handleCreateJob}
              className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
            >
              Create Job
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {job.company_logo && (
                          <img src={job.company_logo} alt={job.company} className="w-8 h-8 rounded-lg mr-3 object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{job.title}</p>
                          <p className="text-xs text-gray-500">{job.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{job.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{job.location}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        job.job_type === 'internship' ? 'bg-green-100 text-green-800' :
                        job.job_type === 'full-time' ? 'bg-blue-100 text-blue-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {job.job_type?.replace('-', ' ') || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-2 ${job.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className={`text-xs ${job.is_active ? 'text-green-700' : 'text-red-700'}`}>
                          {job.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {job.deadline ? format(new Date(job.deadline), 'MMM dd, yyyy') : 'No deadline'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => openEditModal(job)}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="Edit"
                          aria-label="Edit job"
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleJobStatus(job)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title={job.is_active ? 'Deactivate' : 'Activate'}
                          aria-label={job.is_active ? 'Deactivate job' : 'Activate job'}
                        >
                          {job.is_active ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setJobToDelete(job);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
                          aria-label="Delete job"
                        >
                          <FaTrash className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default JobsTab;