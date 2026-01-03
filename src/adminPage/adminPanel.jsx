import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import { useAuth } from "../AuthContext";
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaEyeSlash,
  FaSearch,
  FaFilter,
  FaCalendarAlt,
  FaBuilding,
  FaChartLine,
  FaUsers,
  FaCheckCircle,
  FaTimesCircle,
  FaSort,
  FaDownload,
  FaImage,
  FaExternalLinkAlt,
  FaBars,
  FaHome,
  FaListAlt,
  FaTimes,
  FaCog,
  FaEnvelope,
  FaFilePdf,
  FaUser,
  FaPhone,
  FaCommentDots,
  FaBell,
  FaStar,
  FaRegStar,
  FaChevronDown,
  FaChevronUp,
  FaInbox,
  FaUserFriends,
  FaClipboardCheck,
  FaFileAlt,
  FaDownload as FaDownloadIcon,
  FaReply,
  FaPaperPlane,
  FaClock,
  FaUserShield,
  FaUserTimes,
  FaUserCheck,
  FaLock,
  FaUnlock,
  FaMailBulk,
  FaChartBar,
  FaBriefcase,
  FaLocationArrow,
  FaMoneyBill,
  FaGraduationCap,
  FaHeart,
  FaHeartBroken,
  FaArrowUp,
  FaArrowDown,
  FaSync,
  FaEllipsisH,
  FaWindowMinimize,
  FaWindowMaximize,
  FaSave,
  FaBan,
  FaSignOutAlt
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import { format, formatDistanceToNow } from 'date-fns'

// Job Form Component
const JobForm = ({ isEdit, jobData, onChange, onSubmit, onClose, handleImageUpload, uploading, uploadType }) => {
  const [formErrors, setFormErrors] = useState({})
  const { session } = useAuth();

  const validateForm = () => {
    const errors = {}
    if (!jobData.title.trim()) errors.title = 'Job title is required'
    if (!jobData.company.trim()) errors.company = 'Company name is required'
    if (!jobData.location.trim()) errors.location = 'Location is required'
    if (!jobData.description.trim()) errors.description = 'Description is required'
    if (!jobData.deadline) errors.deadline = 'Deadline is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit()
    }
  }

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
                placeholder="e.g.,  5,000 - 7,000  per monthr"
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
  )
}

