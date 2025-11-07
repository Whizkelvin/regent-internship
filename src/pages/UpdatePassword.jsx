import React, { useState } from "react";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";


const UpdatePassword = () => {

 
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleUpdate = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setMessage("");

    const { data, error } = await supabase.auth.updateUser({
      password,
    });

  if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match");
      return;
    }

    if (error) {
      setErrorMsg(error.message);
    } else {
      setMessage("Password updated successfully! You can now sign in.");
      setTimeout(() => navigate("/"), 2000);
    }
  };

  


  return (
    
    <div className="flex flex-col justify-center items-center h-screen bg-linear-to-b from-red-50 to-green-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-[90%] sm:w-[400px]">
        <h2 className="text-2xl font-semibold text-center text-green-900 mb-4">
          Set a New Password
        </h2>
        <form onSubmit={handleUpdate}>
          <label className="block mb-2 font-medium">New Password</label>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
         
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
          />
          <label className="block mb-2 font-medium">Confirm New Password</label>
          <input
            type="password"
            placeholder="Enter confirm new password"
            value={confirmPassword }
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
          />
          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}
          {message && <p className="text-green-700 text-sm">{message}</p>}

          <button
            type="submit"
            className="bg-green-900 text-white w-full mt-4 py-2 rounded-md hover:bg-green-800"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
  
}

export default UpdatePassword