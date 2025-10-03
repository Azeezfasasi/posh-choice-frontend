// import heroone from '../images/heroone.jpg'
import computer from '../images/computer.jpg'

function HowItWorks() {
  return (
    <>
    <div className="min-h-screen bg-gray-200 font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container for the entire section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Section: Image with Badge */}
        <div className="relative w-full h-96 sm:h-[500px] lg:h-[600px] flex justify-center items-center">
          {/* Main image with rounded corners and shadow */}
          <img
            src={computer}
            alt="Professional Worker"
            className="absolute rounded-3xl shadow-xl object-fill w-full h-full"
          />

          {/* Blue checkmark badge */}
          <div className="absolute bottom-4 right-4 bg-blue-500 p-3 rounded-full shadow-lg">
            {/* Check icon (from Lucide React or similar, here using inline SVG) */}
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check-circle">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <path d="m9 11 3 3L22 4" />
            </svg>
          </div>
        </div>

        {/* Right Section: How it works steps */}
        <div className="flex flex-col justify-center text-center lg:text-left">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-800 leading-tight mb-8">
            How IT Service Pro <br /> works?
          </h2>

          {/* Step 1 */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start mb-8">
            <div className="flex-shrink-0 mr-4">
              <span className="text-5xl font-bold text-blue-500">1.</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">24/7 Support</h3>
              <p className="text-gray-600">
                Need help? Just give us a call or request a quote. Our friendly support team is available 24/7 to connect you with the right IT specialist — whether for repairs, setup, web development or rentals.
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start mb-8">
            <div className="flex-shrink-0 mr-4">
              <span className="text-5xl font-bold text-blue-500">2.</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Schedule Your Service</h3>
              <p className="text-gray-600">
                We will answer all your questions and help you book a flexible appointment that fits your schedule. We work around you — not the other way around.
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col sm:flex-row items-center lg:items-start mb-8">
            <div className="flex-shrink-0 mr-4">
              <span className="text-5xl font-bold text-blue-500">3.</span>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">Problem Solved</h3>
              <p className="text-gray-600">
                Our technician will respond on time, diagnose the issue, and provide a clear estimate. Once approved, we will get straight to work delivering fast, reliable results — every time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default HowItWorks