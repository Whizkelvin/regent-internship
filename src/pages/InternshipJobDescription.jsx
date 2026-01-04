import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import Header from "../components/Header";
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
  FaRegThumbsUp,
  FaUpload,
  FaFilePdf,
  FaFileWord,
  FaUser,
  FaEnvelope,
  FaPhone,
  FaFileAlt,
  FaTimes,
  FaPaperclip,
  FaDownload
} from "react-icons/fa";

// Extracted Components
const ApplicationStatusBadge = ({ userApplication }) => {
  if (!userApplication) return null;

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
    reviewed: "bg-blue-100 text-blue-800 border-blue-200",
    shortlisted: "bg-purple-100 text-purple-800 border-purple-200",
    interviewed: "bg-indigo-100 text-indigo-800 border-indigo-200",
    offered: "bg-green-100 text-green-800 border-green-200",
    rejected: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium border ${statusColors[userApplication.status] || 'bg-gray-100 text-gray-800 border-gray-200'} mb-4`}>
      <FaCheckCircle className="w-4 h-4 mr-2" />
      Application Status: {userApplication.status?.charAt(0).toUpperCase() + userApplication.status?.slice(1)}
    </div>
  );
};

const MessagesSection = ({ 
  applicationMessages, 
  showMessages, 
  newMessage, 
  sendingMessage, 
  currentUserId,
  onToggleMessages, 
  onSendMessage, 
  onNewMessageChange 
}) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (showMessages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [applicationMessages, showMessages]);

  return (
    <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Application Messages</h3>
        <button
          onClick={onToggleMessages}
          className="text-green-900 hover:text-green-800"
        >
          {showMessages ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {showMessages && (
        <div className="space-y-6">
          <div className="space-y-4 max-h-96 overflow-y-auto p-4 border border-gray-200 rounded-xl">
            {applicationMessages.length === 0 ? (
              <div className="text-center py-8">
                <FaComment className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600">No messages yet.</p>
              </div>
            ) : (
              applicationMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-xs md:max-w-md rounded-2xl p-4 ${message.sender_id === currentUserId ? 'bg-green-100' : 'bg-gray-100'}`}>
                    <div className="flex items-center space-x-2 mb-2">
                      <FaUserCircle className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium">
                        {message.sender?.full_name || 'Admin'}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-gray-800">{message.message}</p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={onSendMessage} className="space-y-4">
            <div className="flex space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={onNewMessageChange}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                disabled={sendingMessage}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || sendingMessage}
                className="px-6 py-3 bg-green-900 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 font-medium transition-colors flex items-center space-x-2"
              >
                <FaPaperPlane className="w-5 h-5" />
                <span>{sendingMessage ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
            <p className="text-sm text-gray-500">Message the admin about your application</p>
          </form>
        </div>
      )}
    </div>
  );
};

