import React from "react";
import { Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";
import InternshipJobs from "./pages/InternshipJobs";
import Contact from "./pages/Contact";
import About from "./pages/About";
import Profile from "./pages/Profile";
import Message from "./pages/message";
import InternshipJobDescription from "./pages/InternshipJobDescription";

const App = () => {
  return (
    <Routes>
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Signin />} />
      <Route path="/jobs" element={<InternshipJobs />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/about-us" element={<About />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/message" element={<Message />} />

      {/* <Route path="/home" element={  <Home />} /> */}
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      <Route path="/updatepassword" element={<UpdatePassword />} />
       <Route path="/job/:id" element={<InternshipJobDescription />} />
    </Routes>
  );
};

export default App;
