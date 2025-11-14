import React, { useEffect, useState } from "react";
import { Link, Links, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";

import Slider from "react-slick";
import Header from './../components/Header';

import { BiSearch } from "react-icons/bi";

const Home = () => {
  const navigate = useNavigate();
  const { session } = useAuth();

 

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
  

  return (
    <div className=" relative bg-linear-to-b from-red-100 to-green-100 w-full overflow-auto">
     <div>
      <Header />
     </div>

      {/* main page */}
      <div>
        <div className="slider-container pt-[23%] md:pt-[9%] md:px-[4%] w-full overflow-hidden">
          <Slider {...settings}>
            <div className="w-full h-[220px] bg-gray-500 md:h-[500px]">
              <img
                src="https://thumbs.dreamstime.com/z/businessman-pressing-button-virtual-screens-business-technology-internet-concept-recruitment-53297634.jpg?ct=jpeg"
                alt=""
              />
            </div>
            <div className="w-full h-[220px] bg-gray-500 md:h-[500px]">
              <img
                src="https://thumbs.dreamstime.com/z/mentoring-virtual-screen-education-concept-e-learning-success-mentoring-virtual-screen-education-concept-e-learning-113918455.jpg?ct=jpeg"
                alt=""
              />
            </div>
            <div className="w-full h-[220px] bg-gray-500 md:h-[500px]">
              <img
                src="https://thumbs.dreamstime.com/z/internship-button-keyboard-blue-business-concept-49130674.jpg?ct=jpeg"
                alt=""
              />
            </div>
          </Slider>
        </div>
      </div>

      <div className="my-9 px-3 md:px-[4%] w-full" >
        <h3 className="text-3xl border-b w-[70%] pb-3 my-2 uppercase">
         <p className="text-3xl font-extrabold ml-3 text-red-900 md:text-6xl">Regent <span className="text-green-950">Hub</span></p>
        </h3>
        <p className="md:text-3xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit eaque
          consequuntur ipsa commodi quam recusandae rem quaerat sunt, nostrum
          minima qui porro expedita laudantium at ipsum temporibus eveniet
          laboriosam quos! Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Maiores, deserunt officiis impedit assumenda adipisci distinctio
          facilis porro placeat dicta, voluptates qui? Velit, aliquam provident
          officia rem dolor quam pariatur laudantium?
        </p>
      </div>
      <div className="bg-green-900 text-white  p-3 md:mx-[4%]  md:my-10">
        <h3 className="text-3xl md:text-6xl">Choose what is Right for you</h3>
        <div className="relative mt-3">
          <BiSearch className="absolute top-2.5 left-1 text-2xl" />
          <input
            type="text"
            placeholder="Browse our internship jobs "
            className="border rounded pl-7 w-full py-2 text-white border-white md:w-1/2"
          />
        </div>
      </div>

      <div className="md:px-[4%] md:h-[500px]">
        <img
          src="https://thumbs.dreamstime.com/z/internship-word-cloud-concept-grey-background-90730727.jpg?ct=jpeg"
          alt=""
          className="md:h-[500px] w-full"
        />
      </div>

      <div className="my-9 p-3 md:px-[4%]">
        <h3 className="text-3xl border-b w-1/2 pb-3 uppercase text-red-900 font-extrabold">Testimonies</h3>
        <p className="md:text-3xl">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Fugit eaque
          consequuntur ipsa commodi quam recusandae rem quaerat sunt, nostrum
          minima qui porro expedita laudantium at ipsum temporibus eveniet
          laboriosam quos! Lorem ipsum dolor sit amet consectetur adipisicing
          elit. Maiores, deserunt officiis impedit assumenda adipisci distinctio
          facilis porro placeat dicta, voluptates qui? Velit, aliquam provident
          officia rem dolor quam pariatur laudantium?
        </p>
      </div>
    </div>
  );
};
export default Home;
