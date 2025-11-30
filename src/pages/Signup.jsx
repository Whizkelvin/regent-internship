import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { 
  FaUser, 
  FaUserTie, 
  FaShieldAlt, 
  FaGraduationCap, 
  FaPhone, 
  FaEnvelope, 
  FaLock, 
  FaCalendarAlt,
  FaIdCard,
  FaBuilding,
  FaArrowRight,
  FaCheckCircle
} from "react-icons/fa";
import { MdDateRange } from "react-icons/md";

const Signup = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [studentId, setStudentId] = useState("");
  const [program, setProgram] = useState("");
  const [graduationYear, setGraduationYear] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    if (!email.includes("@")) {
      setErrorMsg("Invalid email format");
      setLoading(false);
      return;
    }

    if (role === "student" && !email.includes("@regent.edu.gh")) {
      setErrorMsg("Please use your Regent University email address");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (!role) {
      setErrorMsg("Please select your role");
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            role,
            name,
            student_id: studentId,
            program,
            graduation_year: graduationYear,
            phone,
          },
        },
      });

      if (error) throw error;

      setSuccessMsg("Account created successfully! Please check your email for verification.");
      setEmail("");
      setPassword("");
      setStudentId("");
      setProgram("");
      setGraduationYear("");
      setPhone("");

      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = () => {
    switch (role) {
      case "student":
        return <FaGraduationCap className="w-6 h-6" />;
      case "company":
        return <FaBuilding className="w-6 h-6" />;
      case "admin":
        return <FaShieldAlt className="w-6 h-6" />;
      default:
        return <FaUser className="w-6 h-6" />;
    }
  };

  const getRoleDescription = () => {
    switch (role) {
      case "student":
        return "Join as a student to access internship opportunities and career resources";
      case "company":
        return "Register your company to post internships and connect with talented students";
      case "admin":
        return "Administrator access for managing platform operations";
      default:
        return "Select your role to get started";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-green-950/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-950/5 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-green-950/10 to-red-950/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-6xl">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200 overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Side - Form */}
            <div className="flex-1 p-8 lg:p-12">
              <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center space-x-4 mb-6">
                    <div className="w-16 h-16  rounded-2xl flex items-center justify-center shadow-lg">
                     <img
                  src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                  alt="Regent University Badge"
                  className="w-16 h-16"
                />
                    </div>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
                      <p className="text-gray-600 mt-1">Join Regent Hub Career Platform</p>
                    </div>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-950 to-red-950 rounded-full mx-auto"></div>
                </div>

                <form onSubmit={handleSignup} className="space-y-6">
                  {/* Role Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      I am a:
                      <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300 appearance-none"
                        required
                      >
                        <option value="">Select Your Role</option>
                        <option value="student">Student</option>
                        <option value="company">Company Representative</option>
                        <option value="admin">Administrator</option>
                      </select>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        {getRoleIcon()}
                      </div>
                      <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <MdDateRange className="w-4 h-4 text-gray-400" />
                      </div>
                    </div>
                    {role && (
                      <p className="text-xs text-gray-600 bg-green-50 p-2 rounded-lg border border-green-200">
                        {getRoleDescription()}
                      </p>
                    )}
                  </div>

                  {/* Name Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Full Name
                      <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={`Enter your ${role || 'user'} name`}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaUser className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Email Address
                      <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        placeholder={`Enter your ${role || 'user'} email`}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaEnvelope className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    {role === "student" && (
                      <p className="text-xs text-gray-600">Please use your @regent.edu.gh email address</p>
                    )}
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Password
                      <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        placeholder="Create a secure password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaLock className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">Must be at least 6 characters long</p>
                  </div>

                  {/* ID Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      {role === "student" ? "Student ID" : "ID Number"}
                      <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={`Enter your ${role || 'user'} ID`}
                        value={studentId}
                        onChange={(e) => setStudentId(e.target.value)}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaIdCard className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Program Field (Students only) */}
                  {role === "student" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block">
                        Academic Program
                        <span className="text-red-950 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <select
                          value={program}
                          onChange={(e) => setProgram(e.target.value)}
                          className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300 appearance-none"
                          required
                        >
                          <option value="">Select Your Program</option>
                          <option>Business Administration</option>
                          <option>Computer Science</option>
                          <option>Information Technology</option>
                          <option>Psychology</option>
                          <option>Accounting</option>
                          <option>Economics</option>
                          <option>Marketing</option>
                          <option>Human Resource Management</option>
                          <option>Banking and Finance</option>
                          <option>Theology</option>
                        </select>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaGraduationCap className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Graduation Year (Students only) */}
                  {role === "student" && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700 block">
                        Expected Graduation Year
                        <span className="text-red-950 ml-1">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300"
                          required
                        />
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <FaCalendarAlt className="w-5 h-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Phone Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Phone Number
                      <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Enter your phone number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full p-4 pl-12 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-900 transition-all duration-300"
                        required
                      />
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <FaPhone className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Messages */}
                  {errorMsg && (
                    <div className="p-4 bg-red-50/80 border border-red-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <div className="w-5 h-5 bg-red-900 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                        <span className="text-sm font-medium text-red-900">{errorMsg}</span>
                      </div>
                    </div>
                  )}

                  {successMsg && (
                    <div className="p-4 bg-green-50/80 border border-green-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FaCheckCircle className="text-green-900 flex-shrink-0 w-5 h-5" />
                        <div>
                          <span className="text-sm font-medium text-green-900 block">{successMsg}</span>
                          <span className="text-xs text-green-700 block mt-1">Redirecting to login...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-xl shadow-lg transition-all duration-300 hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed relative overflow-hidden group"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span className="font-medium">Creating Account...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <span className="font-medium">Create Account</span>
                        <FaArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>
                </form>

                {/* Sign In Link */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <p className="text-gray-600 text-sm">
                    Already have an account?{" "}
                    <button
                      onClick={() => navigate("/")}
                      className="text-green-900 hover:text-green-800 font-semibold underline transition-colors duration-300"
                    >
                      Sign In Here
                    </button>
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Branding with Your Images */}
            <div className="flex-1 hidden lg:flex relative overflow-hidden">
              {/* Campus Image Background */}
              <img
                src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440610/Regent-University-College-of-Science-and-Technology-Mallam-Ghana-SchoolFinder-TortoisePathcom_himnme.jpg"
                alt="Regent University Campus"
                className="w-full h-full object-cover"
              />
              
    

              {/* University Badge */}
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <img
                  src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                  alt="Regent University Badge"
                  className="w-16 h-16"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;