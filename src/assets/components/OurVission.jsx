import React from 'react'
import about2 from '../images/product-image/about2.jpg'


function OurVission() {
  return (
    <>
    <div className="min-h-screen bg-white font-inter flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Container for the entire section */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        {/* Left Section: Vision Statement and Description */}
        <div className="flex flex-col justify-center text-center lg:text-left">
          <p className="text-purple-600 uppercase tracking-wide text-[18px] mb-4 font-semibold">Our Vision</p>
          <h1 className="text-[25px] sm:text-[30px] lg:text-[32px] font-bold text-gray-800 leading-tight mb-6">
            To be Nigeria's most trusted and innovative provider of sourvenir and household products, setting the benchmark for quality, sustainability, and customer satisfaction in every home and business we serve.
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            We envision a future where Posh Choice Store is synonymous with reliability, eco-friendly solutions, and continuous improvement. Our commitment is to lead the industry by embracing modern technology, responsible manufacturing, and a customer-first mindset.<br /><br />
            We strive to empower communities, support local businesses, and inspire positive change through products that make life easier, safer, and more sustainable for all.
          </p>
        </div>

        {/* Right Section: Image */}
        <div className="w-full flex justify-center items-center">
          <img
            src={about2}
            alt="About Posh Choice Store"
            className="rounded-3xl shadow-xl object-fill w-full h-[300px] md:h-[400px]"
          />
        </div>
      </div>
    </div>
    </>
  )
}

export default OurVission