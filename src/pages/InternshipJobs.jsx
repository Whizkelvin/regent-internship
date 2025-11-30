import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import { 
  FaSearch, 
  FaFilter, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaMoneyBillWave, 
  FaClock,
  FaBuilding,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaStar,
  FaBookmark,
  FaShare,
  FaChevronDown,
  FaChevronUp,
  FaUsers,
  FaGraduationCap,
  FaChartLine,
  FaAward,
  FaHeart,
  FaRegBookmark,
  FaRegHeart
} from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'


const InternshipJobs = () => {
  const [jobs, setJobs] = useState([])
  const [filteredJobs, setFilteredJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filters, setFilters] = useState({
    jobType: '',
    category: '',
    location: '',
    salaryRange: ''
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [savedJobs, setSavedJobs] = useState(new Set())
  const navigate = useNavigate();

  // Fetch jobs from Supabase
  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setJobs(data || [])
      setFilteredJobs(data || [])
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filter jobs based on search and filters
  useEffect(() => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (filters.jobType) {
      filtered = filtered.filter(job => job.job_type === filters.jobType)
    }

    if (filters.category) {
      filtered = filtered.filter(job => job.category === filters.category)
    }

    if (filters.location) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      )
    }

    setFilteredJobs(filtered)
  }, [searchTerm, filters, jobs])

  // const handleApply = (job) => {
  //   if (job.application_link) {
  //     window.open(job.application_link, '_blank')
  //   } else {
  //     console.log(`Application process for ${job.title} at ${job.company} would open here.`)
  //   }
  // }

  const handleSaveJob = (jobId) => {
    const newSavedJobs = new Set(savedJobs)
    if (newSavedJobs.has(jobId)) {
      newSavedJobs.delete(jobId)
    } else {
      newSavedJobs.add(jobId)
    }
    setSavedJobs(newSavedJobs)
  }

  const handleShareJob = (job) => {
    if (navigator.share) {
      navigator.share({
        title: job.title,
        text: `Check out this job: ${job.title} at ${job.company}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Job link copied to clipboard!')
    }
  }

  const clearFilters = () => {
    setFilters({
      jobType: '',
      category: '',
      location: '',
      salaryRange: ''
    })
    setSearchTerm('')
  }

  const getJobTypeColor = (jobType) => {
    switch (jobType) {
      case 'internship': return 'from-green-900 to-green-700'
      case 'full-time': return 'from-blue-900 to-blue-700'
      case 'part-time': return 'from-purple-900 to-purple-700'
      case 'contract': return 'from-orange-900 to-orange-700'
      default: return 'from-gray-900 to-gray-700'
    }
  }

  const getDaysRemaining = (deadline) => {
    const today = new Date()
    const deadlineDate = new Date(deadline)
    const diffTime = deadlineDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Curating career opportunities...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Enhanced Hero Section */}
      <div className="relative bg-gradient-to-br from-gray-900 via-green-950 to-gray-900 text-white py-20 md:py-28 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:40px_40px]"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-2 h-12 bg-gradient-to-b from-red-900 to-green-900 rounded-full"></div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Career Portal
              </h1>
              <div className="w-2 h-12 bg-gradient-to-b from-green-900 to-red-900 rounded-full"></div>
            </div>
            <p className="text-xl md:text-2xl text-green-200 max-w-3xl mx-auto leading-relaxed">
              Discover premium internship and career opportunities from industry-leading organizations
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-900/20 to-green-800/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-500"></div>
              <div className="relative bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-2">
                <div className="flex items-center">
                  <FaSearch className="ml-4 text-green-300 w-5 h-5 flex-shrink-0" />
                  <input
                    type="text"
                    placeholder="Search positions, companies, or technologies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-transparent border-0 text-white placeholder-green-200 text-lg px-4 py-4 focus:outline-none focus:ring-0"
                  />
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl transition-all duration-300 mr-2"
                  >
                    <FaFilter className="w-4 h-4" />
                    <span>Filters</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    

      {/* Enhanced Filters Section */}
      {showFilters && (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Refine Your Search</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
              >
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Employment Type</label>
                <select
                  value={filters.jobType}
                  onChange={(e) => setFilters({...filters, jobType: e.target.value})}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all duration-300"
                >
                  <option value="">All Employment Types</option>
                  <option value="internship">Internship Program</option>
                  <option value="full-time">Full-Time Position</option>
                  <option value="part-time">Part-Time Role</option>
                  <option value="contract">Contract Basis</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Professional Field</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({...filters, category: e.target.value})}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all duration-300"
                >
                  <option value="">All Professional Fields</option>
                  <option value="Technology">Technology & Engineering</option>
                  <option value="Marketing">Marketing & Sales</option>
                  <option value="Business">Business Development</option>
                  <option value="Data Science">Data Science & Analytics</option>
                  <option value="Finance">Finance & Banking</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Geographic Location</label>
                <input
                  type="text"
                  placeholder="City, Region, or Remote"
                  value={filters.location}
                  onChange={(e) => setFilters({...filters, location: e.target.value})}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all duration-300"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Compensation Range</label>
                <select
                  value={filters.salaryRange}
                  onChange={(e) => setFilters({...filters, salaryRange: e.target.value})}
                  className="w-full p-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-900 focus:border-transparent transition-all duration-300"
                >
                  <option value="">All Compensation Ranges</option>
                  <option value="0-1000">Up to GHS 1,000</option>
                  <option value="1000-2000">GHS 1,000 - 2,000</option>
                  <option value="2000-3000">GHS 2,000 - 3,000</option>
                  <option value="3000+">GHS 3,000+</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        {/* Results Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Career Opportunities
            </h2>
            <p className="text-gray-600 text-lg">
              {filteredJobs.length} curated position{filteredJobs.length !== 1 ? 's' : ''} matching your criteria
            </p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-green-900 hover:text-green-800 font-semibold transition-colors duration-300"
            >
              <FaFilter className="w-4 h-4" />
              <span>Advanced Filters</span>
              {showFilters ? <FaChevronUp className="w-3 h-3" /> : <FaChevronDown className="w-3 h-3" />}
            </button>
          </div>
        </div>

        {/* Enhanced Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No positions found</h3>
            <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
              We couldn't find any opportunities matching your current search criteria.
            </p>
            <button
              onClick={clearFilters}
              className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Reset Search Criteria
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-3xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:scale-[1.02]"
               onClick={() => navigate(`/job/${job.id}`)}
              >
                {/* Job Header with Image */}
                <div className="relative h-48 overflow-hidden">
                  {job.job_image ? (
                    <img
                      src={job.job_image}
                      alt={job.company}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                      <FaBuilding className="w-16 h-16 text-white/50" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                  
                  {/* Company Logo */}
                  {job.company_logo && (
                    <div className="absolute top-4 left-4">
                      <img
                        src={job.company_logo}
                        alt={job.company}
                        className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
                      />
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="absolute top-4 right-4 flex space-x-2">
                    <button
                      onClick={() => handleSaveJob(job.id)}
                      className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all duration-300"
                    >
                      {savedJobs.has(job.id) ? (
                        <FaBookmark className="w-5 h-5" />
                      ) : (
                        <FaRegBookmark className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => handleShareJob(job)}
                      className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-xl hover:bg-white/30 transition-all duration-300"
                    >
                      <FaShare className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Job Type Badge */}
                  <div className="absolute bottom-4 left-4">
                    <span className={`inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r ${getJobTypeColor(job.job_type)} shadow-lg`}>
                      {job.job_type.replace('-', ' ').toUpperCase()}
                    </span>
                  </div>

                  {/* Deadline Indicator */}
                  {job.deadline && (
                    <div className="absolute bottom-4 right-4">
                      <div className="bg-red-900/90 text-white px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                        {getDaysRemaining(job.deadline)}d left
                      </div>
                    </div>
                  )}
                </div>

                {/* Job Content */}
                <div className="p-6">
                  {/* Title and Company */}
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 leading-tight">
                      {job.title}
                    </h3>
                    <p className="text-green-900 font-semibold text-lg">{job.company}</p>
                  </div>

                  {/* Job Details Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaMapMarkerAlt className="w-4 h-4 text-green-900 flex-shrink-0" />
                      <span className="text-sm font-medium">{job.location}</span>
                    </div>
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaBriefcase className="w-4 h-4 text-green-900 flex-shrink-0" />
                      <span className="text-sm font-medium capitalize">{job.job_type.replace('-', ' ')}</span>
                    </div>
                    {job.salary_range && (
                      <div className="flex items-center space-x-3 text-gray-600">
                        <FaMoneyBillWave className="w-4 h-4 text-green-900 flex-shrink-0" />
                        <span className="text-sm font-medium">{job.salary_range}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3 text-gray-600">
                      <FaChartLine className="w-4 h-4 text-green-900 flex-shrink-0" />
                      <span className="text-sm font-medium">{job.category}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Action Button */}
                  <button
                    onClick={() => handleApply(job)}
                    className="w-full bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 group/btn"
                  >
                    <span>Apply for Position</span>
                    <FaExternalLinkAlt className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Footer CTA */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] bg-[length:60px_60px]"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto text-center px-4 md:px-8">
          <div className="w-24 h-1 bg-gradient-to-r from-green-900 to-red-900 rounded-full mx-auto mb-8"></div>
          <h3 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
            Launch Your Professional Journey
          </h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Join the elite network of Regent University alumni shaping the future of industry and innovation across Ghana and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-gradient-to-r from-green-900 to-green-700 hover:from-green-800 hover:to-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl">
              Create Professional Profile
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-all duration-300 backdrop-blur-sm">
              Schedule Career Consultation
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InternshipJobs