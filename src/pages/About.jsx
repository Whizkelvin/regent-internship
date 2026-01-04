import React from 'react'
import Header from '../components/Header'
import { Book, UniversityIcon } from 'lucide-react'
import { FaIndustry } from 'react-icons/fa'
import { CgOrganisation } from 'react-icons/cg'

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="pt-20 md:pt-24">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-red-950 to-red-950 text-white py-16 px-4 md:py-24">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <div className="inline-flex items-center mb-6 px-4 py-2 bg-red-800/40 rounded-full border border-red-300/30">
                <span className="h-2 w-2 rounded-full bg-green-300 mr-2 animate-pulse"></span>
                <span className="text-sm font-medium">Career Acceleration Platform</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
                The definitive career acceleration platform for <span className="text-red-300">exceptional talent</span>
              </h1>
              <p className="text-xl text-blue-100 max-w-3xl">
                Bridging the gap between education and real-world impact through strategic partnerships.
              </p>
            </div>
            
            <div className="md:w-1/2 flex justify-center">
              <div className="relative">
                <div className="absolute -top-6 -left-6 w-24 h-24 "></div>
                <div className="absolute -bottom-6 -right-6 w-32 h-32"></div>
                <div className="relative  rounded-2xl p-8 pl-12 lg:pl-40 ">
                  <img 
                    src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png" 
                    alt="Regent Hub Logo" 
                    className="w-64 h-auto lg:ml-10"
                  />
                  <div className="mt-6 pt-6 border-t border-white/30">
                    <p className="text-lg font-semibold text-center">Regent Hub</p>
                    <p className="text-blue-200 text-center">Cultivating the next generation of industry leaders</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Mission</h2>
              <div className="h-1 w-24 bg-blue-600 mx-auto rounded-full"></div>
            </div>
            
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12 mb-12 border border-gray-100">
              <p className="text-xl md:text-2xl text-gray-700 leading-relaxed font-medium">
                Built to identify, nurture, and elevate the next generation of industry leaders. 
                We cultivate long-term, strategic partnerships between premier academic institutions 
                and influential industry organizations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <div className="bg-gradient-to-br from-blue-50 to-white p-8 rounded-2xl border border-blue-100 shadow-lg">
                <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
                  <UniversityIcon className=" text-2xl text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Academic Excellence</h3>
                <p className="text-gray-700">
                  Partnering with premier academic institutions to identify and develop 
                  exceptional talent with strong foundational knowledge and skills.
                </p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-50 to-white p-8 rounded-2xl border border-indigo-100 shadow-lg">
                <div className="w-14 h-14 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                  <FaIndustry className=" text-2xl text-green-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Industry Insight</h3>
                <p className="text-gray-700">
                  Connecting talent with influential industry organizations to provide 
                  real-world context and practical applications for their skills.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="bg-gray-900 text-white py-16 px-4 md:py-24">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How We Create Impact</h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                By combining academic excellence, industry insight, mentorship, and innovation-driven opportunities
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-blue-500 transition-all duration-300">
                <div className="flex items-start mb-6">
                  <div className="mr-4 mt-1">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Book className=" text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Empowering Individuals</h3>
                    <p className="text-gray-300">
                      We empower individuals to achieve career distinction through mentorship, 
                      hands-on experience, and access to innovation-driven opportunities that 
                      accelerate professional growth.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 hover:border-indigo-500 transition-all duration-300">
                <div className="flex items-start mb-6">
                  <div className="mr-4 mt-1">
                    <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                      <CgOrganisation className=" text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Enabling Organizations</h3>
                    <p className="text-gray-300">
                      We enable organizations to access future-ready talent that drives 
                      sustainable growth and innovation, creating a pipeline of leaders 
                      equipped to tackle tomorrow's challenges.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-12 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 rounded-2xl p-8 border border-blue-500/30">
              <div className="text-center max-w-3xl mx-auto">
                <p className="text-2xl font-bold mb-4">Bridging the Gap</p>
                <p className="text-xl text-gray-200">
                  Creating strategic connections between education and real-world impact, 
                  transforming theoretical knowledge into practical solutions that drive 
                  industry advancement.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats/Call to Action */}
        <section className="py-16 px-4 md:py-20 l">
          <div className="max-w-6xl mx-auto">
            <div className="bg-gradient-to-r from-green-950 to-green-700 rounded-3xl p-8 md:p-12 shadow-2xl">
              <div className="flex md:flex-row items-center justify-between gap-8">
                <div className="md:w-2/3">
                  <h3 className="text-3xl font-bold text-white mb-4">Ready to accelerate your career or access top talent?</h3>
                  <p className="text-blue-100 text-lg">
                    Join Regent Hub in cultivating the next generation of industry leaders.
                  </p>
                </div>
                <div className="md:w-1/3 flex flex-col sm:flex-row gap-4">
                 
                 
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center">
              <img 
                src="https://res.cloudinary.com/dnkk72bpt/image/upload/v1762440313/RUCST_logo-removebg-preview_hwdial.png" 
                alt="Regent Hub Logo" 
                className="w-12 h-auto mr-4"
              />
              <div>
                <p className="text-xl font-bold">Regent Hub</p>
                <p className="text-gray-400 text-sm">Career Acceleration Platform</p>
              </div>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-gray-400">© {new Date().getFullYear()} Regent Hub. All rights reserved.</p>
              <p className="text-gray-500 text-sm mt-2">The definitive career acceleration platform for exceptional talent</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default About