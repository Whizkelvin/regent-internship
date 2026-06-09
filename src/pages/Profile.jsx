import React, { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FaUser, 
  FaEnvelope, 
  FaIdCard, 
  FaGraduationCap, 
  FaPhone, 
  FaCamera, 
  FaEdit, 
  FaUniversity, 
  FaCalendarAlt,
  FaSave,
  FaTimes,
  FaBriefcase,
  FaCode,
  FaGlobe,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaMapMarkerAlt,
  FaBirthdayCake,
  FaGenderless,
  FaUserGraduate
} from "react-icons/fa";

const Profile = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const user = session?.user;

  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    full_name: "",
    name: "",
    phone: "",
    program: "",
    student_id: "",
    graduation_year: "",
    bio: "",
    location: "",
    date_of_birth: "",
    gender: "",
    skills: "",
    linkedin: "",
    github: "",
    twitter: "",
    portfolio: "",
    employment_status: "",
    major: ""
  });

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        // Get user metadata from auth
        const userMetadata = user.user_metadata || {};
        
        if (!error && data) {
          setProfile(data);
          setPreview(data.profile_pic || userMetadata.avatar_url || null);
          
          // Populate edit form with existing data - prioritize profile data over metadata
          const fullName = data.full_name || userMetadata.full_name || userMetadata.name || "";
          
          setEditForm({
            full_name: fullName,
            name: fullName,
            phone: data.phone || userMetadata.phone || "",
            program: data.program || userMetadata.program || "",
            student_id: data.student_id || userMetadata.student_id || "",
            graduation_year: data.graduation_year || userMetadata.graduation_year || "",
            bio: data.bio || "",
            location: data.location || "",
            date_of_birth: data.date_of_birth || "",
            gender: data.gender || "",
            skills: data.skills || "",
            linkedin: data.linkedin || "",
            github: data.github || "",
            twitter: data.twitter || "",
            portfolio: data.portfolio || "",
            employment_status: data.employment_status || "",
            major: data.major || userMetadata.program || data.program || ""
          });
        } else {
          // Initialize with user metadata if profile doesn't exist
          const fullName = userMetadata.full_name || userMetadata.name || user.email?.split('@')[0] || "User";
          
          setEditForm({
            full_name: fullName,
            name: fullName,
            phone: userMetadata.phone || "",
            program: userMetadata.program || "",
            student_id: userMetadata.student_id || "",
            graduation_year: userMetadata.graduation_year || "",
            bio: "",
            location: "",
            date_of_birth: "",
            gender: "",
            skills: "",
            linkedin: "",
            github: "",
            twitter: "",
            portfolio: "",
            employment_status: "",
            major: userMetadata.program || ""
          });
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const uploadProfilePic = async (e) => {
    try {
      setUploading(true);
      const file = e.target.files[0];
      if (!file) return;

      if (!file.type.startsWith("image/")) {
        alert("Only image files are allowed");
        setUploading(false);
        return;
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `profile/${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from("profile-pictures")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(filePath);

      const publicURL = data.publicUrl;
      setPreview(publicURL); // show preview instantly

      // Save URL to profiles table
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({ id: user.id, profile_pic: publicURL });

      if (dbError) throw dbError;

      // Update Auth metadata (optional)
      const { error: authError } = await supabase.auth.updateUser({
        data: { avatar_url: publicURL },
      });
      if (authError) throw authError;

      alert("Profile picture updated successfully!");
    } catch (error) {
      console.error("Upload error:", error.message);
      alert("Upload failed: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async () => {
    try {
      setSaving(true);
      
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: editForm.full_name,
          name: editForm.full_name,
          phone: editForm.phone,
          program: editForm.program,
          student_id: editForm.student_id,
          graduation_year: editForm.graduation_year,
        }
      });
      
      if (authError) throw authError;
      
      // Update or insert profile data
      const { error: dbError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          full_name: editForm.full_name,
          name: editForm.full_name,
          phone: editForm.phone,
          program: editForm.program,
          student_id: editForm.student_id,
          graduation_year: editForm.graduation_year,
          bio: editForm.bio,
          location: editForm.location,
          date_of_birth: editForm.date_of_birth,
          gender: editForm.gender,
          skills: editForm.skills,
          linkedin: editForm.linkedin,
          github: editForm.github,
          twitter: editForm.twitter,
          portfolio: editForm.portfolio,
          employment_status: editForm.employment_status,
          major: editForm.major,
          updated_at: new Date().toISOString()
        });
      
      if (dbError) throw dbError;
      
      alert("Profile updated successfully!");
      setIsEditing(false);
      
      // Refresh profile data
      const { data: refreshedProfile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (refreshedProfile) {
        setProfile(refreshedProfile);
      }
      
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save changes: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const calculateProfileCompleteness = () => {
    const fields = [
      editForm.full_name, editForm.phone, editForm.program, 
      editForm.student_id, editForm.graduation_year, editForm.bio,
      editForm.location, editForm.skills
    ];
    const filledFields = fields.filter(field => field && field.trim() !== "");
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const profileCompleteness = calculateProfileCompleteness();

  // Get display name
  const getDisplayName = () => {
    if (editForm.full_name) return editForm.full_name;
    if (profile?.full_name) return profile.full_name;
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.user_metadata?.name) return user.user_metadata.name;
    if (user?.email) return user.email.split('@')[0];
    return "User";
  };

  // Get display program
  const getDisplayProgram = () => {
    if (editForm.program) return editForm.program;
    if (profile?.program) return profile.program;
    if (user?.user_metadata?.program) return user.user_metadata.program;
    return "Student";
  };

  // Get display student ID
  const getDisplayStudentId = () => {
    if (editForm.student_id) return editForm.student_id;
    if (profile?.student_id) return profile.student_id;
    if (user?.user_metadata?.student_id) return user.user_metadata.student_id;
    return "N/A";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-green-950 to-green-800 h-16 md:hidden flex items-center w-full px-4 fixed top-0 z-50 shadow-lg">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate("/home")}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-all duration-300"
          >
            <IoMdArrowBack className="text-2xl" />
          </button>
          <div>
            <p className="text-white font-semibold text-lg">My Profile</p>
            <p className="text-green-200 text-xs">Manage your account</p>
          </div>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex items-center justify-between px-8 py-4 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <img
            src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
            alt="Regent University Logo"
            className="w-10 h-10"
          />
          <div>
            <p className="text-2xl font-bold text-gray-900">
              Regent <span className="text-green-950">Hub</span>
            </p>
            <p className="text-gray-600 text-sm">Profile Management</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <FaEdit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
              >
                <FaTimes className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FaSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          )}
          <button
            onClick={() => navigate("/home")}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2 rounded-xl font-semibold transition-all duration-300 flex items-center space-x-2"
          >
            <IoMdArrowBack className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      <div className="pt-16 md:pt-8 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-green-950 to-green-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture Section */}
            <div className="relative group">
              <div className="relative">
                <img
                  src={preview || "https://upload.wikimedia.org/wikipedia/commons/8/89/Portrait_Placeholder.png"}
                  alt="Profile"
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-green-300 shadow-2xl"
                />
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-300 cursor-pointer">
                  <FaCamera className="text-2xl text-white" />
                </div>
              </div>
              
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={uploadProfilePic}
                className="hidden"
              />
              
              <button
                onClick={() => document.getElementById("fileInput").click()}
                className="absolute -bottom-2 -right-2 bg-white text-green-900 p-2 rounded-full shadow-lg hover:scale-110 transition-all duration-300"
                disabled={uploading}
              >
                <FaEdit className="w-4 h-4" />
              </button>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              {!isEditing ? (
                <>
                  <h1 className="text-2xl md:text-4xl font-bold mb-2">
                    {getDisplayName()}
                  </h1>
                  <p className="text-green-200 text-lg mb-4">{getDisplayProgram()}</p>
                  <p className="text-green-100 text-sm">{user?.email}</p>
                </>
              ) : (
                <>
                  <input
                    type="text"
                    name="full_name"
                    value={editForm.full_name}
                    onChange={handleInputChange}
                    className="text-2xl md:text-4xl font-bold mb-2 bg-white/20 rounded-lg px-3 py-1 text-white placeholder-white/50 w-full max-w-md"
                    placeholder="Full Name"
                  />
                  <input
                    type="text"
                    name="program"
                    value={editForm.program}
                    onChange={handleInputChange}
                    className="text-lg mb-4 bg-white/20 rounded-lg px-3 py-1 text-white placeholder-white/50 w-full max-w-md"
                    placeholder="Program of Study"
                  />
                  <p className="text-green-100 text-sm">{user?.email}</p>
                </>
              )}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-3">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaUniversity className="w-4 h-4" />
                  <span className="text-sm">Regent University</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaIdCard className="w-4 h-4" />
                  <span className="text-sm">{getDisplayStudentId()}</span>
                </div>
              </div>
            </div>

            {/* Upload Button */}
            <button
              onClick={() => document.getElementById("fileInput").click()}
              className="bg-white text-green-900 px-6 py-3 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <div className="w-5 h-5 border-2 border-green-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <FaCamera className="w-5 h-5" />
                  <span>Update Photo</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Edit Buttons */}
        <div className="md:hidden flex justify-between mb-6">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex-1 bg-gradient-to-r from-green-950 to-green-800 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2"
            >
              <FaEdit className="w-5 h-5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex space-x-3 w-full">
              <button
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2"
              >
                <FaTimes className="w-5 h-5" />
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSaveChanges}
                disabled={saving}
                className="flex-1 bg-gradient-to-r from-green-950 to-green-800 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>
                    <FaSave className="w-5 h-5" />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <FaUser className="w-6 h-6 text-green-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                <p className="text-gray-600">Your account details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaUser className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{getDisplayName()}</p>
                  ) : (
                    <input
                      type="text"
                      name="full_name"
                      value={editForm.full_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="Enter your full name"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaEnvelope className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-gray-900 font-semibold">{user?.email || "N/A"}</p>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaIdCard className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Student ID</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{getDisplayStudentId()}</p>
                  ) : (
                    <input
                      type="text"
                      name="student_id"
                      value={editForm.student_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="Enter your student ID"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaPhone className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{editForm.phone || "N/A"}</p>
                  ) : (
                    <input
                      type="tel"
                      name="phone"
                      value={editForm.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="Enter your phone number"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaBirthdayCake className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Date of Birth</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{editForm.date_of_birth || "N/A"}</p>
                  ) : (
                    <input
                      type="date"
                      name="date_of_birth"
                      value={editForm.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaMapMarkerAlt className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Location</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{editForm.location || "N/A"}</p>
                  ) : (
                    <input
                      type="text"
                      name="location"
                      value={editForm.location}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="City, Country"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaGenderless className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Gender</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{editForm.gender || "N/A"}</p>
                  ) : (
                    <select
                      name="gender"
                      value={editForm.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Academic & Professional Information Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FaGraduationCap className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Academic & Professional</h2>
                <p className="text-gray-600">Your educational and career details</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <FaUniversity className="w-5 h-5 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Program</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{getDisplayProgram()}</p>
                  ) : (
                    <input
                      type="text"
                      name="program"
                      value={editForm.program}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="e.g., Computer Science"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <FaUserGraduate className="w-5 h-5 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Major / Specialization</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{editForm.major || "N/A"}</p>
                  ) : (
                    <input
                      type="text"
                      name="major"
                      value={editForm.major}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="e.g., Software Engineering"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <FaCalendarAlt className="w-5 h-5 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Graduation Year</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold">{editForm.graduation_year || "N/A"}</p>
                  ) : (
                    <input
                      type="text"
                      name="graduation_year"
                      value={editForm.graduation_year}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="e.g., 2025"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <FaCode className="w-5 h-5 text-blue-900 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Skills</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold whitespace-pre-wrap">{editForm.skills || "N/A"}</p>
                  ) : (
                    <textarea
                      name="skills"
                      value={editForm.skills}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="List your skills separated by commas (e.g., JavaScript, Python, React, Project Management)"
                    />
                  )}
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <FaUser className="w-5 h-5 text-blue-900 flex-shrink-0 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Bio / About Me</p>
                  {!isEditing ? (
                    <p className="text-gray-900 font-semibold whitespace-pre-wrap">{editForm.bio || "N/A"}</p>
                  ) : (
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-900 focus:border-transparent"
                      placeholder="Tell us about yourself, your interests, and career goals..."
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Completeness Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-100 rounded-3xl border border-green-200">
          <h3 className="font-semibold text-green-900 mb-2 text-lg">Profile Completion</h3>
          <p className="text-sm text-green-800 mb-3">
            Your profile is {profileCompleteness}% complete. Complete your profile to get better internship matches and career opportunities.
          </p>
          <div className="w-full bg-green-200 rounded-full h-3">
            <div 
              className="bg-green-900 h-3 rounded-full transition-all duration-500" 
              style={{ width: `${profileCompleteness}%` }}
            ></div>
          </div>
          <div className="mt-3 text-xs text-green-700">
            {profileCompleteness < 100 && (
              <p>💡 Tip: Add your skills, bio, and social links to reach 100% completion!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;