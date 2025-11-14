import React, { useState, useEffect } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";
import { useNavigate } from "react-router-dom";

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
    <div>
      {/* MOBILE HEADER */}
      <div className="bg-green-950 h-16 md:hidden flex items-center w-full px-4 fixed top-0">
        <p className="text-white flex items-center gap-4">
          <IoMdArrowBack
            className="text-3xl cursor-pointer"
            onClick={() => navigate("/home")}
          />
          My Profile
        </p>
      </div>

      <div className="px-4">
        {/* USER INFO */}
        <div className="border-2 w-full px-4 mt-20 rounded-2xl py-4">
          <p className="text-2xl mb-2 font-semibold">User Information</p>
          <p>Full Name: <span>{user?.user_metadata?.name || "N/A"}</span></p>
          <p>Email: <span>{user?.email || "N/A"}</span></p>
          <p>ID Number: <span>{user?.user_metadata?.student_id || "N/A"}</span></p>
          <p>ID Number: <span>{user?.user_metadata?.program|| "N/A"}</span></p>
          <p>ID Number: <span>{user?.user_metadata?.graduation_year || "N/A"}</span></p>
          <p>Phone Number: <span>{user?.user_metadata?.phone || "N/A"}</span></p>
        </div>

        {/* PROFILE PIC UPLOAD */}
        <div className="border-2 w-full px-4 mt-4 rounded-2xl py-4">
          <p className="text-2xl mb-4 font-semibold">Profile Picture</p>
          <div className="flex flex-col items-center gap-4">
            <div className="relative group">
              <img
                src={preview || "https://via.placeholder.com/150?text=No+Image"}
                alt="Profile"
                className="w-32 h-32 rounded-full object-cover border-4 border-gray-300 shadow-md"
              />
              <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 
                              flex items-center justify-center text-white text-sm font-medium transition">
                Change Photo
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
              className="px-6 py-2 bg-green-700 text-white text-sm rounded-full shadow-md 
                         hover:bg-green-800 transition active:scale-95"
              disabled={uploading}
            >
              {uploading ? "Uploading..." : "Upload New Photo"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
