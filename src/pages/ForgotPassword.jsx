import { IoMdArrowBack } from "react-icons/io";
import { useNavigate } from "react-router-dom";
import React, { useState } from "react";
import { supabase } from "../supabaseClient";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrorMsg("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://regent-internship.vercel.app/updatepassword",
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("A password reset link has been sent to your email.");
    }
  };
  return (
    <div className="flex flex-col h-screen  bg-linear-to-b from-red-50 to-green-100 justify-center items-center">
      <div>
        <div className="bg-green-950 h-16 md:hidden flex items-center w-full px-4 fixed top-0">
          <p className="text-white flex items-center gap-4">
            <IoMdArrowBack
              className="text-3xl cursor-pointer"
              onClick={() => navigate("/")}
            />
            Reset Password
          </p>
        </div>

        <div className="flex flex-col items-center justify-center">
          <div className="bg-white p-8 rounded-2xl shadow-md w-[90%] sm:w-[400px] ">
            <h2 className="text-2xl font-semibold text-center text-green-900 mb-4 ">
              Reset Your Password
            </h2>
            <p className="text-sm text-center text-gray-500 mb-9">You will received a reset link in your email used in registration from <span className="text-green-500">Regent Hub</span></p>
          
            <form onSubmit={handleReset}>
              <label className="block mb-2 font-medium">Email Address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
              />
              {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
              {message && <p className="text-green-700 text-sm">{message}</p>}

              <button
                type="submit"
                className="bg-green-900 text-white w-full mt-4 py-2 rounded-md hover:bg-green-800"
              >
                Send Reset Link
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
