import React from "react";
import { Routes, Route } from "react-router-dom";
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
import Message from "./pages/Message";
import InternshipJobDescription from "./pages/InternshipJobDescription";
import AdminJobs from "./pages/AdminJobs";
import MyApplications from "./pages/MyApplication";

const App = () => {
  return (
    <Routes>
      {/* Unprotected routes */}
      <Route path="/" element={<Signin />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgotpassword" element={<ForgotPassword />} />
      
      {/* Protected routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <InternshipJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contact"
        element={
          <ProtectedRoute>
            <Contact />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about-us"
        element={
          <ProtectedRoute>
            <About />
          </ProtectedRoute>
        }
      />
      <Route
        path="/adminpage"
        element={
          <ProtectedRoute>
            <AdminJobs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/message"
        element={
          <ProtectedRoute>
            <Message />
          </ProtectedRoute>
        }
      />
      <Route
        path="/updatepassword"
        element={
          <ProtectedRoute>
            <UpdatePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/job/:id"
        element={
          <ProtectedRoute>
            <InternshipJobDescription />
          </ProtectedRoute>
        }
      />
      <Route
        path="/whistlist"
        element={
          <ProtectedRoute>
            <MyApplications />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default App;