const InternshipJobDescription = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);
  const [liked, setLiked] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [similarJobs, setSimilarJobs] = useState([]);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  // Application states
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    cover_letter: "",
    resume_url: ""
  });
  const [uploadingResume, setUploadingResume] = useState(false);
  const [userHasApplied, setUserHasApplied] = useState(false);
  const [userApplication, setUserApplication] = useState(null);
  const [applicationMessages, setApplicationMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Fixed: Separate data fetching from user-specific checks
  useEffect(() => {
    const abortController = new AbortController();
    
    if (id) {
      fetchJobDetails(abortController.signal);
      fetchSimilarJobs(abortController.signal);
      fetchComments(abortController.signal);
    }

    return () => {
      abortController.abort();
    };
  }, [id]);

  // Fixed: User application check in separate useEffect
  useEffect(() => {
    const checkUserApplication = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !id) {
          setCurrentUserId(null);
          return;
        }

        setCurrentUserId(user.id);
        
        const { data, error } = await supabase
          .from('applications')
          .select('*')
          .eq('job_id', id)
          .eq('user_id', user.id)
          .maybeSingle(); // Use maybeSingle instead of single
        
        if (data) {
          setUserHasApplied(true);
          setUserApplication(data);
          fetchApplicationMessages(data.id);
        } else {
          setUserHasApplied(false);
          setUserApplication(null);
        }
      } catch (error) {
        console.error("Error checking application:", error);
        setUserHasApplied(false);
      }
    };
    
    checkUserApplication();
  }, [id]);

  // Fixed: Use useCallback with proper dependencies
  const fetchJobDetails = useCallback(async (signal) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", id)
        .maybeSingle(); // Use maybeSingle to handle no results

      if (error) throw error;
      if (!data) {
        setError("Job not found");
        return;
      }
      setJob(data);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error("Error fetching job:", error);
      setError("Failed to load job details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchSimilarJobs = useCallback(async (signal) => {
    try {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("is_active", true)
        .neq("id", id)
        .limit(4)
        .order("created_at", { ascending: false });

      if (!error) setSimilarJobs(data || []);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error("Error fetching similar jobs:", error);
    }
  }, [id]);

  const fetchComments = useCallback(async (signal) => {
    try {
      const { data, error } = await supabase
        .from("job_comments")
        .select(
          `
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `
        )
        .eq("job_id", id)
        .order("created_at", { ascending: false });

      if (!error) setComments(data || []);
    } catch (error) {
      if (error.name === 'AbortError') return;
      console.error("Error fetching comments:", error);
    }
  }, [id]);

  const fetchApplicationMessages = useCallback(async (applicationId) => {
    try {
      const { data, error } = await supabase
        .from("application_messages")
        .select(`
          *,
          sender:profiles!sender_id (full_name, avatar_url),
          receiver:profiles!receiver_id (full_name, avatar_url)
        `)
        .eq("application_id", applicationId)
        .order("created_at", { ascending: true });

      if (!error) setApplicationMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  }, []);

  // Fixed: Stable input handlers
  const handleInputChange = useCallback((field) => (e) => {
    setApplicationForm(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  }, []);

  const handleNewMessageChange = useCallback((e) => {
    setNewMessage(e.target.value);
  }, []);

  const handleNewCommentChange = useCallback((e) => {
    setNewComment(e.target.value);
  }, []);

  const handleUploadResume = useCallback(async (file) => {
    try {
      setUploadingResume(true);
      
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (file.size > MAX_FILE_SIZE) {
        alert("File size should be less than 5MB");
        return null;
      }

      const validTypes = [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ];
      if (!validTypes.includes(file.type)) {
        alert("Please upload a PDF or Word document");
        return null;
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `resumes/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('job-portal-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('job-portal-files')
        .getPublicUrl(filePath);

      setApplicationForm(prev => ({ ...prev, resume_url: publicUrl }));
      return publicUrl;
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Error uploading resume: " + error.message);
      return null;
    } finally {
      setUploadingResume(false);
    }
  }, []);

  const handleApply = useCallback(async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        alert("Please login to apply for this job");
        navigate("/login");
        return;
      }
      
      // Pre-fill user data
      setApplicationForm(prev => ({
        ...prev,
        email: user.email || "",
        full_name: user.user_metadata?.full_name || user.user_metadata?.name || ""
      }));
      
      setShowApplicationModal(true);
    } catch (error) {
      console.error("Error in handleApply:", error);
      alert("Please login to apply for this job");
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmitApplication = useCallback(async (e) => {
    e.preventDefault();
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to apply");
        return;
      }

      if (!applicationForm.full_name || !applicationForm.email || !applicationForm.resume_url) {
        alert("Please fill all required fields and upload your resume");
        return;
      }

      const { data, error } = await supabase
        .from('applications')
        .insert([{
          job_id: id,
          user_id: user.id,
          full_name: applicationForm.full_name,
          email: applicationForm.email,
          phone: applicationForm.phone,
          cover_letter: applicationForm.cover_letter,
          resume_url: applicationForm.resume_url,
          status: 'pending',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('application_status_history')
        .insert([{
          application_id: data.id,
          status: 'pending',
          notes: 'Application submitted',
          created_at: new Date().toISOString()
        }]);

      setUserHasApplied(true);
      setUserApplication(data);
      setShowApplicationModal(false);
      
      setApplicationForm({
        full_name: "",
        email: "",
        phone: "",
        cover_letter: "",
        resume_url: ""
      });

      alert("Application submitted successfully! We'll review your application soon.");
    } catch (error) {
      console.error("Error submitting application:", error);
      alert("Error submitting application: " + error.message);
    }
  }, [id, applicationForm, supabase]);

  const sendMessageToAdmin = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !userApplication) return;

    try {
      setSendingMessage(true);
      const { data: { user } } = await supabase.auth.getUser();

      const { error } = await supabase
        .from('application_messages')
        .insert([{
          application_id: userApplication.id,
          sender_id: user.id,
          receiver_id: null,
          message: newMessage,
          is_read: false,
          created_at: new Date().toISOString()
        }]);

      if (error) throw error;

      setNewMessage("");
      fetchApplicationMessages(userApplication.id);
      alert("Message sent to admin!");
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Error sending message");
    } finally {
      setSendingMessage(false);
    }
  }, [userApplication, newMessage, fetchApplicationMessages]);

  const handleSaveJob = useCallback(() => {
    setSaved(prev => !prev);
  }, []);

  const handleLikeJob = useCallback(() => {
    setLiked(prev => !prev);
  }, []);

  const handleShare = useCallback((platform) => {
    const url = window.location.href;
    const title = `Check out this job: ${job?.title} at ${job?.company}`;

    switch (platform) {
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        break;
      default:
        break;
    }
    setShowShareMenu(false);
  }, [job]);

  const handleAddComment = useCallback(async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setCommentLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Please login to add a comment");
        return;
      }

      const { data, error } = await supabase
        .from("job_comments")
        .insert([{
          job_id: id,
          user_id: user.id,
          content: newComment,
          rating: 5,
        }])
        .select(`
          *,
          profiles:user_id (
            name,
            avatar_url
          )
        `)
        .single();

      if (!error) {
        setComments(prev => [data, ...prev]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Failed to add comment");
    } finally {
      setCommentLoading(false);
    }
  }, [id, newComment, supabase]);

  const handleLikeComment = useCallback((commentId) => {
    // Implement like functionality
  }, []);

  const getJobTypeColor = useCallback((jobType) => {
    switch (jobType) {
      case "internship":
        return "from-green-900 to-green-700";
      case "full-time":
        return "from-blue-900 to-blue-700";
      case "part-time":
        return "from-purple-900 to-purple-700";
      case "contract":
        return "from-orange-900 to-orange-700";
      default:
        return "from-gray-900 to-gray-700";
    }
  }, []);

  const getDaysRemaining = useCallback((deadline) => {
    if (!deadline) return "Open";
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }, []);

  // Fixed: Application Modal using useMemo
  const ApplicationModal = useMemo(() => {
    if (!showApplicationModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
        <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Apply for {job?.title}</h3>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="Close modal"
              >
                <FaTimes className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={applicationForm.full_name}
                      onChange={handleInputChange('full_name')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="John Doe"
                      required
                      disabled={uploadingResume}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={applicationForm.email}
                      onChange={handleInputChange('email')}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="john@example.com"
                      required
                      disabled={uploadingResume}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={applicationForm.phone}
                    onChange={handleInputChange('phone')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                    placeholder="+1234567890"
                    disabled={uploadingResume}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume/CV *
                  </label>
                  {applicationForm.resume_url ? (
                    <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <FaFilePdf className="w-8 h-8 text-red-500" />
                        <div>
                          <p className="font-medium text-gray-900">Resume uploaded</p>
                          <p className="text-sm text-gray-500">Click to view</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleInputChange('resume_url')({ target: { value: "" } })}
                        className="text-red-600 hover:text-red-800"
                        disabled={uploadingResume}
                      >
                        <FaTimes className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 transition-colors">
                      <FaUpload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Upload your resume (PDF or Word)</p>
                      <input
                        type="file"
                        id="resume-upload"
                        accept=".pdf,.doc,.docx"
                        className="hidden"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) await handleUploadResume(file);
                        }}
                        disabled={uploadingResume}
                      />
                      <label
                        htmlFor="resume-upload"
                        className={`inline-flex items-center space-x-2 px-6 py-3 ${uploadingResume ? 'bg-gray-300 cursor-not-allowed' : 'bg-gray-100 hover:bg-gray-200 cursor-pointer'} text-gray-700 rounded-lg transition-colors`}
                      >
                        <FaUpload className="w-5 h-5" />
                        <span>{uploadingResume ? 'Uploading...' : 'Choose File'}</span>
                      </label>
                      <p className="text-xs text-gray-500 mt-2">Max file size: 5MB</p>
                    </div>
                  )}
                  {uploadingResume && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full animate-pulse"></div>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">Uploading...</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    value={applicationForm.cover_letter}
                    onChange={handleInputChange('cover_letter')}
                    rows="6"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none"
                    placeholder="Tell us why you're a great fit for this position..."
                    disabled={uploadingResume}
                  />
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowApplicationModal(false)}
                    className="px-6 py-3 text-gray-600 hover:text-gray-900 font-medium"
                    disabled={uploadingResume}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!applicationForm.resume_url || uploadingResume}
                    className="px-6 py-3 bg-green-900 text-white rounded-lg hover:bg-green-800 disabled:bg-gray-400 font-medium transition-colors flex items-center space-x-2"
                  >
                    <FaPaperPlane className="w-5 h-5" />
                    <span>Submit Application</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }, [showApplicationModal, job, applicationForm, uploadingResume, handleSubmitApplication, handleInputChange, handleUploadResume]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600 text-lg">
              Loading career opportunity...
            </p>
          </div>
        </div>
      </div>
    );
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
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Opportunity Not Available
            </h3>
            <p className="text-gray-600 mb-8">
              This position is no longer available or has been filled.
            </p>
            <button
              onClick={() => navigate("/jobs")}
              className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
            >
              Explore Other Opportunities
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-8">
            <button
              onClick={() => navigate("/jobs")}
              className="hover:text-green-900 transition-colors"
            >
              Career Opportunities
            </button>
            <span>/</span>
            <span className="text-gray-900 font-medium">{job.category}</span>
            <span>/</span>
            <span className="text-green-900 font-semibold">{job.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <div className="space-y-4">
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

              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FaTruck className="w-5 h-5 text-green-900" />
                  <span>Quick Application Process</span>
                </div>
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <FaCheckCircle className="w-5 h-5 text-green-900" />
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

            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-flex items-center px-4 py-2 rounded-2xl text-sm font-semibold text-white bg-gradient-to-r from-green-900 to-green-700 shadow-lg mb-3">
                    {job.job_type.replace("-", " ").toUpperCase()}
                  </span>
                  <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      {job.company_logo && (
                        <img
                          src={job.company_logo}
                          alt={job.company}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <span className="text-xl text-green-900 font-semibold">
                        {job.company}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4 text-gray-500">
                      <button
                        onClick={handleLikeJob}
                        className="flex items-center space-x-1 hover:text-red-500 transition-colors"
                        aria-label={liked ? "Unlike job" : "Like job"}
                      >
                        {liked ? (
                          <FaHeart className="w-5 h-5 text-red-500" />
                        ) : (
                          <FaRegHeart className="w-5 h-5" />
                        )}
                        <span>Save</span>
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setShowShareMenu(prev => !prev)}
                          className="flex items-center space-x-1 hover:text-green-900 transition-colors"
                          aria-label="Share job"
                        >
                          <FaShare className="w-5 h-5" />
                          <span>Share</span>
                        </button>

                        {showShareMenu && (
                          <div className="absolute top-8 right-0 bg-white rounded-2xl shadow-2xl border border-gray-200 p-4 min-w-48 z-50">
                            <div className="space-y-2">
                              {["linkedin", "twitter", "facebook", "copy"].map(
                                (platform) => (
                                  <button
                                    key={platform}
                                    onClick={() => handleShare(platform)}
                                    className="flex items-center space-x-3 w-full p-3 rounded-xl hover:bg-gray-50 transition-colors text-gray-700 capitalize"
                                  >
                                    {platform === "linkedin" && (
                                      <FaLinkedin className="w-5 h-5 text-blue-600" />
                                    )}
                                    {platform === "twitter" && (
                                      <FaTwitter className="w-5 h-5 text-blue-400" />
                                    )}
                                    {platform === "facebook" && (
                                      <FaFacebook className="w-5 h-5 text-blue-600" />
                                    )}
                                    {platform === "copy" && (
                                      <FaLink className="w-5 h-5 text-gray-600" />
                                    )}
                                    <span>Share on {platform}</span>
                                  </button>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-6 py-4 border-y border-gray-200">
                <div>
                  <span className="text-2xl font-bold text-gray-900">
                   GHS {job.salary_range || "Competitive Salary"}
                  </span>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaMapMarkerAlt className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {job.location}
                    </p>
                    <p className="text-sm text-gray-600">Location</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaBriefcase className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900 capitalize">
                      {job.job_type.replace("-", " ")}
                    </p>
                    <p className="text-sm text-gray-600">Employment Type</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaGraduationCap className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {job.category}
                    </p>
                    <p className="text-sm text-gray-600">Field</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <FaCalendarAlt className="w-5 h-5 text-green-900" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {job.deadline
                        ? new Date(job.deadline).toLocaleDateString()
                        : "Open"}
                    </p>
                    <p className="text-sm text-gray-600">Deadline</p>
                  </div>
                </div>
              </div>

              {userHasApplied && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        Application Submitted ✓
                      </h4>
                      <ApplicationStatusBadge userApplication={userApplication} />
                      <p className="text-sm text-gray-600">
                        Applied on: {new Date(userApplication.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => setShowMessages(true)}
                      className="text-green-900 hover:text-green-800 font-medium flex items-center space-x-2"
                    >
                      <FaEnvelope className="w-5 h-5" />
                      <span>View Messages</span>
                    </button>
                  </div>
                </div>
              )}

              {!userHasApplied && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Ready to advance your career?
                      </h3>
                      <p className="text-gray-600">
                        Join {job.company} and take the next step in your professional journey
                      </p>
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
              )}

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">15</div>
                  <div className="text-sm text-gray-600">Applications</div>
                </div>
                <div className="p-4 bg-white rounded-xl border border-gray-200">
                  <div className="text-2xl font-bold text-gray-900">
                    {getDaysRemaining(job.deadline)}
                  </div>
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

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <div className="md:hidden flex overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4">
                <div className="flex space-x-2 min-w-min">
                  {["description", "requirements", "benefits", "reviews"].map(
                    (tab) => (
                      <button
                        key={`tab-${tab}`}
                        onClick={() => setActiveTab(tab)}
                        className={`py-3 px-5 rounded-xl font-semibold transition-all duration-300 capitalize whitespace-nowrap flex-shrink-0 ${
                          activeTab === tab
                            ? "bg-green-900 text-white shadow-sm"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {tab}
                      </button>
                    )
                  )}
                </div>
              </div>
              
              <div className="hidden md:flex space-x-1 bg-gray-100 rounded-2xl p-1">
                {["description", "requirements", "benefits", "reviews"].map(
                  (tab) => (
                    <button
                      key={`tab-${tab}`}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 capitalize ${
                        activeTab === tab
                          ? "bg-white text-green-900 shadow-sm"
                          : "text-gray-600 hover:text-gray-900"
                      }`}
                    >
                      {tab}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
              {activeTab === "description" && (
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Position Overview
                  </h3>
                  <div className="text-gray-700 leading-relaxed space-y-4">
                    {job.description && job.description.split("\n").map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "requirements" && (
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Qualifications & Requirements
                  </h3>
                  <div className="space-y-4">
                    {job.requirements && job.requirements.split("\n").map((requirement, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl"
                      >
                        <FaCheckCircle className="w-6 h-6 text-green-900 mt-1 flex-shrink-0" />
                        <span className="text-gray-700 text-lg">
                          {requirement}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "benefits" && (
                <div className="prose prose-lg max-w-none">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Benefits & Perks
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[
                      "Professional mentorship program",
                      "Career development training",
                      "Networking opportunities",
                      "Flexible work arrangements",
                      "Health insurance coverage",
                      "Performance bonuses",
                      "Remote work options",
                      "Team building activities",
                    ].map((benefit, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <FaAward className="w-5 h-5 text-green-900 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "reviews" && (
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">
                    Candidate Reviews
                  </h3>

                  <form
                    onSubmit={handleAddComment}
                    className="bg-gray-50 rounded-2xl p-6 mb-8"
                  >
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      Share Your Experience
                    </h4>
                    <div className="space-y-4">
                      <textarea
                        value={newComment}
                        onChange={handleNewCommentChange}
                        placeholder="Share your thoughts about this opportunity..."
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-900 focus:border-transparent resize-none"
                        rows="4"
                        disabled={commentLoading}
                      />
                      <button
                        type="submit"
                        disabled={commentLoading || !newComment.trim()}
                        className="bg-gradient-to-r from-green-900 to-green-800 hover:from-green-800 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
                      >
                        <FaPaperPlane className="w-4 h-4" />
                        <span>
                          {commentLoading ? "Posting..." : "Post Review"}
                        </span>
                      </button>
                    </div>
                  </form>

                  <div className="space-y-6">
                    {comments.length === 0 ? (
                      <div className="text-center py-12">
                        <FaComment className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-600">
                          No reviews yet. Be the first to share your experience!
                        </p>
                      </div>
                    ) : (
                      comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-white border border-gray-200 rounded-2xl p-6"
                        >
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
                                <h5 className="font-semibold text-gray-900">
                                  {comment.profiles?.name || "Anonymous"}
                                </h5>
                                <div className="flex items-center space-x-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <FaStar
                                        key={star}
                                        className="w-4 h-4 text-yellow-400"
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-gray-500">
                                    {new Date(
                                      comment.created_at
                                    ).toLocaleDateString()}
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
                          <p className="text-gray-700 leading-relaxed">
                            {comment.content}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {userHasApplied && (
              <MessagesSection
                applicationMessages={applicationMessages}
                showMessages={showMessages}
                newMessage={newMessage}
                sendingMessage={sendingMessage}
                currentUserId={currentUserId}
                onToggleMessages={() => setShowMessages(prev => !prev)}
                onSendMessage={sendMessageToAdmin}
                onNewMessageChange={handleNewMessageChange}
              />
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Similar Opportunities
              </h3>
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
                        <p className="text-green-900 text-sm font-medium mb-2">
                          {similarJob.company}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          <span className="flex items-center space-x-1">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            <span>{similarJob.location}</span>
                          </span>
                          <span className="capitalize">
                            {similarJob.job_type.replace("-", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                Need Help with Your Application?
              </h3>
              <p className="text-gray-600 mb-4">
                Our career advisors are here to help you prepare the perfect application.
              </p>
              <button
                onClick={() => navigate("/career-support")}
                className="w-full bg-white border border-blue-300 text-blue-900 hover:bg-blue-50 py-3 rounded-xl font-medium transition-colors"
              >
                Get Career Support
              </button>
            </div>
          </div>
        </div>
      </div>

      {ApplicationModal}
    </div>
  );
};

export default InternshipJobDescription;