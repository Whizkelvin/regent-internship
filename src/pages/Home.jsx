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
import { BiSearch } from "react-icons/bi";

const Home = () => {
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

  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error fetching students:", error);
      } else {
        setStudents(data);
      }
      setLoading(false);
    };

    fetchStudents();
  }, []);

  const handleMenu = () => setOpenMenu(!openMenu);
  const profileMenu = () => setOpenProfile(!openProfile);

  var settings = {
    dots: true,
    infinite: true,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "linear",
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          infinite: true,
          dots: true,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          initialSlide: 1,
        },
      },
      {
        breakpoint: 480,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };
  console.log(session);

  return (
    <div className=" relative bg-linear-to-b from-red-100 to-green-100">
      {/* mobile Nav */}
      <div className="md:hidden py-4 flex justify-between px-5 fixed z-30 w-full shadow-md bg-white">
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
          <FaUserCircle className="text-2xl mr-2" />
          <IoIosArrowDown onClick={profileMenu} />
        </div>
      </div>

      {/* mobile nav menu */}

      <div
        className={`w-full h-screen bg-gray-400/60 fixed z-50 transform transition-all duration-300 top-20 left-0 ${
          openMenu ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="bg-white border border-green-950 w-[70%] h-screen p-5 text-center">
          <p className="text-3xl font-Roboto">Menu</p>
          <div className="mt-7">
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
              <p className="my-2 flex items-center text-md gap-3">
                <CiLocationOn className="text-2xl text-green-950" /> Regent
                University - Menskro
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

      {/* main page */}
      <div>
        <div className="slider-container pt-[23%]">
          <Slider {...settings}>
            <div className="w-full h-[220px] bg-amber-700">
              <img src="https://thumbs.dreamstime.com/z/businessman-pressing-button-virtual-screens-business-technology-internet-concept-recruitment-53297634.jpg?ct=jpeg" alt="" />
            </div>
            <div className="w-full h-[220px] bg-amber-700">
              <img src="https://thumbs.dreamstime.com/z/mentoring-virtual-screen-education-concept-e-learning-success-mentoring-virtual-screen-education-concept-e-learning-113918455.jpg?ct=jpeg" alt="" />
            </div>
            <div className="w-full h-[220px] bg-amber-700">
             <img src="https://thumbs.dreamstime.com/z/internship-button-keyboard-blue-business-concept-49130674.jpg?ct=jpeg" alt="" />
            </div>
          </Slider>
        </div>
      </div>

      <div className="my-9">
        <h3 className="text-3xl border-b w-1/2 pb-3 uppercase">
          Regent <span>Hub</span>
        </h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit eaque
          consequuntur ipsa commodi quam recusandae rem quaerat sunt, nostrum
          minima qui porro expedita laudantium at ipsum temporibus eveniet
          laboriosam quos! Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, deserunt officiis impedit assumenda adipisci distinctio facilis porro placeat dicta, voluptates qui? Velit, aliquam provident officia rem dolor quam pariatur laudantium?
        </p>
      </div>
      <div className="bg-green-900 text-white  p-3">
        <h3 className="text-3xl">Choose what is Right for you</h3>
        <div className="relative mt-3">
          <BiSearch className="absolute top-2.5 left-1 text-2xl" />
          <input
            type="text"
            placeholder="Browse our internship jobs "
            className="border rounded pl-7 w-full py-2 text-white border-white"
          />
        </div>
      </div>

      <div>
        <img src="https://thumbs.dreamstime.com/z/internship-word-cloud-concept-grey-background-90730727.jpg?ct=jpeg" alt="" />
      </div>

       <div className="my-9">
        <h3 className="text-3xl border-b w-1/2 pb-3 uppercase">
          Testimonies
        </h3>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit eaque
          consequuntur ipsa commodi quam recusandae rem quaerat sunt, nostrum
          minima qui porro expedita laudantium at ipsum temporibus eveniet
          laboriosam quos! Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores, deserunt officiis impedit assumenda adipisci distinctio facilis porro placeat dicta, voluptates qui? Velit, aliquam provident officia rem dolor quam pariatur laudantium?
        </p>
      </div>
    </div>
  );
};
export default Home;
