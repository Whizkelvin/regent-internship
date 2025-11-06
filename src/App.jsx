import React from "react";
import { Router, Routes, Route, Link, useNavigate } from "react-router-dom";
import Signup from "./pages/Signup";
import Signin from "./pages/Signin";
import Home from "./pages/Home";
import ProtectedRoute from "./ProtectedRoute";

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
        <Route path="/signup" element={<Signup />} />
       
      </Routes>
  );
};

export default App;
