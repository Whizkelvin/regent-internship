import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../supabaseClient"; 


// ✅ Initialize Supabase


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

    if(role === "student"){
      !email.includes("@regent.edu.gh")
      setErrorMsg("Enter only your school email");
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

      // ✅ Success message
      setSuccessMsg("Account created! Check your email for verification.");
      setEmail("");
      setPassword("");
      setStudentId("");
      setProgram("");
      setGraduationYear("");
      setPhone("");

      // ✅ Redirect to login after short delay
      setTimeout(() => navigate("/"), 3000);
    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  const  getInfo = ()=>{
    switch(role){
      case 'student':
        return 'student'
      case 'company':
        return 'company'
      case 'admin':
        return 'admin'
    }
  }

  return (
    <div className="bg-linear-to-b from-red-50 to-green-100 min-h-screen flex flex-col p-8 justify-center items-center">
    <div  className="md:bg-white md:p-8 rounded-2xl md:shadow-lg  md:w-[80%] flex justify-center items-center gap-6 md:gap-16 md:flex-row flex-col">
    <div className="w-full">
      <div className="py-4">
        <h3 className="text-3xl font-semibold">Create Account</h3>
        <p className="text-sm text-red-900">Join Regent University Job Placement System</p>
      </div>

      <form onSubmit={handleSignup} className="flex flex-col">
        <label>I am a:</label>
        <select
          className="border-2 border-gray-400 p-2 rounded-xl my-2 mb-3"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          required
        >
          <option value="">-- Select User --</option>
          <option value="student">Student</option>
          <option value="company">Company</option>
          <option value="admin">Admin</option>
        </select>

        <label>Full Name</label>
        <input
          type="text"
          placeholder={`Enter your ${getInfo()} name`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="border-2 border-gray-400 w-full p-2 rounded-xl my-2 mb-3"
        />

        <label>Email Address</label>
        <input
          type="email"
           placeholder={`Enter your ${getInfo()} email`}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="border-2 border-gray-400 w-full p-2 rounded-xl my-2 mb-3"
        />

        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
        />

        <label>{role === "student" ? "Student ID" : "ID Number"}</label>
        <input
          type="text"
           placeholder={`Enter your ${getInfo()} ID number`}
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          required
          className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
        />

        {/* Show program and graduation year only for students */}
        {role === "student" && (
          <>
            <label>Program</label>
            <select
              value={program}
              onChange={(e) => setProgram(e.target.value)}
              className="border-2 border-gray-400 w-full p-2 rounded-xl my-2 mb-3"
              required
            >
              <option value="">-- Select a Program --</option>
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

            <label>Graduation Year</label>
            <input
              type="date"
              value={graduationYear}
              onChange={(e) => setGraduationYear(e.target.value)}
              required
              className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
            />
          </>
        )}

        <label>Phone Number</label>
        <input
          type="text"
          placeholder="Enter your phone number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          className="border-2 border-gray-400 w-full p-2 rounded-xl my-2"
        />

        {/* ✅ Error and Success Messages */}
        {errorMsg && <p className="text-red-600 text-sm mt-2">{errorMsg}</p>}
        {successMsg && <p className="text-green-700 text-sm mt-2">{successMsg}</p>}

        <button
          type="submit"
          disabled={loading}
          className="bg-green-900 text-white w-full mt-4 py-2 rounded-md hover:bg-green-800 transition-all"
        >
          {loading ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <p className="my-4">
        Already have an account?{" "}
        <button
          className="text-blue-700 underline"
          onClick={() => navigate("/")}
        >
          Sign In
        </button>
      </p>
    </div>

    <div className="hidden md:flex flex-col text-center capitalize items-center justify-center ">
       <img
              src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
              alt="Regent Logo"
              className="w-20"
            />
      <h1 className="text-5xl font-medium mb-10">regent <span className="text-red-900">hub</span></h1>
          <img
            src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440610/Regent-University-College-of-Science-and-Technology-Mallam-Ghana-SchoolFinder-TortoisePathcom_himnme.jpg "
            alt=""
            className="rounded-lg w-full"
          />
        </div>
    </div>

       
    </div>
  );
};

export default Signup;
