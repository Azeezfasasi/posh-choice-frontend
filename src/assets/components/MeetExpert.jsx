import { Link } from "react-router-dom";

function MeetExpert() {
  const experts = [
    {
      id: 1,
      name: 'Alima Jimoh',
      title: 'Founder & CEO',
      bio: 'Alima Jimoh is the visionary founder of Posh Choice Store. With over 5 years of experience in the industry, she is dedicated to delivering quality, innovation, and customer satisfaction. Her leadership has transformed the store into a trusted name for souvenir and household products across Nigeria.',
      linkedin: '#',
      image: 'https://placehold.co/300x350/ffedd5/222222?text=Alima+Jimoh',
    },
  ];

  return (
    <>
    <div className="min-h-screen bg-white font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container for the entire section */}
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Heading and Description */}
        <div className="flex flex-col justify-center gap-8 mb-10">
          <div className="text-center">
            <h2 className="text-3xl sm:text-4xl lg:text-4xl font-bold text-gray-800 leading-tight">
              Meet Our Founder
            </h2>
            <p className="text-purple-600 font-semibold">Trusted. Experienced. Committed to Quality.</p>
          </div>
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Posh Choice Store is led by a passionate team with decades of experience in the industry. Our founder, Alima Jimoh, has built a business rooted in integrity, innovation, and a deep commitment to customer satisfaction.
            </p>
            <p className="text-gray-600">
              From product design to customer care, our leadership team ensures every product meets the highest standards of quality and sustainability. We believe in empowering our staff, supporting our community, and delivering value to every customer.
            </p>
          </div>
        </div>

        {/* Bottom Section: Expert Cards */}
        <div className="flex flex-row justify-center">
          {experts.map((expert) => (
            <div
              key={expert.id}
              className="relative rounded-3xl shadow-xl overflow-hidden w-full max-w-md h-auto transform transition-all duration-300 ease-in-out hover:scale-105"
            >
              <img
                src={expert.image}
                alt={expert.name}
                className="w-full h-full object-cover"
              />
              {/* Name and Title Overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-purple-600 bg-opacity-90 text-white p-4">
                <h3 className="text-[16px] md:text-[20px] font-semibold">{expert.name}</h3>
                <p className="text-[13px] md:text-[14px] font-medium">{expert.title}</p>
                <p className="text-[12px] md:text-[13px] mt-1">{expert.bio}</p>
                <div className="flex justify-start items-center gap-5 mt-3">
                  <Link to=""><i className="fa-brands fa-facebook text-[25px]"></i></Link>
                  <Link to=""><i className="fa-brands fa-instagram text-[25px]"></i></Link>
                  <Link to=""><i className="fa-brands fa-whatsapp text-[25px]"></i></Link>
                  <Link to=""><i className="fa-brands fa-tiktok text-[25px]"></i></Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Extra: Company Values Section */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Core Values</h3>
          <div className="flex flex-wrap justify-center gap-6">
            <div className="bg-purple-50 rounded-xl p-6 w-64 shadow">
              <h4 className="font-semibold text-purple-700 mb-2">Quality</h4>
              <p className="text-gray-600 text-sm">We never compromise on the quality of our products and services.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 w-64 shadow">
              <h4 className="font-semibold text-purple-700 mb-2">Innovation</h4>
              <p className="text-gray-600 text-sm">We embrace new ideas and technologies to serve you better.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 w-64 shadow">
              <h4 className="font-semibold text-purple-700 mb-2">Sustainability</h4>
              <p className="text-gray-600 text-sm">We are committed to eco-friendly practices and responsible manufacturing.</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-6 w-64 shadow">
              <h4 className="font-semibold text-purple-700 mb-2">Customer Focus</h4>
              <p className="text-gray-600 text-sm">Your satisfaction is our top priority, every single day.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default MeetExpert