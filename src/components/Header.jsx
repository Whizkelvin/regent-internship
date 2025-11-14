import React, { useEffect, useState } from "react";
import { Link, Links, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

import Slider from "react-slick";
import { CiLocationArrow1, CiLocationOn, CiMenuBurger } from "react-icons/ci";
import { FaUserCircle, FaUserEdit } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { IoClose } from "react-icons/io5";
import {
  MdMessage,
  MdOutlineMarkEmailRead,
  MdWorkHistory,
} from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import { RiProfileLine } from "react-icons/ri";




const Header = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

  const [openMenu, setOpenMenu] = useState(false);
  const [openProfile, setOpenProfile] = useState(false);
  const [students, setStudents] = useState([]);

  const navItems = [
    { name: "Home", path: "/home" },
    { name: "Internship Job", path: "/jobs" },
    { name: "Contact", path: "/contact" },
    { name: "About Us", path: "/about-us" },
  ];
  const profileItems = [
    { name: "Profile", path: "/profile", icon: <FaUserEdit /> },
    { name: "Message", path: "/message", icon: <MdMessage /> },
    { name: "My Internship Job", path: "/internship", icon: <MdWorkHistory /> },
  ];

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  console.log(session);
  const handleMenu = () => setOpenMenu(!openMenu);
  const profileMenu = () => setOpenProfile(!openProfile);


const [profilePic, setProfilePic] = useState(null);

useEffect(() => {
  const fetchProfilePic = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("profile_pic")
      .eq("id", session.user.id)
      .single();

    if (!error && data?.profile_pic) {
      setProfilePic(data.profile_pic);
    }
  };

  fetchProfilePic();
}, [session]);



  return(
    <div>
              <div className="md:hidden py-4 flex justify-between px-5 fixed z-30 w-full top-0 shadow-md bg-green-950 text-white">
        <div className="flex items-center">
          <div
            onClick={handleMenu}
            className="tranform ease-in-out duration-300"
          >
            {openMenu ? (
              <IoClose className="text-2xl" />
            ) : (
              <CiMenuBurger className="text-2xl" />
            )}
          </div>

          <div className="ml-5 text-xl">
            <p>
              Welcome Back
              <br />
              <span>{session?.user?.user_metadata?.name || "User"}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center">
          <img
    src={profilePic || "https://via.placeholder.com/40"} 
    alt="Profile"
    className="w-10 h-10 rounded-full object-cover mr-3"
  />
          <IoIosArrowDown onClick={profileMenu} />
        </div>
      </div>

      {/* destop navigation */}
      <div className=" bg-white w-full h-24 hidden md:flex justify-between items-center px-10 fixed z-40 shadow-lg">
           <div className="flex items-center justify-center">
          <img src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png" alt="" width={50}/>
             <p className="text-4xl font-extrabold ml-3 text-red-900">Regent <span className="text-green-950">Hub</span></p>
        </div>
       
        <div className="flex">
          {navItems.map((item, index) => (
            <ul key={index}>
              <li className="ml-5 text-xl hover:text-red-900 hover:underline">
                <Link key={index} to={item.path}>
                  {item.name}
                </Link>
              </li>
            </ul>
          ))}
        </div>

        <div className="flex items-center justify-center">
          <div className="flex text-2xl text-green-950 items-center justify-center mr-10">
            {profileItems.map((item, index) => (
              <Link to={item.path} 
              key={index}
              className="mr-4">
                {item.icon}
              </Link>
            ))}
          </div>
          <button
            onClick={handleSignOut}
            className="bg-green-950 text-white px-4 py-2 rounded-md"
          >
            Sign Out
          </button>
        </div>
      </div>

      {/* mobile nav menu */}

      <div
        className={`w-full h-screen bg-gray-400/60 fixed z-50 transform transition-all duration-300 top-20 left-0 ${
          openMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-white border border-green-950 w-[70%] h-screen p-5">
          <p className="text-3xl font-Roboto text-center">Menu</p>
          <div className="mt-7 text-center">
            {navItems.map((item, index) => (
              <ul key={index}>
                <li className="font-semibold font-Inter border-b border-green-900 py-2 capitalize text-lg">
                  <Link to={item.path}>{item.name}</Link>
                </li>
              </ul>
            ))}
          </div>

          <div className="mt-9">
            <h1 className=" text-xl">CONTACT INFO</h1>
            <div>
              <p className="my-2 flex items-center text gap-3">
                <CiLocationOn className="text-3xl text-green-950" /> Regent
                University College - Menskrom
              </p>

              <p
                className="mb-2 flex items-center text-md gap-3"
                data-aos="fade-up"
                data-aos-duration="2500"
                data-aos-delay="200"
              >
                <FiPhone className="text-xl text-green-950 " />
                +233 50 132 1208 /
                <br /> +233 54 574 7320
              </p>
            </div>
            <div
              data-aos="fade-up"
              className="flex items-center justify-center"
            >
              <button
                onClick={handleSignOut}
                className="bg-green-950 text-white px-10 py-2 mt-10 rounded-md"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* profile menu */}

      <div
        className={`w-full bg-gray-400/0 fixed z-40 transform transition-all duration-300 top-20 left-0 ${
          !openProfile ? "translate-x-full" : "translate-x-0"
        }`}
      >
        <div className="bg-white w-[60%] ml-[40%] p-4  rounded  border border-green-950">
          {
            <div className="">
              {profileItems.map((item, index) => (
                <ul key={index}>
                  <li className="font-semibold font-Inter border-b border-green-900 py-2 capitalize text-lg">
                    <Link to={item.path} className="flex items-center j">
                      <span className="mr-3 text-green-950">{item.icon}</span>{" "}
                      {item.name}
                    </Link>
                  </li>
                </ul>
              ))}
            </div>
          }
        </div>
      </div>
    </div>
  ) 
};

export default Header;
