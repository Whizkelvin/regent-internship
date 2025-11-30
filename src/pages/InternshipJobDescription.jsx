import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import Header from '../components/Header'
import { 
  FaArrowLeft, 
  FaMapMarkerAlt, 
  FaBriefcase, 
  FaMoneyBillWave, 
  FaClock,
  FaBuilding,
  FaExternalLinkAlt,
  FaCalendarAlt,
  FaUsers,
  FaGraduationCap,
  FaCheckCircle,
  FaShare,
  FaBookmark,
  FaRegBookmark,
  FaHeart,
  FaRegHeart,
  FaLinkedin,
  FaTwitter,
  FaFacebook,
  FaLink,
  FaChevronDown,
  FaChevronUp,
  FaStar,
  FaRegStar,
  FaShoppingBag,
  FaTruck,

  FaAward,
  FaComment,
  FaUserCircle,
  FaPaperPlane,
  FaThumbsUp,
  FaRegThumbsUp
} from 'react-icons/fa'

const InternshipJobDescription = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saved, setSaved] = useState(false)
  const [liked, setLiked] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('description')
  const [similarJobs, setSimilarJobs] = useState([])
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetchJobDetails()
      fetchSimilarJobs()
      fetchComments()
    }
  }, [id])

  const fetchJobDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      setJob(data)
    } catch (error) {
      console.error('Error fetching job:', error)
      setError('Job not found')
    } finally {
      setLoading(false)
    }
  }

  const fetchSimilarJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('is_active', true)
        .neq('id', id)
        .limit(4)
        .order('created_at', { ascending: false })

      if (!error) setSimilarJobs(data || [])
    } catch (error) {
      console.error('Error fetching similar jobs:', error)
    }
  }

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('job_comments')
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .eq('job_id', id)
        .order('created_at', { ascending: false })

      if (!error) setComments(data || [])
    } catch (error) {
      console.error('Error fetching comments:', error)
    }
  }

  const handleApply = () => {
    if (job?.application_link) {
      window.open(job.application_link, '_blank')
    } else {
     console.log(`Application process for ${job.title} would open here.`)
    }
  }

  const handleSaveJob = () => {
    setSaved(!saved)
  }

  const handleLikeJob = () => {
    setLiked(!liked)
  }

  const handleShare = (platform) => {
    const url = window.location.href
    const title = `Check out this job: ${job.title} at ${job.company}`
    
    switch (platform) {
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank')
        break
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
        break
      case 'copy':
        navigator.clipboard.writeText(url)
        alert('Link copied to clipboard!')
        break
      default:
        break
    }
    setShowShareMenu(false)
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setCommentLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const { data, error } = await supabase
        .from('job_comments')
        .insert([
          {
            job_id: id,
            user_id: user.id,
            content: newComment,
            rating: 5
          }
        ])
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .single()

      if (!error) {
        setComments([data, ...comments])
        setNewComment('')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
    } finally {
      setCommentLoading(false)
    }
  }

  const handleLikeComment = async (commentId) => {
    // Implement comment liking functionality
    console.log('Liked comment:', commentId)
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
    return diffDays > 0 ? diffDays : 0
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">Loading career opportunity...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaBriefcase className="w-12 h-12 text-red-900" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Opportunity Not Available</h3>
            <p className="text-gray-600 mb-8">This position is no longer available or has been filled.</p>
            <button
              onClick={() => navigate('/jobs')}
              className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Explore Other Opportunities
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />
      
      {/* Enhanced Hero Section with E-commerce Style */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
            
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <button onClick={() => navigate('/jobs')} className="hover:text-green-900 transition-colors">
              Career Opportunities
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{job.category}</span>
            <span>/</span>
            <span className="text-green-900 font-semibold">{job.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left Column - Job Image & Gallery */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="bg-gray-100 rounded-3xl overflow-hidden aspect-video flex items-center justify-center">
                {job.job_image ? (
                  <img
                    src={job.job_image}
                    alt={job.company}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-8">
                    <FaBuilding className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Company Image</p>
                  </div>
                )}
              </div>

              {/* Thumbnail Gallery */}
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div key={item} className="bg-gray-100 rounded-xl aspect-square flex items-center justify-center cursor-pointer border-2 border-transparent hover:border-green-900 transition-colors">
                    {job.company_logo ? (
                      <img
                        src={job.company_logo}
                        alt={`${job.company} ${item}`}
                        className="w-12 h-12 object-contain"
                      />
                    ) : (
                      <FaBuilding className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                ))}
              </div>

              {/* Trust Badges - E-commerce Style */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FaTruck className="w-5 h-5 text-green-900" />
                  <span>Quick Application Process</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                
                  <span>Verified Employer</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FaAward className="w-5 h-5 text-green-900" />
                  <span>Premium Opportunity</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FaUsers className="w-5 h-5 text-green-900" />
                  <span>Career Support</span>
                </div>
              </div>
            </div>

            {/* Right Column - Job Details */}
            <div className="space-y-6">
              {/* Header with Actions */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-green-900 to-green-700 shadow-lg mb-3">
                    {job.job_type.replace('-', ' ').toUpperCase()}
                  </span>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">{job.title}</h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {job.company_logo && (
                        <img
                          src={job.company_logo}
                          alt={job.company}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="text-xl text-green-900 font-semibold">{job.company}</span>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-500">
                      <button
                        onClick={handleLikeJob}
                        className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                      >
                        {liked ? (
                          <FaHeart className="w-5 h-5 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-5 h-5" />
                        )}
                        <span>Save</span>
                      </button>
                      <button
                        onClick={() => setShowShareMenu(!showShareMenu)}
                        className="flex items-center space-x-1 hover:text-green-900 transition-colors relative"
                      >
                        <FaShare className="w-5 h-5" />
                        <span>Share</span>
                        
                        {showShareMenu && (
                          <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-48 z-50">
                            <div className="space-y-2">
                              {['linkedin', 'twitter', 'facebook', 'copy'].map((platform) => (
                                <button
                                  key={platform}
                                  onClick={() => handleShare(platform)}
                                  className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 capitalize"
                                >
                                  {platform === 'linkedin' && <FaLinkedin className="w-5 h-5 text-blue-600" />}
                                  {platform === 'twitter' && <FaTwitter className="w-5 h-5 text-blue-400" />}
                                  {platform === 'facebook' && <FaFacebook className="w-5 h-5 text-blue-600" />}
                                  {platform === 'copy' && <FaLink className="w-5 h-5 text-gray-600" />}
                                  <span>Share on {platform}</span>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Price & Rating - E-commerce Style */}
              <div className="flex items-center space-x-6 py-4 border-y border-gray-200">
                <div>
                  <span className="text-2xl font-bold text-gray-900">{job.salary_range || 'Competitive Salary'}</span>
                  <p className="text-sm text-gray-600">Monthly compensation</p>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar key={star} className="w-4 h-4 text-yellow-400" />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">(24 reviews)</span>
                </div>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaMapMarkerAlt className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900">{job.location}</p>
                    <p className="text-sm text-gray-600">Location</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaBriefcase className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">{job.job_type.replace('-', ' ')}</p>
                    <p className="text-sm text-gray-600">Employment Type</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaGraduationCap className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900">{job.category}</p>
                    <p className="text-sm text-gray-600">Field</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaCalendarAlt className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}
                    </p>
                    <p className="text-sm text-gray-600">Deadline</p>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to advance your career?</h3>
                    <p className="text-gray-600">Join {job.company} and take the next step in your professional journey</p>
                  </div>
                  <button
                    onClick={handleApply}
                    className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-3 shadow-lg"
                  >
                    <FaShoppingBag className="w-5 h-5" />
                    <span>Apply Now</span>
                  </button>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">{getDaysRemaining(job.deadline)}</div>
                  <div className="text-sm text-gray-600">Days Left</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">98%</div>
                  <div className="text-sm text-gray-600">Match Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Tabs */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-100 rounded-2xl p-1 mb-8">
              {['description', 'requirements', 'benefits', 'reviews'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 capitalize ${
                    activeTab === tab
                      ? 'bg-white text-green-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              {activeTab === 'description' && (
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Position Overview</h3>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {job.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'requirements' && (
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Qualifications & Requirements</h3>
                  <div className="space-y-4">
                    {job.requirements.split('\n').map((requirement, index) => (
                      <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl">
                        <FaCheckCircle className="w-6 h-6 text-green-900 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-lg">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'benefits' && (
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Benefits & Perks</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      'Professional mentorship program',
                      'Career development training',
                      'Networking opportunities',
                      'Flexible work arrangements',
                      'Health insurance coverage',
                      'Performance bonuses',
                      'Remote work options',
                      'Team building activities'
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <FaAward className="w-5 h-5 text-green-900 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Candidate Reviews</h3>
                  
                  {/* Add Comment Form */}
                  <form onSubmit={handleAddComment} className="bg-gray-50 rounded-2xl p-6 mb-8">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Share Your Experience</h4>
                    <div className="space-y-4">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Share your thoughts about this opportunity..."
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none"
                        rows="4"
                      />
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
                      >
                        <FaPaperPlane className="w-4 h-4" />
                        <span>{commentLoading ? 'Posting...' : 'Post Review'}</span>
                      </button>
                    </div>
                  </form>

                  {/* Comments List */}
                  <div className="space-y-6">
                    {comments.length === 0 ? (
                      <div className="text-center py-12">
                        <FaComment className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">No reviews yet. Be the first to share your experience!</p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div key={comment.id} className="bg-white border border-gray-200 rounded-2xl p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              {comment.profiles?.avatar_url ? (
                                <img
                                  src={comment.profiles.avatar_url}
                                  alt={comment.profiles.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <FaUserCircle className="w-12 h-12 text-gray-400" />
                              )}
                              <div>
                                <h5 className="font-semibold text-gray-900">{comment.profiles?.name || 'Anonymous'}</h5>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FaStar key={star} className="w-4 h-4 text-yellow-400" />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <button
                              onClick={() => handleLikeComment(comment.id)}
                              className="flex items-center space-x-1 text-gray-400 hover:text-green-900 transition-colors"
                            >
                              <FaRegThumbsUp className="w-4 h-4" />
                              <span className="text-sm">12</span>
                            </button>
                          </div>
                          <p className="text-gray-700 leading-relaxed">{comment.content}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Similar Opportunities */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Similar Opportunities</h3>
              <div className="space-y-4">
                {similarJobs.map((similarJob) => (
                  <div
                    key={similarJob.id}
                    onClick={() => navigate(`/job/${similarJob.id}`)}
                    className="p-4 rounded-2xl border border-gray-200 hover:border-green-900 hover:shadow-md transition-all duration-300 cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      {similarJob.company_logo && (
                        <img
                          src={similarJob.company_logo}
                          alt={similarJob.company}
                          className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-green-900 transition-colors mb-1">
                          {similarJob.title}
                        </h4>
                        <p className="text-green-900 text-sm font-medium mb-2">{similarJob.company}</p>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span className="flex items-center space-x-1">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            <span>{similarJob.location}</span>
                          </span>
                          <span className="capitalize">{similarJob.job_type.replace('-', ' ')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Career Support */}
            <div className="bg-gradient-to-br from-green-950 to-green-800 rounded-3xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Career Support</h3>
              <div className="space-y-3">
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-left flex items-center space-x-3">
                  <FaGraduationCap className="w-5 h-5" />
                  <span>Schedule Consultation</span>
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-left flex items-center space-x-3">
                  <FaUsers className="w-5 h-5" />
                  <span>Resume Review</span>
                </button>
                <button className="w-full bg-white/10 hover:bg-white/20 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 text-left flex items-center space-x-3">
                  <FaAward className="w-5 h-5" />
                  <span>Interview Prep</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InternshipJobDescription