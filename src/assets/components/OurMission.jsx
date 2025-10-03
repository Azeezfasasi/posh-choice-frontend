import about1 from '../images/product-image/about1.jpg'

function OurMission() {
  return (
    <>
    <div className="min-h-screen bg-white font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container for the entire section */}
      <div className="max-w-7xl mx-auto">
        {/* Top Section: Main Mission Statement */}
        <div className="mb-0 flex flex-col justify-start items-center mx-auto">
          <p className="text-purple-600 uppercase tracking-wide text-[14px] lg:text-[20px] font-semibold mb-4 text-center lg:text-center">Our Mission</p>
          <h1 className="text-[25px] md:text-[30px] lg:text-[32px] font-bold text-gray-800 leading-tight text-center lg:text-center max-w-4xl mx-auto lg:mx-0">
            At Posh Choice Store, our mission is to deliver high-quality, innovative, and affordable plastic solutions that improve everyday life for families, businesses, and communities across Nigeria.
          </h1>
        </div>

        {/* Bottom Section: Image and Detailed Description */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-16">
          {/* Left Side: Image */}
          <div className="w-full flex justify-center items-center">
            <img
              src={about1}
              alt="About Posh Choice Store"
              className="rounded-3xl shadow-xl object-fill w-full h-[300px] md:h-[400px]"
            />
          </div>

          {/* Right Side: Detailed Description */}
          <div className="flex flex-col justify-center text-center lg:text-left">
            <p className="text-gray-600 leading-relaxed text-base sm:text-lg">
              Founded in 2020, Posh Choice Store has grown to become one of Nigeria's leading souvenir product seller suppliers. We specialize in a wide range of souvenir items, including gift items, household appliances, household items, and more. Our commitment to quality and customer satisfaction has earned us a reputation for excellence in the industry.
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default OurMission