import React, { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";
import { FaUser, FaEnvelope, FaIdCard, FaGraduationCap, FaPhone, FaCamera, FaEdit, FaUniversity, FaCalendarAlt } from "react-icons/fa";

const Profile = () => {
  const { session } = useAuth();
  const navigate = useNavigate();
  const user = session?.user;

  const [uploading, setUploading] = useState(false);
  const [profile, setProfile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Fetch profile on mount
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setProfile(data);
        setPreview(data.profile_pic || null);
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
        data: { profile_pic: publicURL },
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
        <button
          onClick={() => navigate("/home")}
          className="bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-6 py-2 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2"
        >
          <IoMdArrowBack className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      <div className="pt-16 md:pt-8 px-4 md:px-8 max-w-6xl mx-auto">
        {/* Profile Header Card */}
        <div className="bg-gradient-to-r from-green-950 to-green-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl mb-8">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-6 md:space-y-0 md:space-x-8">
            {/* Profile Picture Section */}
            <div className="relative group">
              <div className="relative">
                <img
                  src={preview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&h=150&q=80"}
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
              <h1 className="text-2xl md:text-4xl font-bold mb-2">
                {user?.user_metadata?.name || "User"}
              </h1>
              <p className="text-green-200 text-lg mb-4">{user?.user_metadata?.program || "Student"}</p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaUniversity className="w-4 h-4" />
                  <span className="text-sm">Regent University</span>
                </div>
                <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-3 py-1 rounded-full">
                  <FaIdCard className="w-4 h-4" />
                  <span className="text-sm">{user?.user_metadata?.student_id || "N/A"}</span>
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Information Card */}
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

            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaUser className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Full Name</p>
                  <p className="text-gray-900 font-semibold">{user?.user_metadata?.name || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaEnvelope className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Email Address</p>
                  <p className="text-gray-900 font-semibold">{user?.email || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaIdCard className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Student ID</p>
                  <p className="text-gray-900 font-semibold">{user?.user_metadata?.student_id || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl border border-gray-200">
                <FaPhone className="w-5 h-5 text-green-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Phone Number</p>
                  <p className="text-gray-900 font-semibold">{user?.user_metadata?.phone || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information Card */}
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                <FaGraduationCap className="w-6 h-6 text-blue-900" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Academic Information</h2>
                <p className="text-gray-600">Your educational details</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <FaUniversity className="w-5 h-5 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Program</p>
                  <p className="text-gray-900 font-semibold">{user?.user_metadata?.program || "N/A"}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
                <FaCalendarAlt className="w-5 h-5 text-blue-900 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-500 font-medium">Graduation Year</p>
                  <p className="text-gray-900 font-semibold">{user?.user_metadata?.graduation_year || "N/A"}</p>
                </div>
              </div>

              {/* Additional Info Section */}
              <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-100 rounded-2xl border border-green-200">
                <h3 className="font-semibold text-green-900 mb-2">Career Readiness</h3>
                <p className="text-sm text-green-800">
                  Your profile is 85% complete. Update your skills and preferences to get better internship matches.
                </p>
                <div className="w-full bg-green-200 rounded-full h-2 mt-3">
                  <div className="bg-green-900 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      
      </div>
    </div>
  );
};

export default Profile;