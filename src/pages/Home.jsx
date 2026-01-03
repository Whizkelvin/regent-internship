import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import { useAuth } from "../AuthContext";
import Slider from "react-slick";
import Header from './../components/Header';
import { BiSearch, BiBriefcase, BiUser, BiStats, BiCheckShield } from "react-icons/bi";
import { FaGraduationCap, FaUserTie, FaBuilding, FaQuoteLeft, FaArrowRight, FaStar, FaAward, FaHandshake, FaRocket, FaChartLine, FaShieldAlt, FaUniversity, FaMicroscope, FaLaptopCode, FaDatabase } from "react-icons/fa";

const Home = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({
    companies: 250,
    internships: 1200,
    successRate: 98,
    studentsPlaced: 3500
  });

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

  const settings = {
    dots: true,
    infinite: true,
    speed: 2000,
    slidesToShow: 1,
    slidesToScroll: 1,
    initialSlide: 0,
    autoplay: true,
    autoplaySpeed: 4000,
    cssEase: "linear",
    pauseOnHover: true,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 1, slidesToScroll: 1, infinite: true, dots: true }
      },
      {
        breakpoint: 600,
        settings: { slidesToShow: 1, slidesToScroll: 1, initialSlide: 1 }
      },
      {
        breakpoint: 480,
        settings: { slidesToShow: 1, slidesToScroll: 1 }
      },
    ],
  };

  const testimonials = [
    {
      id: 1,
      name: "Dr. Sarah Mensah",
      role: "Senior Software Engineer",
      company: "Google Ghana",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRFvZq-POfcSGkeS7BE4SOG7YVQJl9X7BAp_w&s",
      text: "Regent Hub provided the strategic career foundation that accelerated my journey into tech leadership at Google.",
      rating: 5
    },
    {
      id: 2,
      name: "Kwame Asante, MBA",
      role: "Business Strategy Lead",
      company: "MTN Ghana",
      image: "https://thewhistler.ng/wp-content/uploads/2021/10/MTN-CEO-Triola-e1643720194312.jpg",
      text: "The professional network and industry exposure gained through Regent Hub were instrumental in my career progression.",
      rating: 5
    },
    {
      id: 3,
      name: "Derrick  Ofori, MSc.",
      role: "Marketing Director",
      company: "Unilever Ghana",
      image: "https://i0.wp.com/thebftonline.com/wp-content/uploads/2024/03/regent-e1709804034109.jpg?fit=600%2C525&ssl=1",
      text: "A premier platform that bridges academic excellence with corporate leadership development.",
      rating: 5
    }
  ];

  const partnerCompanies = [
    { name: "Google", logo: "🏢", sector: "Technology" },
    { name: "MTN", logo: "📱", sector: "Telecommunications" },
    { name: "Unilever", logo: "🏭", sector: "Manufacturing" },
    { name: "Goldman Sachs", logo: "💼", sector: "Finance" },
    { name: "Microsoft", logo: "💻", sector: "Technology" },
    { name: "Ecobank", logo: "🏦", sector: "Banking" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 w-full overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50">
        <Header />
      </div>

      {/* Premium Hero Slider */}
      <div className="slider-container py-2 md:pt- relative">
        <Slider {...settings}>
          <div className="relative w-full h-[450px] md:h-[700px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Corporate Leadership"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 to-gray-900/50 flex items-center justify-start ">
              <div className="text-white px-8 md:px-20 max-w-3xl">
                <div className="flex items-center space-x-4 mb-4 ">
                  <div className="w-2 h-12 bg-gradient-to-b from-red-900 to-green-900 rounded-full"></div>
                  <span className="text-green-300 font-semibold tracking-wider">PREMIUM CAREER PLATFORM</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                  Elevate Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-900 to-green-900">Professional</span> Journey
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
                  Strategic career development platform for tomorrow's industry leaders and innovators.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                  <button className="bg-gradient-to-r from-green-950 to-green-800 hover:from-green-800 hover:to-green-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl flex items-center space-x-3">
                    <BiBriefcase className="w-6 h-6" />
                    <span>Explore Executive Opportunities</span>
                  </button>
                 
                </div>
              </div>
            </div>
          </div>
          
          <div className="relative w-full h-[450px] md:h-[700px] overflow-hidden">
            <img
              src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Technology Innovation"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/50 flex items-center justify-start">
              <div className="text-white px-8 md:px-20 max-w-3xl">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-2 h-12 bg-gradient-to-b from-blue-500 to-purple-600 rounded-full"></div>
                  <span className="text-blue-300 font-semibold tracking-wider">INNOVATION & TECHNOLOGY</span>
                </div>
                <h1 className="text-4xl md:text-7xl font-bold mb-6 leading-tight">
                  Pioneer <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Digital</span> Transformation
                </h1>
                <p className="text-xl md:text-2xl mb-8 text-gray-200 leading-relaxed">
                  Connect with cutting-edge technology firms and drive innovation in the digital economy.
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
                  <button className="bg-gradient-to-r from-blue-900 to-purple-900 hover:from-blue-800 hover:to-purple-800 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl flex items-center space-x-3">
                    <FaLaptopCode className="w-6 h-6" />
                    <span>Tech Opportunities</span>
                  </button>
                 
                </div>
              </div>
            </div>
          </div>
        </Slider>
      </div>

      {/* Corporate Statistics */}
      <div className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-bold mb-2 text-green-400">{stats.companies}+</div>
              <div className="text-gray-300 font-semibold">Corporate Partners</div>
              <div className="text-sm text-gray-400 mt-1">Fortune 500 & Industry Leaders</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-bold mb-2 text-blue-400">{stats.internships}+</div>
              <div className="text-gray-300 font-semibold">Premium Placements</div>
              <div className="text-sm text-gray-400 mt-1">Executive & Specialist Roles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-bold mb-2 text-red-400">{stats.successRate}%</div>
              <div className="text-gray-300 font-semibold">Career Success Rate</div>
              <div className="text-sm text-gray-400 mt-1">Industry Placement Success</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-6xl font-bold mb-2 text-purple-400">{stats.studentsPlaced}+</div>
              <div className="text-gray-300 font-semibold">Alumni Network</div>
              <div className="text-sm text-gray-400 mt-1">Global Professional Community</div>
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Value Proposition */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-4 mb-6">
              <img
                src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                alt="Regent University Logo"
                className="w-20 h-20"
              />
              <div>
                <h2 className="text-5xl md:text-7xl font-bold text-gray-900">
                  Regent <span className="text-green-950">Hub</span>
                </h2>
                <div className="w-32 h-1 bg-gradient-to-r from-red-900 to-green-900 rounded-full mx-auto mt-4"></div>
              </div>
            </div>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              The definitive career acceleration platform for exceptional talent. We cultivate strategic partnerships 
              between premier academic institutions and industry leaders to drive professional excellence and innovation.
            </p>
          </div>

          {/* Value Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-3xl p-8 border border-green-200 shadow-lg">
              <div className="w-16 h-16 bg-green-900 rounded-2xl flex items-center justify-center mb-6">
                <FaHandshake className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Strategic Industry Alliances</h3>
              <p className="text-gray-700 leading-relaxed">
                Exclusive partnerships with market leaders across technology, finance, healthcare, 
                and engineering sectors for premium placement opportunities.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-cyan-100 rounded-3xl p-8 border border-blue-200 shadow-lg">
              <div className="w-16 h-16 bg-blue-900 rounded-2xl flex items-center justify-center mb-6">
                <FaChartLine className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Career Trajectory Optimization</h3>
              <p className="text-gray-700 leading-relaxed">
                Data-driven career path analysis and personalized development strategies 
                to maximize professional growth and leadership potential.
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-100 rounded-3xl p-8 border border-purple-200 shadow-lg">
              <div className="w-16 h-16 bg-purple-900 rounded-2xl flex items-center justify-center mb-6">
                <FaShieldAlt className="text-2xl text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Executive Mentorship Network</h3>
              <p className="text-gray-700 leading-relaxed">
                Access to C-suite executives and industry veterans providing strategic 
                guidance and networking opportunities for career advancement.
              </p>
            </div>
          </div>

          {/* Industry Sectors */}
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-200">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-8">Strategic Industry Focus</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: FaLaptopCode, name: "Technology", count: "320+ Roles" },
                { icon: FaUniversity, name: "Finance", count: "180+ Roles" },
                { icon: FaMicroscope, name: "Research", count: "95+ Roles" },
                { icon: FaDatabase, name: "Data Science", count: "150+ Roles" },
              ].map((sector, index) => (
                <div key={index} className="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                  <sector.icon className="w-12 h-12 text-green-900 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">{sector.name}</h4>
                  <p className="text-sm text-gray-600">{sector.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Premium Search Section */}
      <div className="bg-gradient-to-r from-green-950 to-green-800 text-white py-20">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-6xl font-bold mb-6">Strategic Career Intelligence</h3>
            <p className="text-xl text-green-200 max-w-3xl mx-auto">
              Access curated opportunities aligned with your career objectives and professional aspirations
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-green-300/20">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-1">
                <div className="relative">
                  <BiSearch className="absolute top-4 left-4 text-2xl text-green-300" />
                  <input
                    type="text"
                    placeholder="Senior roles, executive positions, specialist opportunities..."
                    className="w-full pl-12 pr-4 py-4 bg-white/5 backdrop-blur-sm border border-green-300/20 rounded-xl text-white placeholder-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-transparent"
                  />
                </div>
              </div>
              <button className="bg-white text-green-900 px-8 py-4 rounded-xl font-semibold hover:bg-green-50 transition-all duration-300 hover:scale-105 shadow-lg flex items-center space-x-3"
               onClick={() => navigate("/jobs")}>
                <BiStats className="w-6 h-6" />
                <span>Advanced Search</span>
              </button>
            </div>
            
            <div className="flex flex-wrap gap-4 mt-6 justify-center">
              {["Executive Leadership", "Technology Management", "Research & Development", "Strategic Consulting", "Data Analytics", "Financial Services"].map((tag) => (
                <span key={tag} className="px-4 py-2 bg-white/10 rounded-full text-sm text-green-200 border border-green-300/30">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Corporate Partners */}
      <div className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Strategic Alliance Partners</h3>
            <p className="text-gray-600 text-lg">Collaborating with industry pioneers and market innovators</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {partnerCompanies.map((company, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300 text-center">
                <div className="text-3xl mb-3">{company.logo}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{company.name}</h4>
                <p className="text-sm text-gray-600">{company.sector}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Executive Testimonials */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="w-2 h-12 bg-gradient-to-b from-red-900 to-green-900 rounded-full"></div>
              <h3 className="text-3xl md:text-4xl font-bold text-gray-900">Executive Endorsements</h3>
              <div className="w-2 h-12 bg-gradient-to-b from-green-900 to-red-900 rounded-full"></div>
            </div>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Insights from industry leaders and successful alumni who have shaped their careers through strategic partnerships
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-xl border border-gray-200 hover:shadow-2xl transition-all duration-500">
                <div className="flex items-start mb-6">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-green-900 shadow-md"
                  />
                  <div className="ml-4">
                    <h4 className="font-bold text-gray-900 text-lg">{testimonial.name}</h4>
                    <p className="text-green-900 font-semibold">{testimonial.role}</p>
                    <p className="text-gray-600 text-sm">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={`w-5 h-5 ${
                        i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <FaQuoteLeft className="text-green-900/20 w-8 h-8 mb-4" />
                <p className="text-gray-700 text-lg leading-relaxed italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
          <h3 className="text-4xl md:text-6xl font-bold mb-6">Ready to Accelerate Your Career Trajectory?</h3>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join the elite network of professionals shaping the future of industry and innovation
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
            <button className="bg-gradient-to-r from-green-900 to-green-700 hover:from-green-800 hover:to-green-600 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-2xl flex items-center space-x-3">
              <FaRocket className="w-6 h-6" />
              <span>Launch Your Career</span>
            </button>
            <button className="border-2 border-white/30 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-300 hover:bg-white/10 backdrop-blur-sm">
              Schedule Executive Briefing
            </button>
          </div>
        </div>
      </div>

      {/* Premium Footer */}
      <div className="bg-gradient-to-r from-gray-950 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <img
                  src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png"
                  alt="Regent University Logo"
                  className="w-12 h-12"
                />
                <span className="text-xl font-bold">Regent University</span>
              </div>
              <p className="text-gray-400 text-sm leading-relaxed">
                Premier institution for science, technology, and professional leadership development.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-green-400">Strategic Initiatives</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Executive Placements</li>
                <li>Industry Research</li>
                <li>Leadership Development</li>
                <li>Innovation Partnerships</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-green-400">Corporate Relations</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Partnership Opportunities</li>
                <li>Talent Acquisition</li>
                <li>Research Collaboration</li>
                <li>Executive Education</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-green-400">Contact Leadership</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>careers@regent.edu.gh</li>
                <li>+233 24 123 4567</li>
                <li>Accra, Ghana</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-500 text-sm">
              © 2024 Regent University Career Development Platform. All rights reserved. | Executive Leadership in Education & Innovation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;