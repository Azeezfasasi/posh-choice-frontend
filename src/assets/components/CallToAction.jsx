import { Link } from 'react-router-dom';
import visible2 from '../images/visible2.jpg';

function CallToAction() {
  return (
    <>
    <div className="min-h-screen bg-white font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container for the entire section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Section: Text Content */}
        <div className="flex flex-col justify-center text-center lg:text-left">
          <h1 className="text-[30px] lg::text-6xl font-bold text-gray-800 leading-tight mb-6">
            Powering Your Devices, Spaces & Digital Presence
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed mb-8">
            At IT Service Pro, we deliver reliable, expert-driven solutions designed to keep your technology running smoothly and your business moving forward. From diagnosing and repairing laptops to setting up office networks and building powerful websites and apps, we bring precision, efficiency, and attention to detail to every service we offer.
            <br />
            Let us handle the tech — so you can stay focused on what matters most.
          </p>
          <div className="flex justify-center lg:justify-start">
            <Link to="/quoterequest" className="flex items-center space-x-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full shadow-lg transition duration-300 ease-in-out transform hover:-translate-y-1">
              {/* Phone icon from Lucide React or similar, here using inline SVG */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-phone-call">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                <path d="M14.05 2a10.29 10.29 0 0 1 1.8 3.95M17.45 6.85a14.29 14.29 0 0 1 3.6 5.65" />
              </svg>
              <span>Request Quote</span>
            </Link>
          </div>
        </div>

        {/* Right Section: Images and Service Overlays */}
        <div className="relative w-full h-96 sm:h-[500px] lg:h-[600px] flex justify-center items-center">
          {/* Main image with rounded corners and shadow */}
          <img
            src={visible2}
            alt="Home Services"
            className="absolute rounded-3xl shadow-xl object-cover w-full h-full transform rotate-3 scale-105"
          />
          {/* Service Overlays */}
          {/* Installation */}
          <div className="absolute top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 bg-blue-700 bg-opacity-90 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-2 z-10 w-32 h-32 text-center transition duration-300 ease-in-out hover:scale-105">
            {/* Wrench icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-wrench">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.77 3.77Z" />
              <path d="M15 9l4 4" />
            </svg>
            <span className="text-sm font-semibold">Installation</span>
          </div>

          {/* Repairs */}
          <div className="absolute top-1/2 right-0 transform -translate-x-1/2 -translate-y-1/2 bg-blue-700 bg-opacity-90 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-2 z-10 w-32 h-32 text-center transition duration-300 ease-in-out hover:scale-105">
            {/* Paint brush icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-paint-brush">
              <path d="M11.93 17.07l5.63-5.63c.4-.4.88-.63 1.4-.63a2.4 2.4 0 0 1 2.4 2.4c0 .5-.23.98-.63 1.38l-5.63 5.63-3.32 3.32c-.75.75-2.07.75-2.83 0L3.17 20.31a.999.999 0 0 1 0-1.41l5.63-5.63" />
              <path d="M15 6l2-2" />
              <path d="M17 4l4-4" />
              <path d="M3.17 20.31L1.75 21.73a.999.999 0 0 0 0 1.41c.39.39 1.02.39 1.41 0l1.42-1.42" />
            </svg>
            <span className="text-sm font-semibold">Repairs</span>
          </div>

          {/* Maintenances */}
          <div className="absolute bottom-10 right-1/4 transform -translate-x-1/2 translate-y-1/2 bg-blue-700 bg-opacity-90 text-white p-4 rounded-xl shadow-lg flex flex-col items-center justify-center space-y-2 z-10 w-32 h-32 text-center transition duration-300 ease-in-out hover:scale-105">
            {/* Question mark icon */}
            <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-circle-help">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <path d="M12 17h.01"/>
            </svg>
            <span className="text-sm font-semibold">Maintenances</span>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default CallToAction