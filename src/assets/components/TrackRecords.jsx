import globe from '../images/globe.png'

function TrackRecords() {
    const stats = [
    { label: 'Successful Laptop & Device Repairs', value: '240+' },
    { label: 'Combined Industry Experience', value: '30y+' },
    { label: 'Customer Satisfaction Rate', value: '99%' },
    { label: 'Website and Mobile Apps', value: '50+' },
  ];

  return (
    <>
    <div className="relative min-h-screen bg-blue-900 font-inter flex items-center justify-center py-12 px-4 md:px-6 lg:px-8 overflow-hidden">
      <div className="flex flex-col w-full h-1/2 lg:h-2/3 xl:h-3/4">
        <div className='flex flex-col lg:flex-row justify-center'>
            <div className='hidden lg:block lg:w-[50%]'>
                <img
                src={globe}
                alt="Modern Home with Pool"
                className="w-full h-full object-fill rounded-bl-3xl rounded-br-3xl"
                />     
            </div> 
            <div className="relative z-10 w-full lg:w-[50%] mx-auto">
                {/* Top Section: Title and Description */}
                <div className="px-2 lg:px-6 text-white mb-20 mt-0 lg:mt-48">
                    <div className="text-center lg:text-left lg:col-start-2">
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                        Our Track Record in IT Solutions & Support
                        </h1>
                        <p>Proven Expertise. Measurable Results.</p>
                        <p className="text-base sm:text-lg text-blue-200 leading-relaxed">
                        At IT Service Pro, we take pride in our consistent delivery of reliable, high-quality tech services across laptop repairs, IT setups, and digital development. Backed by years of hands-on experience, our team continues to earn trust through skill, speed, and service excellence.
                        <br />
                        Here’s a snapshot of what we’ve achieved:
                        </p>
                    </div>
                </div>
            </div>
        </div>

        {/* Bottom Section: Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-white mt-12">
          {stats.map((stat, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <span className="text-5xl sm:text-6xl font-bold text-blue-300 mb-2">
                {stat.value}
              </span>
              <p className="text-lg sm:text-xl font-medium text-blue-100">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default TrackRecords