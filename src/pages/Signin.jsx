import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Signin = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSignin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (!data.session) {
        setErrorMsg("Please verify your email before logging in.");
      } else {
        setSuccessMsg("Login successful! Redirecting...");
        setTimeout(() => navigate("/home"), 1500);
      }
    } catch (err) {
      setErrorMsg("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center items-center bg-linear-to-b from-red-50 to-green-100">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-[90%] sm:w-[400px] md:w-[80%] flex justify-center items-center gap-6 md:gap-12 md:flex-row flex-col">
        <div>
          <div className="flex flex-col justify-center items-center mb-6">
            <img
              src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
              alt="Regent Logo"
              className="w-20"
            />
            <h2 className="text-3xl font-semibold text-green-900 mt-4">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-600">
              Regent University Job Placement System
            </p>
          </div>

          <form onSubmit={handleSignin}>
            <label className="font-medium text-gray-800">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="example@regent.edu.gh"
              value={formData.email}
              onChange={handleChange}
              className="border-2 border-gray-400 w-full p-2 rounded-xl my-2 mb-4"
              required
            />

            <label className="font-medium text-gray-800">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
              required
            />

            {errorMsg && (
              <p className="text-red-600 text-sm mt-2">{errorMsg}</p>
            )}
            {successMsg && (
              <p className="text-green-700 text-sm mt-2">{successMsg}</p>
            )}

            <button
              type="submit"
              className="bg-green-900 text-white w-full mt-6 py-2 rounded-md hover:bg-green-800 transition-all"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Login"}
            </button>
          </form>

          <p className="text-center text-sm mt-4">
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              className="text-blue-700 underline"
            >
              Register
            </button>
          </p>
        </div>

        <div className="hidden md:block">
          <img
            src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440610/Regent-University-College-of-Science-and-Technology-Mallam-Ghana-SchoolFinder-TortoisePathcom_himnme.jpg "
            alt=""
            className="rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default Signin;
