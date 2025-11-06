import React from 'react'
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";


const Home = () => {
const navigate = useNavigate();
  const { session } = useAuth();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  console.log(session);

  return (
    <div className="min-h-screen bg-green-50 flex flex-col justify-center items-center">
     
     
     

      {session && (
        <div>
          <h3>Welcome Back</h3>
          <p>Role: {session.user.user_metadata.role}</p>
          <p> Name: {session.user.user_metadata.name}</p>
          <p>Email: {session.user.email}</p>
          <p>Programme: {session.user.user_metadata.program}</p>
          <p>Id: {session.user.user_metadata.student_id}</p>
        </div>
      
       
      )}

      <button
        onClick={handleSignOut}
        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
      >
        Sign Out
      </button>
    </div>
  );
};
export default Home