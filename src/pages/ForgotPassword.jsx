import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { FaEnvelope, FaShieldAlt, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://regent-internship.vercel.app/updatepassword",
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("A password reset link has been sent to your email.");
    }
    setLoading(false);
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
              {/* Mobile Back Button */}
              <div className="lg:hidden mb-6">
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center space-x-3 text-green-900 hover:text-green-800 transition-colors duration-300"
                >
                  <IoMdArrowBack className="text-xl" />
                  <span className="font-semibold">Back to Login</span>
                </button>
              </div>

              <div className="max-w-md mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                  <div className="flex flex-col items-center mb-6">
                    <img
                      src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                      alt="Regent University Logo"
                      className="w-20 h-20 mb-4"
                    />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Password</h1>
                    <p className="text-gray-600">Regent Hub Job Placement System</p>
                  </div>
                  <div className="w-24 h-1 bg-gradient-to-r from-green-950 to-red-950 rounded-full mx-auto"></div>
                </div>

                {/* Instructions */}
                <div className="mb-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <p className="text-sm text-blue-900 text-center">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 block">
                      Email Address
                      <span className="text-red-950 ml-1">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className={`h-5 w-5 ${
                          errorMsg ? 'text-red-900' : 'text-gray-400'
                        }`} />
                      </div>
                      <input
                        type="email"
                        placeholder="example@regent.edu.gh"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 bg-white border-2 rounded-xl focus:outline-none transition-all duration-300 ${
                          errorMsg 
                            ? 'border-red-900 focus:ring-2 focus:ring-red-100 focus:border-red-900' 
                            : 'border-gray-200 focus:ring-2 focus:ring-green-100 focus:border-green-900'
                        }`}
                        required
                      />
                    </div>
                  </div>

                  {/* Messages */}
                  {errorMsg && (
                    <div className="p-4 bg-red-50/80 border border-red-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FaExclamationTriangle className="text-red-900 flex-shrink-0 w-5 h-5" />
                        <span className="text-sm font-medium text-red-900">{errorMsg}</span>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className="p-4 bg-green-50/80 border border-green-900/20 rounded-xl">
                      <div className="flex items-center space-x-3">
                        <FaCheckCircle className="text-green-900 flex-shrink-0 w-5 h-5" />
                        <div>
                          <span className="text-sm font-medium text-green-900 block">{message}</span>
                          <span className="text-xs text-green-700 block mt-1">
                            Check your inbox and follow the instructions.
                          </span>
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
                        <span className="font-medium">Sending Reset Link...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-3">
                        <FaShieldAlt className="w-5 h-5" />
                        <span className="font-medium">Send Reset Link</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                  </button>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={() => navigate("/")}
                    className="text-green-900 hover:text-green-800 font-semibold transition-colors duration-300 flex items-center justify-center space-x-2 mx-auto"
                  >
                    <IoMdArrowBack className="w-4 h-4" />
                    <span>Back to Sign In</span>
                  </button>
                </div>

                {/* Security Notice */}
                <div className="mt-6 text-center">
                  <p className="text-xs text-gray-500">
                    🔒 Secure password reset powered by Regent University
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side - Campus Image */}
            <div className="flex-1 hidden lg:block relative overflow-hidden">
              <img
                src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440610/Regent-University-College-of-Science-and-Technology-Mallam-Ghana-SchoolFinder-TortoisePathcom_himnme.jpg"
                alt="Regent University Campus"
                className="w-full h-full object-cover"
              />
              {/* Overlay with branding */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent flex items-end">
                <div className="p-8 text-white">
                  <h2 className="text-2xl font-bold mb-2">Account Security</h2>
                  <p className="text-white/90 text-lg">Regent University</p>
                  <p className="text-white/80">Protecting Your Career Journey</p>
                </div>
              </div>
              
              {/* University Badge */}
              <div className="absolute top-6 right-6 bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/30">
                <img
                  src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                  alt="Regent University Badge"
                  className="w-16 h-16"
                />
              </div>

              {/* Security Features */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center text-white">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <FaShieldAlt className="w-12 h-12 mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Secure Password Reset</h3>
                  <p className="text-white/90">Encrypted & Protected</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;