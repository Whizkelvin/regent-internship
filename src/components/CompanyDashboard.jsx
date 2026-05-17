import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { 
  FaBriefcase, 
  FaClipboardCheck, 
  FaBuilding,
  FaMapMarkerAlt,
  FaDollarSign,
  FaClock,
  FaEye,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSearch,
  FaSync,
  FaCheckCircle,
  FaTimesCircle,
  FaFileAlt,
  FaUserCheck,
  FaUserTimes,
  FaEnvelope,
  FaChartLine,
  FaCalendarAlt,
  FaUsers
} from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('jobs');
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [companyProfile, setCompanyProfile] = useState(null);
  
  // Jobs state
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);
  const [showEditJobModal, setShowEditJobModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Applications state
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [applicationSearchTerm, setApplicationSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationDetails, setShowApplicationDetails] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  
  // Stats
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    shortlistedApplications: 0,
    hiredApplications: 0
  });
  
  // New Job Form State
  const [newJob, setNewJob] = useState({
    title: '',
    company: '',
    company_logo: '',
    job_image: '',
    location: '',
    job_type: 'full-time',
    category: 'Technology',
    description: '',
    requirements: '',
    salary_range: '',
    deadline: '',
    is_active: true
  });
  
  // Edit Job Form State
  const [editJob, setEditJob] = useState({
    title: '',
    company: '',
    company_logo: '',
    job_image: '',
    location: '',
    job_type: 'full-time',
    category: 'Technology',
    description: '',
    requirements: '',
    salary_range: '',
    deadline: '',
    is_active: true
  });
  
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');

  useEffect(() => {
    checkUserAndFetchData();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobSearchTerm, jobs]);

  useEffect(() => {
    filterApplications();
  }, [applicationSearchTerm, statusFilter, applications]);

  const checkUserAndFetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/login');
        return;
      }
      
       const handleSignOut = async () => {
          await supabase.auth.signOut();
          navigate('/');
        };
        
      // Check if user has company role
      const { data: profile } = await supabase
        .from('profiles')
        .select('role, company_name, company_id')
        .eq('id', user.id)
        .single();
      
      if (profile?.role !== 'company' && profile?.role !== 'admin') {
        navigate('/unauthorized');
        return;
      }
      
      setUser(user);
      setCompanyProfile(profile);
      await fetchJobs();
      await fetchApplications();
    } catch (error) {
      console.error('Error checking user:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      let query = supabase
        .from('jobs')
        .select('*')
        .order('created_at', { ascending: false });
      
      // If not admin, only show company's jobs
      if (companyProfile?.role !== 'admin') {
        query = query.eq('company', companyProfile?.company_name);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      
      setJobs(data || []);
      setFilteredJobs(data || []);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalJobs: data?.length || 0,
        activeJobs: data?.filter(job => job.is_active).length || 0
      }));
    } catch (error) {
      console.error('Error fetching jobs:', error);
      alert('Error fetching jobs: ' + error.message);
    }
  };

  const fetchApplications = async () => {
    try {
      // First get all jobs for this company
      const { data: companyJobs } = await supabase
        .from('jobs')
        .select('id')
        .eq('company', companyProfile?.company_name);
      
      const jobIds = companyJobs?.map(job => job.id) || [];
      
      if (jobIds.length === 0) {
        setApplications([]);
        setFilteredApplications([]);
        return;
      }
      
      // Get applications for these jobs
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          jobs:job_id (*),
          profiles:user_id (id, full_name, email, avatar_url, phone)
        `)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setApplications(data || []);
      setFilteredApplications(data || []);
      
      // Update stats
      const pending = data?.filter(app => app.status === 'pending').length || 0;
      const reviewed = data?.filter(app => app.status === 'reviewed').length || 0;
      const shortlisted = data?.filter(app => app.status === 'shortlisted').length || 0;
      const hired = data?.filter(app => app.status === 'accepted').length || 0;
      
      setStats(prev => ({
        ...prev,
        totalApplications: data?.length || 0,
        pendingApplications: pending,
        reviewedApplications: reviewed,
        shortlistedApplications: shortlisted,
        hiredApplications: hired
      }));
    } catch (error) {
      console.error('Error fetching applications:', error);
      alert('Error fetching applications: ' + error.message);
    }
  };

  const filterJobs = () => {
    if (!jobSearchTerm.trim()) {
      setFilteredJobs(jobs);
      return;
    }
    
    const filtered = jobs.filter(job =>
      job.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.location?.toLowerCase().includes(jobSearchTerm.toLowerCase()) ||
      job.category?.toLowerCase().includes(jobSearchTerm.toLowerCase())
    );
    
    setFilteredJobs(filtered);
  };

  const filterApplications = () => {
    let filtered = [...applications];
    
    if (applicationSearchTerm) {
      filtered = filtered.filter(app =>
        app.jobs?.title?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.full_name?.toLowerCase().includes(applicationSearchTerm.toLowerCase()) ||
        app.email?.toLowerCase().includes(applicationSearchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }
    
    setFilteredApplications(filtered);
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('jobs')
        .insert([{
          ...newJob,
          company: companyProfile?.company_name, // Use company's name
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }]);
      
      if (error) throw error;
      
      setShowCreateJobModal(false);
      setNewJob({
        title: '',
        company: companyProfile?.company_name || '',
        company_logo: '',
        job_image: '',
        location: '',
        job_type: 'full-time',
        category: 'Technology',
        description: '',
        requirements: '',
        salary_range: '',
        deadline: '',
        is_active: true
      });
      
      await fetchJobs();
      alert('Job created successfully!');
    } catch (error) {
      console.error('Error creating job:', error);
      alert('Error creating job: ' + error.message);
    }
  };

  const handleUpdateJob = async (e) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          ...editJob,
          updated_at: new Date().toISOString()
        })
        .eq('id', editJob.id);
      
      if (error) throw error;
      
      setShowEditJobModal(false);
      await fetchJobs();
      alert('Job updated successfully!');
    } catch (error) {
      console.error('Error updating job:', error);
      alert('Error updating job: ' + error.message);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    
    try {
      const { error } = await supabase
        .from('jobs')
        .delete()
        .eq('id', jobToDelete.id);
      
      if (error) throw error;
      
      setShowDeleteModal(false);
      setJobToDelete(null);
      await fetchJobs();
      alert('Job deleted successfully!');
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job: ' + error.message);
    }
  };

  const handleUpdateApplicationStatus = async (applicationId, newStatus) => {
    setUpdatingStatus(true);
    
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', applicationId);
      
      if (error) throw error;
      
      // Add status history
      await supabase
        .from('application_status_history')
        .insert([{
          application_id: applicationId,
          status: newStatus,
          notes: `Status updated by ${companyProfile?.company_name}`,
          created_at: new Date().toISOString()
        }]);
      
      await fetchApplications();
      alert(`Application status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error updating status: ' + error.message);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleImageUpload = async (file, type, isEdit = false) => {
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
      
      if (isEdit) {
        setEditJob(prev => ({ ...prev, [type]: publicUrl }));
      } else {
        setNewJob(prev => ({ ...prev, [type]: publicUrl }));
      }
      
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
      setUploadType('');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      reviewed: 'bg-blue-100 text-blue-800',
      shortlisted: 'bg-purple-100 text-purple-800',
      interviewed: 'bg-indigo-100 text-indigo-800',
      offered: 'bg-green-100 text-green-800',
      accepted: 'bg-emerald-100 text-emerald-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getJobTypeColor = (jobType) => {
    const colors = {
      internship: 'bg-purple-100 text-purple-800',
      'full-time': 'bg-green-100 text-green-800',
      'part-time': 'bg-blue-100 text-blue-800',
      contract: 'bg-orange-100 text-orange-800'
    };
    return colors[jobType] || 'bg-gray-100 text-gray-800';
  };

  const StatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl shadow-lg p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Jobs</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalJobs}</p>
            <p className="text-xs text-green-600 mt-1">{stats.activeJobs} active</p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <FaBriefcase className="w-6 h-6 text-blue-900" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-lg p-6 border border-green-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Total Applications</p>
            <p className="text-3xl font-bold text-gray-900">{stats.totalApplications}</p>
            <p className="text-xs text-yellow-600 mt-1">{stats.pendingApplications} pending</p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <FaUsers className="w-6 h-6 text-green-900" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-6 border border-purple-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Shortlisted</p>
            <p className="text-3xl font-bold text-gray-900">{stats.shortlistedApplications}</p>
            <p className="text-xs text-purple-600 mt-1">For interview</p>
          </div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
            <FaUserCheck className="w-6 h-6 text-purple-900" />
          </div>
        </div>
      </div>
      
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl shadow-lg p-6 border border-emerald-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Hired</p>
            <p className="text-3xl font-bold text-gray-900">{stats.hiredApplications}</p>
            <p className="text-xs text-emerald-600 mt-1">Successfully placed</p>
          </div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
            <FaCheckCircle className="w-6 h-6 text-emerald-900" />
          </div>
        </div>
      </div>
    </div>
  );

  const JobsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Your Job Postings</h2>
          <p className="text-gray-600">Manage jobs for {companyProfile?.company_name}</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={jobSearchTerm}
              onChange={(e) => setJobSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowCreateJobModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-4 h-4" />
            <span>Post Job</span>
          </button>
          <button
            onClick={fetchJobs}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaSync className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {filteredJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <FaBriefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Jobs Posted Yet</h3>
          <p className="text-gray-600">Click "Post Job" to create your first job posting</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredJobs.map((job) => (
            <div key={job.id} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow">
              {job.job_image && (
                <img src={job.job_image} alt={job.title} className="w-full h-48 object-cover" />
              )}
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{job.title}</h3>
                    <p className="text-blue-600 font-medium">{job.company}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.job_type)}`}>
                    {job.job_type?.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FaMapMarkerAlt className="w-4 h-4 mr-2 text-gray-400" />
                    {job.location}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaDollarSign className="w-4 h-4 mr-2 text-gray-400" />
                    {job.salary_range || 'Competitive'}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FaClock className="w-4 h-4 mr-2 text-gray-400" />
                    Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}
                  </div>
                </div>
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${job.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {job.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditJob(job);
                        setShowEditJobModal(true);
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <FaEdit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        setJobToDelete(job);
                        setShowDeleteModal(true);
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FaTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ApplicationsTab = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Job Applications</h2>
          <p className="text-gray-600">Review and manage applicants for your jobs</p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, or job..."
              value={applicationSearchTerm}
              onChange={(e) => setApplicationSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending Review</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="accepted">Accepted</option>
            <option value="rejected">Rejected</option>
          </select>
          <button
            onClick={fetchApplications}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <FaSync className="w-4 h-4" />
            <span>Refresh</span>
          </button>
        </div>
      </div>
      
      {filteredApplications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center">
          <FaUsers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-600">Applications will appear here when candidates apply to your jobs</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applicant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Position</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((app) => (
                  <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{app.full_name || app.profiles?.full_name || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{app.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{app.jobs?.title || 'N/A'}</p>
                        <p className="text-sm text-gray-500">{app.jobs?.location}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={app.status}
                        onChange={(e) => handleUpdateApplicationStatus(app.id, e.target.value)}
                        disabled={updatingStatus}
                        className={`px-3 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-blue-500 ${getStatusColor(app.status)}`}
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="shortlisted">Shortlisted</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="offered">Offered</option>
                        <option value="accepted">Accepted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedApplication(app);
                          setShowApplicationDetails(true);
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center space-x-1"
                      >
                        <FaEye className="w-4 h-4" />
                        <span>View Details</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  // Create Job Modal
  const CreateJobModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Post New Job</h3>
            <button onClick={() => setShowCreateJobModal(false)} className="text-gray-400 hover:text-gray-600">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          <form onSubmit={handleCreateJob} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                <input
                  type="text"
                  value={newJob.title}
                  onChange={(e) => setNewJob({...newJob, title: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={newJob.location}
                  onChange={(e) => setNewJob({...newJob, location: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job Type</label>
                <select
                  value={newJob.job_type}
                  onChange={(e) => setNewJob({...newJob, job_type: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="internship">Internship</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newJob.category}
                  onChange={(e) => setNewJob({...newJob, category: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Marketing">Marketing</option>
                  <option value="Design">Design</option>
                  <option value="Sales">Sales</option>
                  <option value="Engineering">Engineering</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salary Range</label>
              <input
                type="text"
                value={newJob.salary_range}
                onChange={(e) => setNewJob({...newJob, salary_range: e.target.value})}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., $50,000 - $70,000 per year"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Description</label>
              <textarea
                value={newJob.description}
                onChange={(e) => setNewJob({...newJob, description: e.target.value})}
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the role, responsibilities, and what makes this opportunity great..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
              <textarea
                value={newJob.requirements}
                onChange={(e) => setNewJob({...newJob, requirements: e.target.value})}
                rows="3"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="List the qualifications, skills, and experience required..."
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Application Deadline</label>
                <input
                  type="date"
                  value={newJob.deadline}
                  onChange={(e) => setNewJob({...newJob, deadline: e.target.value})}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company Logo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e.target.files[0], 'company_logo', false)}
                  className="w-full"
                />
                {uploading && uploadType === 'company_logo' && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Job Image (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0], 'job_image', false)}
                className="w-full"
              />
              {uploading && uploadType === 'job_image' && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button type="button" onClick={() => setShowCreateJobModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                Cancel
              </button>
              <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Post Job
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  // Application Details Modal
  const ApplicationDetailsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900">Application Details</h3>
            <button onClick={() => setShowApplicationDetails(false)} className="text-gray-400 hover:text-gray-600">
              <span className="text-2xl">&times;</span>
            </button>
          </div>
          
          {selectedApplication && (
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FaUserCheck className="mr-2 text-blue-600" />
                  Applicant Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{selectedApplication.full_name || selectedApplication.profiles?.full_name || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-900">{selectedApplication.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="font-medium text-gray-900">{selectedApplication.phone || selectedApplication.profiles?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Applied Date</p>
                    <p className="font-medium text-gray-900">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <FaBriefcase className="mr-2 text-blue-600" />
                  Job Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Position</p>
                    <p className="font-medium text-gray-900">{selectedApplication.jobs?.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium text-gray-900">{selectedApplication.jobs?.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Job Type</p>
                    <p className="font-medium text-gray-900">{selectedApplication.jobs?.job_type}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Status</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedApplication.status)}`}>
                      {selectedApplication.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {selectedApplication.cover_letter && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                </div>
              )}
              
              {selectedApplication.resume_url && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Resume/CV</h4>
                  <a
                    href={selectedApplication.resume_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700"
                  >
                    <FaFileAlt className="w-4 h-4" />
                    <span>View Resume</span>
                  </a>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={() => setShowApplicationDetails(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowApplicationDetails(false);
                    // You can add message functionality here
                  }}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Contact Applicant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const DeleteConfirmModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Confirm Delete</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{jobToDelete?.title}"? This action cannot be undone.
        </p>
        <div className="flex justify-end space-x-3">
          <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button onClick={handleDeleteJob} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Company Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Company Dashboard</h1>
              <p className="text-blue-200 mt-1">{companyProfile?.company_name}</p>
            </div>
            <button
             onClick={handleSignOut}
              className="px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
             Sign Out
            </button>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <StatsCards />
        
        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-lg mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('jobs')}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'jobs'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaBriefcase className="inline mr-2" />
                My Jobs
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors ${
                  activeTab === 'applications'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FaUsers className="inline mr-2" />
                Applications
              </button>
            </nav>
          </div>
          
          <div className="p-6">
            {activeTab === 'jobs' && <JobsTab />}
            {activeTab === 'applications' && <ApplicationsTab />}
          </div>
        </div>
      </div>
      
      {/* Modals */}
      {showCreateJobModal && <CreateJobModal />}
      {showEditJobModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Edit Job</h3>
                <button onClick={() => setShowEditJobModal(false)} className="text-gray-400 hover:text-gray-600">
                  <span className="text-2xl">&times;</span>
                </button>
              </div>
              <form onSubmit={handleUpdateJob} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Job Title *</label>
                    <input
                      type="text"
                      value={editJob.title}
                      onChange={(e) => setEditJob({...editJob, title: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <input
                      type="text"
                      value={editJob.location}
                      onChange={(e) => setEditJob({...editJob, location: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowEditJobModal(false)} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button type="submit" className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Update Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {showDeleteModal && <DeleteConfirmModal />}
      {showApplicationDetails && <ApplicationDetailsModal />}
    </div>
  );
};

export default CompanyDashboard;