import React, { useState } from 'react';
import { FaTimes, FaImage, FaSave } from 'react-icons/fa';
import { useAuth } from '../../AuthContext';

const JobForm = ({ isEdit, jobData, onChange, onSubmit, onClose, handleImageUpload, uploading, uploadType }) => {
  const [formErrors, setFormErrors] = useState({});
  const { session } = useAuth();

  const validateForm = () => {
    const errors = {};
    if (!jobData.title.trim()) errors.title = 'Job title is required';
    if (!jobData.company.trim()) errors.company = 'Company name is required';
    if (!jobData.location.trim()) errors.location = 'Location is required';
    if (!jobData.description.trim()) errors.description = 'Description is required';
    if (!jobData.deadline) errors.deadline = 'Deadline is required';
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-green-900 to-emerald-800 p-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              {isEdit ? 'Edit Job' : 'Create New Job'}
            </h3>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white"
              aria-label="Close"
            >
              <FaTimes className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                value={jobData.title}
                onChange={(e) => onChange({...jobData, title: e.target.value})}
                className={`w-full px-4 py-3 border-2 ${formErrors.title ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300`}
                placeholder="e.g., Senior Frontend Developer"
                onKeyDown={(e) => e.stopPropagation()}
              />
              {formErrors.title && (
                <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>
              )}
            </div>

            {/* Company & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={jobData.company}
                  onChange={(e) => onChange({...jobData, company: e.target.value})}
                  className={`w-full px-4 py-3 border-2 ${formErrors.company ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300`}
                  placeholder="e.g., Tech Corp"
                  onKeyDown={(e) => e.stopPropagation()}
                />
                {formErrors.company && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.company}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  value={jobData.location}
                  onChange={(e) => onChange({...jobData, location: e.target.value})}
                  className={`w-full px-4 py-3 border-2 ${formErrors.location ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300`}
                  placeholder="e.g., Remote, Accra, Ghana"
                  onKeyDown={(e) => e.stopPropagation()}
                />
                {formErrors.location && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                )}
              </div>
            </div>

            {/* Job Type & Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Type
                </label>
                <select
                  value={jobData.job_type}
                  onChange={(e) => onChange({...jobData, job_type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300"
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <option value="internship">Internship</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="remote">Remote</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={jobData.category}
                  onChange={(e) => onChange({...jobData, category: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300"
                  onKeyDown={(e) => e.stopPropagation()}
                >
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Finance">Finance</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Education">Education</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              <input
                type="text"
                value={jobData.salary_range}
                onChange={(e) => onChange({...jobData, salary_range: e.target.value})}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300"
                placeholder="e.g., $5,000 - $7,000 per month"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline *
              </label>
              <input
                type="date"
                value={jobData.deadline}
                onChange={(e) => onChange({...jobData, deadline: e.target.value})}
                className={`w-full px-4 py-3 border-2 ${formErrors.deadline ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300`}
                onKeyDown={(e) => e.stopPropagation()}
              />
              {formErrors.deadline && (
                <p className="mt-1 text-sm text-red-600">{formErrors.deadline}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Description *
              </label>
              <textarea
                value={jobData.description}
                onChange={(e) => onChange({...jobData, description: e.target.value})}
                rows="4"
                className={`w-full px-4 py-3 border-2 ${formErrors.description ? 'border-red-300' : 'border-gray-200'} rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 resize-none`}
                placeholder="Describe the job responsibilities, expectations, etc."
                onKeyDown={(e) => e.stopPropagation()}
              />
              {formErrors.description && (
                <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                value={jobData.requirements}
                onChange={(e) => onChange({...jobData, requirements: e.target.value})}
                rows="3"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition-all duration-300 resize-none"
                placeholder="List the requirements (one per line)"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>

            {/* Image Upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'company_logo')}
                    className="hidden"
                    id="company-logo-upload"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <label
                    htmlFor="company-logo-upload"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 border-dashed rounded-xl hover:border-emerald-500 transition-colors cursor-pointer text-center"
                  >
                    {uploading && uploadType === 'company_logo' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : jobData.company_logo ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FaImage className="w-4 h-4 text-emerald-500" />
                        <span>Change Logo</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FaImage className="w-4 h-4 text-gray-400" />
                        <span>Upload Logo</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Image
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files[0], 'job_image')}
                    className="hidden"
                    id="job-image-upload"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <label
                    htmlFor="job-image-upload"
                    className="flex-1 px-4 py-3 border-2 border-gray-200 border-dashed rounded-xl hover:border-emerald-500 transition-colors cursor-pointer text-center"
                  >
                    {uploading && uploadType === 'job_image' ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </div>
                    ) : jobData.job_image ? (
                      <div className="flex items-center justify-center space-x-2">
                        <FaImage className="w-4 h-4 text-emerald-500" />
                        <span>Change Image</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FaImage className="w-4 h-4 text-gray-400" />
                        <span>Upload Image</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>

            {/* Image Previews */}
            {(jobData.company_logo || jobData.job_image) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobData.company_logo && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <img src={jobData.company_logo} alt="Company Logo" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Company Logo</p>
                      <p className="text-xs text-gray-500">Preview</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange({...jobData, company_logo: ''})}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove logo"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {jobData.job_image && (
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                    <img src={jobData.job_image} alt="Job Image" className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">Job Image</p>
                      <p className="text-xs text-gray-500">Preview</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onChange({...jobData, job_image: ''})}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove image"
                    >
                      <FaTimes className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={jobData.is_active}
                onChange={(e) => onChange({...jobData, is_active: e.target.checked})}
                className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                onKeyDown={(e) => e.stopPropagation()}
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
                Active Job Listing
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <FaSave className="w-4 h-4" />
                <span>{isEdit ? 'Update Job' : 'Create Job'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobForm;