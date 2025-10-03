import {Home, Wrench, Rocket, LifeBuoy} from 'lucide-react';

function WhyChooseUs() {
    const features = [
    {
      id: 1,
      icon: <Home width={40} height={40} />,
      title: 'Tech Experts You Can Trust',
      description: 'Our team is made up of certified professionals with deep knowledge in laptop repairs, IT infrastructure, and digital development — delivering smart, effective solutions every time.',
      primary: false,
    },
    {
      id: 2,
      icon: <Wrench width={40} height={40} />,
      title: 'Highly Skilled Technicians',
      description: 'With hands-on experience and continuous training, our technicians are equipped to handle everything from routine maintenance to complex installations — fast, clean, and right the first time.',
      primary: false,
    },
    {
      id: 3,
      icon: <Rocket width={40} height={40} />,
      title: 'Energy-Efficient Solutions',
      description: 'We don’t just fix and install — we help you optimize. Our services are designed to improve system performance and reduce unnecessary energy consumption, especially in office environments.',
      primary: false,
    },
    {
      id: 4,
      icon: <LifeBuoy width={40} height={40} />,
      title: 'Reliable Maintenance & Support',
      description: 'Enjoy peace of mind with our ongoing support and professional maintenance plans. We are here when you need us — no delays, no hassle',
      primary: false,
    },
  ];

  return (
    <>
    <div className="min-h-screen bg-white font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container for the entire section */}
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Heading and Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="text-center lg:text-left">
            <h1 className="text-[25px] md:text-[40px] lg:text-[50px] font-bold text-gray-800 leading-tight">
              Why Choose IT Service Pro?
            </h1>
          </div>
          <div className="text-center lg:text-left">
            <p className="text-[18px] font-semibold">Trusted. Skilled. Always Ready.</p>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Experience true peace of mind with our cutting-edge tech solutions, expert technicians, and outstanding customer support. Here’s why IT Service Pro is the smart choice for all your IT needs:
            </p>
          </div>
        </div>

        {/* Bottom Section: Feature Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="rounded-3xl shadow-lg p-8 flex flex-col items-center text-center transition-all duration-300 ease-in-out hover:scale-105 bg-gray-100 hover:bg-blue-500 text-black hover:text-white"
            >
              <div className={`p-4 rounded-full mb-4 ${feature.primary ? 'bg-white text-blue-500' : 'bg-blue-500 text-white'}`}>
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  )
}

export default WhyChooseUs