// Main component
const AdminJobs = () => {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filteredJobs, setFilteredJobs] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
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
  })
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [jobToDelete, setJobToDelete] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState('')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [activeTab, setActiveTab] = useState('jobs')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const navigate = useNavigate()

  // Applications states
  const [applications, setApplications] = useState([])
  const [filteredApplications, setFilteredApplications] = useState([])
  const [applicationSearchTerm, setApplicationSearchTerm] = useState('')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showApplicationDetails, setShowApplicationDetails] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [message, setMessage] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)
  const [applicationStatusFilter, setApplicationStatusFilter] = useState('all')
  const [applicationMessages, setApplicationMessages] = useState([])

  // Users states
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [userSearchTerm, setUserSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)

  // New job form state
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
  })

  // Edit job form state
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
  })

  // Fix input focus issue - prevent page scroll when typing
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't prevent default behavior for specific keys like Tab, Escape, etc.
      if (['Tab', 'Escape', 'Enter'].includes(e.key)) return
      
      // Only prevent default for typing keys when focused on input/textarea
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
        e.stopPropagation()
      }
    }
    
    document.addEventListener('keydown', handleKeyDown, true)
    return () => document.removeEventListener('keydown', handleKeyDown, true)
  }, [])

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`)
      })
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Fetch all data on component mount
  useEffect(() => {
    fetchJobs()
    fetchApplications()
    fetchApplicationMessages()
    fetchUsers()
  }, [])

  // Filter jobs when search term changes
  useEffect(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    filtered.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })

    setFilteredJobs(filtered)
  }, [searchTerm, jobs, sortConfig])

  // Filter applications
  useEffect(() => {
    let filtered = applications

    if (applicationSearchTerm) {
      filtered = filtered.filter(app =>
        app.full_name?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.jobs?.title?.toLowerCase().includes(applicationSearchTerm.toLowerCase())
      )
    }

    if (applicationStatusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === applicationStatusFilter)
    }

    setFilteredApplications(filtered)
  }, [applicationSearchTerm, applications, applicationStatusFilter])

  // Filter users
  useEffect(() => {
    let filtered = users

    if (userSearchTerm) {
      filtered = filtered.filter(user =>
        user.email?.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(userSearchTerm.toLowerCase())
      )
    }

    setFilteredUsers(filtered)
  }, [userSearchTerm, users])

  // Calculate statistics
  useEffect(() => {
    if (jobs.length > 0) {
      const total = jobs.length
      const active = jobs.filter(job => job.is_active).length
      const expired = jobs.filter(job => new Date(job.deadline) < new Date()).length
      const internships = jobs.filter(job => job.job_type === 'internship').length
      const fullTime = jobs.filter(job => job.job_type === 'full-time').length
      const totalApplications = applications.length
      const pendingApplications = applications.filter(app => app.status === 'pending').length
      const unreadMessages = applicationMessages.filter(msg => !msg.is_read && msg.sender_id !== (supabase.auth.getUser()?.data?.user?.id)).length
      const usersCount = users.length
      const activeUsers = users.filter(user => user.last_sign_in_at && new Date(user.last_sign_in_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length

      setStats({ total, active, expired, internships, fullTime, totalApplications, pendingApplications, unreadMessages, users: usersCount, activeUsers })
    }
  }, [jobs, applications, applicationMessages, users])

  // Fetch jobs from Supabase
  const fetchJobs = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('Fetched jobs:', data)
      setJobs(data || [])
      setFilteredJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
      alert('Error loading jobs: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Create new job
  const handleCreateJob = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const jobData = {
        ...newJob,
        
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('jobs')
        .insert([jobData])
        .select()

      if (error) throw error

      setShowCreateModal(false)
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
      })
      
      fetchJobs()
      showNotification('Success', 'Job created successfully', 'success')
    } catch (error) {
      console.error('Error creating job:', error)
      alert('Error creating job: ' + error.message)
    }
  }

  // Update job
  const handleUpdateJob = async () => {
    try {
      const jobData = {
        ...editJob,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', editJob.id)

      if (error) throw error

      setShowEditModal(false)
      fetchJobs()
      showNotification('Success', 'Job updated successfully', 'success')
    } catch (error) {
      console.error('Error updating job:', error)
      alert('Error updating job: ' + error.message)
    }
  }

  // Delete job
  const handleDeleteJob = async () => {
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id)

      if (error) throw error

      setShowDeleteModal(false)
      setJobToDelete(null)
      fetchJobs()
      showNotification('Success', 'Job deleted successfully', 'success')
    } catch (error) {
      console.error('Error deleting job:', error)
      alert('Error deleting job: ' + error.message)
    }
  }

  // Toggle job status
  const toggleJobStatus = async (job) => {
    try {
      const { error } = await supabase
        .from('jobs')
        .update({ is_active: !job.is_active })
        .eq('id', job.id)

      if (error) throw error

      fetchJobs()
      showNotification('Success', `Job ${!job.is_active ? 'activated' : 'deactivated'}`, 'success')
    } catch (error) {
      console.error('Error toggling job status:', error)
      alert('Error updating job status')
    }
  }

  // Open edit modal
  const openEditModal = (job) => {
    setEditJob(job)
    setShowEditModal(true)
  }

  // Fetch applications
const fetchApplications = async () => {
  try {
    const { data, error } = await supabase
      .from('applications')
      .select(`
        *,
        jobs (*)
      `)
      .order('created_at', { ascending: false })

    if (error) throw error;
    setApplications(data || [])
  } catch (error) {
    console.error('Error fetching applications:', error)
  }
}



  // Fetch application messages
  const fetchApplicationMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select(`
          *,
          subjects:subject,
          message:message
        `)
        .order('created_at', { ascending: false })

      if (!error) setApplicationMessages(data || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
    }
  }

  // Fetch users from Supabase auth and profiles
const fetchUsers = async () => {
  try {
    // Fetch all profiles
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')  // or select only the fields you need: 'id, full_name, email, role, phone, status'
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Map profiles to desired structure
    const mergedUsers = profiles.map(user => ({
      id: user.student_id,
      email: user.email,
      full_name: user.full_name || user.email?.split('@')[0] || 'User',
      role: user.role || 'user',
      status: user.status || 'active', // or pending if you have that field
      phone: user.phone || null,
      created_at: user.created_at
    }));

    console.log('Fetched users from profiles:', mergedUsers);
    setUsers(mergedUsers);
    setFilteredUsers(mergedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};




  // Image upload handler
const handleImageUpload = async (file, type) => {
  if (!file) return

  try {
    setUploading(true)
    setUploadType(type)
    
    const fileExt = file.name.split('.').pop()
    // Use timestamp + random string instead of uuid
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `job-portal-images/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('job-portal-images')
      .upload(filePath, file)

    if (uploadError) throw uploadError

    const { data: { publicUrl } } = supabase.storage
      .from('job-portal-images')
      .getPublicUrl(filePath)

    if (showCreateModal) {
      setNewJob(prev => ({ ...prev, [type]: publicUrl }))
    } else if (showEditModal) {
      setEditJob(prev => ({ ...prev, [type]: publicUrl }))
    }

    showNotification('Success', 'Image uploaded successfully', 'success')
  } catch (error) {
    console.error('Error uploading image:', error)
    alert('Error uploading image: ' + error.message)
  } finally {
    setUploading(false)
    setUploadType('')
  }
}

  // Application Management Functions
  const updateApplicationStatus = async (applicationId, newStatus, notes = '') => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId)

      if (error) throw error

      fetchApplications()
      showNotification('Status Updated', `Application status changed to ${newStatus}`, 'success')
    } catch (error) {
      console.error('Error updating status:', error)
      showNotification('Update Failed', 'Error updating application status', 'error')
    }
  }

  const acceptApplication = async (applicationId) => {
    await updateApplicationStatus(applicationId, 'accepted', 'Application accepted by admin')
  }

  const rejectApplication = async (applicationId) => {
    await updateApplicationStatus(applicationId, 'rejected', 'Application rejected by admin')
  }

  const sendMessageToApplicant = async () => {
    if (!message.trim() || !selectedApplication) return

    try {
      setSendingMessage(true)
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('application_messages')
        .insert([{
          application_id: selectedApplication.id,
          sender_id: user.id,
          receiver_id: selectedApplication.user_id,
          message: message,
          is_read: false,
          created_at: new Date().toISOString()
        }])

      if (error) throw error

      setMessage('')
      setShowMessageModal(false)
      fetchApplicationMessages()
      showNotification('Message Sent', 'Your message has been sent successfully', 'success')
    } catch (error) {
      console.error('Error sending message:', error)
      showNotification('Send Failed', 'Error sending message', 'error')
    } finally {
      setSendingMessage(false)
    }
  }

    const handleSignOut = async () => {
      await supabase.auth.signOut();
      navigate("/");
    };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200',
      reviewed: 'bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 border border-blue-200',
      shortlisted: 'bg-gradient-to-r from-purple-50 to-pink-50 text-purple-700 border border-purple-200',
      interviewed: 'bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 border border-indigo-200',
      offered: 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 border border-emerald-200',
      accepted: 'bg-gradient-to-r from-green-50 to-green-50 text-green-700 border border-green-200',
      rejected: 'bg-gradient-to-r from-rose-50 to-red-50 text-rose-700 border border-rose-200'
    }
    return colors[status] || 'bg-gradient-to-r from-gray-50 to-gray-50 text-gray-700'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      reviewed: FaEye,
      shortlisted: FaStar,
      interviewed: FaCommentDots,
      offered: FaCheckCircle,
      accepted: FaCheckCircle,
      rejected: FaTimesCircle
    }
    return icons[status] || FaClock
  }

  // Notification system
  const showNotification = (title, message, type = 'info') => {
    // You can implement a toast notification system here
    console.log(`${type.toUpperCase()}: ${title} - ${message}`)
    // For now, just show an alert
    alert(`${title}: ${message}`)
  }

  // Modern Jobs Tab Content
  const JobsTab = () => (
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
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-gray-900">Job Listings ({filteredJobs.length})</h3>
            <button
              onClick={fetchJobs}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:shadow-sm transition-all duration-300"
            >
              <FaSync className="w-4 h-4" />
              <span>Refresh</span>
            </button>
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
              onClick={() => setShowCreateModal(true)}
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
                        >
                          <FaEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleJobStatus(job)}
                          className="text-yellow-600 hover:text-yellow-900 p-1"
                          title={job.is_active ? 'Deactivate' : 'Activate'}
                        >
                          {job.is_active ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => {
                            setJobToDelete(job)
                            setShowDeleteModal(true)
                          }}
                          className="text-red-600 hover:text-red-900 p-1"
                          title="Delete"
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
  )

  // Enhanced Users Tab Content
  const UsersTab = () => (
    <div className="space-y-6">
      {/* Users Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <p className="text-gray-600">Manage registered users and their permissions</p>
          </div>
          <div className="flex space-x-3">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-purple-100 focus:border-purple-500 transition-all duration-300"
                onKeyDown={(e) => e.stopPropagation()}
              />
            </div>
            <button
              onClick={fetchUsers}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
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
                    <div>
                      <h4 className="font-bold text-gray-900">{user.full_name}</h4>
                      <p className="text-sm text-gray-600">{user.email}</p>
                    </div>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600">
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
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {user.status || 'active'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                    <span className="text-gray-600 text-sm">Last Active</span>
                    <span className="text-sm text-gray-900">
                      {user.last_sign_in_at 
                        ? formatDistanceToNow(new Date(user.last_sign_in_at), { addSuffix: true }) 
                        : 'Never'}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setSelectedUser(user)
                      setShowUserDetails(true)
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-blue-50 to-cyan-50 text-blue-700 rounded-lg font-medium transition-all duration-300 hover:shadow-sm"
                  >
                    <FaEye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button 
                    onClick={() => {
                      setSelectedApplication(null)
                      setMessage(`Hello ${user.full_name},\n\n`)
                      setShowMessageModal(true)
                    }}
                    className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 rounded-lg font-medium transition-all duration-300 hover:shadow-sm"
                  >
                    <FaEnvelope className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  if (loading && activeTab === 'jobs') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 rounded-full animate-spin mx-auto mb-4"></div>
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <FaBriefcase className="w-10 h-10 text-emerald-500 animate-pulse" />
              </div>
            </div>
            <p className="text-gray-600 text-lg font-medium mt-4">Loading admin panel...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
    
      
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

      {/* Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-6 left-6 z-40 bg-gradient-to-r from-green-900 to-emerald-800 text-white p-3 rounded-xl shadow-2xl hover:shadow-3xl transition-all duration-300 md:hidden"
      >
        <FaBars className="w-5 h-5" />
      </button>

      <div className="flex">
        {/* Modern Sidebar */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed md:relative md:translate-x-0 z-30 w-72 bg-gradient-to-b from-green-950 to-emerald-900 text-white h-screen transition-all duration-500 shadow-2xl`}>
          <div className="p-6 h-full flex flex-col">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white pt-16">Admin Hub</h2>
              <p className="text-emerald-200 text-sm mt-1">Dashboard v2.0</p>
            </div>

            <nav className="space-y-1 flex-1">
              <button
                onClick={() => navigate('/adminpage')}
                className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
              >
                <FaHome className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span>Dashboard Home</span>
              </button>
              
              <div className="pt-6 border-t border-emerald-800">
                {[
                  { id: 'jobs', label: 'Manage Jobs', icon: FaBriefcase, badge: stats.total },
                  { id: 'applications', label: 'Applications', icon: FaClipboardCheck, badge: stats.pendingApplications, color: 'bg-yellow-500' },
                  { id: 'messages', label: 'Messages', icon: FaInbox, badge: stats.unreadMessages, color: 'bg-red-500' },
                  { id: 'users', label: 'User Management', icon: FaUserShield, badge: stats.users }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-3 w-full p-4 rounded-xl transition-all duration-300 group ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 shadow-lg' 
                        : 'hover:bg-white/10'
                    }`}
                  >
                    <tab.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {tab.badge > 0 && (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${tab.color || 'bg-white/20'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
              
              <div className="pt-6 border-t border-emerald-800">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center space-x-3 w-full p-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-lg transition-all duration-300 group"
                >
                  <FaPlus className="w-5 h-5" />
                  <span>Add New Job</span>
                </button>
                
                <button className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group">
                  <FaDownload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span>Export Data</span>
                </button>

                   <button
                              onClick={handleSignOut}
                             className="flex items-center space-x-3 w-full p-4 rounded-xl hover:bg-white/10 transition-all duration-300 group"
                            >
                              <FaSignOutAlt className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              <span>Sign Out</span>
                            </button>
              </div>
            </nav>

            <div className="pt-6 border-t border-emerald-800">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-white/5">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <FaUserShield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium">Administrator</p>
                  <p className="text-sm text-emerald-200">Super Admin</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-gradient-to-r from-green-950 to-emerald-900 text-white">
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h1 className="text-3xl font-bold pt-16">Administration Center</h1>
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
                      if (activeTab === 'jobs') fetchJobs()
                      else if (activeTab === 'users') fetchUsers()
                      else if (activeTab === 'applications') fetchApplications()
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-300 flex items-center space-x-2"
                  >
                    <FaSync className="w-4 h-4" />
                    <span>Refresh</span>
                  </button>
                  <button className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 rounded-xl font-medium transition-all duration-300 shadow-lg">
                    Quick Stats
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[
                { 
                  label: 'Total Jobs', 
                  value: stats.total, 
                  icon: FaBriefcase, 
                  color: 'from-blue-500 to-cyan-500'
                },
                { 
                  label: 'Active Applications', 
                  value: stats.pendingApplications, 
                  icon: FaClipboardCheck, 
                  color: 'from-amber-500 to-orange-500'
                },
                { 
                  label: 'Total Users', 
                  value: stats.users, 
                  icon: FaUsers, 
                  color: 'from-purple-500 to-pink-500'
                },
                { 
                  label: 'Unread Messages', 
                  value: stats.unreadMessages, 
                  icon: FaInbox, 
                  color: 'from-rose-500 to-red-500'
                }
              ].map((stat, index) => (
                <div key={index} className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-gray-500 text-sm mb-2">{stat.label}</p>
                      <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                    <div className={`p-4 rounded-xl bg-gradient-to-r ${stat.color} shadow-md`}>
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="p-6">
                {activeTab === 'jobs' && <JobsTab />}
                {activeTab === 'applications' && (
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
            setApplicationSearchTerm('')
            setApplicationStatusFilter('all')
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
    ) : filteredApplications.length === 0 ? (
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
        {filteredApplications.map((application) => {
          const StatusIcon = getStatusIcon(application.status)
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
                      setSelectedApplication(application)
                      setShowApplicationDetails(true)
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
          )
        })}
      </div>
    )}

    {/* Applications Stats */}
    {filteredApplications.length > 0 && (
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredApplications.length}</p>
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
)}
             {activeTab === 'messages' && (
  <div className="space-y-6">
    {/* Messages Header */}
    <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Messages Center</h2>
          <p className="text-gray-600">Communicate with applicants and manage conversations</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={fetchApplicationMessages}
            className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
          >
            <FaSync className="w-4 h-4" />
            <span>Refresh Messages</span>
          </button>
        </div>
      </div>
    </div>

    {/* Messages Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Messages</p>
            <p className="text-2xl font-bold text-gray-900">{applicationMessages.length}</p>
          </div>
          <div className="p-2 bg-purple-50 rounded-lg">
            <FaInbox className="w-6 h-6 text-purple-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Unread</p>
            <p className="text-2xl font-bold text-red-600">
              {applicationMessages.filter(msg => !msg.is_read && msg.sender_id !== (supabase.auth.getUser()?.data?.user?.id)).length}
            </p>
          </div>
          <div className="p-2 bg-red-50 rounded-lg">
            <FaBell className="w-6 h-6 text-red-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Today</p>
            <p className="text-2xl font-bold text-green-600">
              {applicationMessages.filter(m => new Date(m.created_at).toDateString() === new Date().toDateString()).length}
            </p>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <FaEnvelope className="w-6 h-6 text-green-500" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">From Applicants</p>
            <p className="text-2xl font-bold text-blue-600">
              {applicationMessages.filter(m => m.sender_id !== (supabase.auth.getUser()?.data?.user?.id)).length}
            </p>
          </div>
          <div className="p-2 bg-blue-50 rounded-lg">
            <FaUserFriends className="w-6 h-6 text-blue-500" />
          </div>
        </div>
      </div>
    </div>

    {/* Messages List */}
    {loading ? (
      <div className="p-12 text-center">
        <div className="w-12 h-12 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading messages...</p>
      </div>
    ) : applicationMessages.length === 0 ? (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center">
          <FaInbox className="w-10 h-10 text-purple-500" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Messages Yet</h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Start conversations with applicants to track communication about their applications.
        </p>
        <button
          onClick={fetchApplicationMessages}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all duration-300"
        >
          Refresh Messages
        </button>
      </div>
    ) : (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversation
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Message Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {applicationMessages.map((msg) => {
                const isMe = msg.sender_id === (supabase.auth.getUser()?.data?.user?.id)
                const isUnread = !msg.is_read && !isMe
                
                return (
                  <tr 
                    key={msg.id} 
                    className={`hover:bg-gray-50 transition-colors ${isUnread ? 'bg-blue-50' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isMe ? 'bg-green-100' : 'bg-purple-100'}`}>
                            <FaUser className={`w-5 h-5 ${isMe ? 'text-green-600' : 'text-purple-600'}`} />
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {isMe ? 'You' : msg.sender?.full_name || 'Applicant'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {isMe ? 'To: Applicant' : 'From: Applicant'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{msg.applications?.jobs?.title || 'Unknown Job'}</p>
                      <p className="text-xs text-gray-500">{msg.applications?.jobs?.company || 'Unknown Company'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 truncate max-w-xs">
                        {msg.message.length > 50 ? `${msg.message.substring(0, 50)}...` : msg.message}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {format(new Date(msg.created_at), 'MMM dd')}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(msg.created_at), 'hh:mm a')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {isUnread ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <FaBell className="w-3 h-3 mr-1" />
                          Unread
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheckCircle className="w-3 h-3 mr-1" />
                          Read
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            // Find the application for this message
                            const app = applications.find(a => a.id === msg.application_id)
                            if (app) {
                              setSelectedApplication(app)
                              setShowMessageModal(true)
                            }
                          }}
                          className="text-purple-600 hover:text-purple-900 p-1"
                          title="Reply"
                        >
                          <FaReply className="w-4 h-4" />
                        </button>
                        <button
                          onClick={async () => {
                            try {
                              await supabase
                                .from('application_messages')
                                .update({ is_read: true })
                                .eq('id', msg.id)
                              
                              fetchApplicationMessages()
                            } catch (error) {
                              console.error('Error marking as read:', error)
                            }
                          }}
                          className="text-green-600 hover:text-green-900 p-1"
                          title="Mark as Read"
                        >
                          <FaCheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            // Find the application details
                            const app = applications.find(a => a.id === msg.application_id)
                            if (app) {
                              setSelectedApplication(app)
                              setShowApplicationDetails(true)
                            }
                          }}
                          className="text-blue-600 hover:text-blue-900 p-1"
                          title="View Application"
                        >
                          <FaEye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination or Load More */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {applicationMessages.length} messages
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  // Could implement pagination here
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  // Could implement pagination here
                }}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    )}

    {/* Quick Actions */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-green-100 rounded-lg">
            <FaPaperPlane className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Quick Reply</h4>
            <p className="text-sm text-gray-600 mb-3">Send a message to an applicant</p>
            <button
              onClick={() => {
                if (applications.length > 0) {
                  setSelectedApplication(applications[0])
                  setShowMessageModal(true)
                } else {
                  alert('No applications found. Please load applications first.')
                }
              }}
              className="text-sm text-green-700 hover:text-green-900 font-medium"
            >
              Start Conversation →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-blue-100 rounded-lg">
            <FaEnvelope className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Bulk Messages</h4>
            <p className="text-sm text-gray-600 mb-3">Send messages to multiple applicants</p>
            <button
              onClick={() => alert('Bulk messaging feature coming soon!')}
              className="text-sm text-blue-700 hover:text-blue-900 font-medium"
            >
              Send to Multiple →
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
        <div className="flex items-start space-x-3">
          <div className="p-3 bg-purple-100 rounded-lg">
            <FaDownload className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Export Messages</h4>
            <p className="text-sm text-gray-600 mb-3">Download all conversations</p>
            <button
              onClick={() => {
                // Export messages as CSV
                const csvContent = convertToCSV(applicationMessages)
                downloadCSV(csvContent, 'messages_export.csv')
              }}
              className="text-sm text-purple-700 hover:text-purple-900 font-medium"
            >
              Download CSV →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
)}
                {activeTab === 'users' && <UsersTab />}
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

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <FaTrash className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Confirm Delete</h3>
                  <p className="text-gray-600">This action cannot be undone</p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete <span className="font-bold">"{jobToDelete?.title}"</span>?
              </p>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteJob}
                  className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 text-white rounded-xl font-medium transition-all duration-300 hover:shadow-lg"
                >
                  Delete Job
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminJobs