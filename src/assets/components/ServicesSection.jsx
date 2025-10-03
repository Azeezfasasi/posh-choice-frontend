import React from 'react';
import {
  Wrench,
  Laptop,
  Globe,
  Smartphone,
  Server,
  Speaker,
  KeyRound,
} from 'lucide-react';
import { Link } from 'react-router-dom';

const services = [
  {
    icon: <Wrench className="w-6 h-6 text-white" />,
    title: 'Laptop Repair & Maintenance',
    desc: 'From hardware issues to software glitches, our expert technicians provide fast and efficient laptop repairs to get you back on track. We also offer routine maintenance to extend the life of your device and keep it running smoothly.',
  },
  {
    icon: <Laptop className="w-6 h-6 text-white" />,
    title: 'Laptop Sales & Purchases',
    desc: 'Need a new system or looking to upgrade? We buy and sell quality laptops — new and fairly used — at competitive prices. Get expert advice to ensure you choose the right machine for your needs.',
  },
  {
    icon: <Globe className="w-6 h-6 text-white" />,
    title: 'Website Development',
    desc: 'Stand out online with a professionally crafted website. We build responsive, fast, and SEO-optimized websites tailored to your brand, business, or project — from simple landing pages to complex web applications.',
  },
  {
    icon: <Smartphone className="w-6 h-6 text-white" />,
    title: 'Mobile App Development',
    desc: 'Bring your idea to life with custom-built mobile applications for Android and iOS. We design and develop user-friendly apps that are functional, secure, and scalable.',
  },
  {
    icon: <Server className="w-6 h-6 text-white" />,
    title: 'Office Infrastructure & Server Setup',
    desc: 'Setting up a new network or upgrading your current network installation? We handle office installations, network configurations, and server setups, ensuring your team works efficiently and securely.',
  },
  // {
  //   icon: <Speaker className="w-6 h-6 text-white" />,
  //   title: 'Sound Equipment Rentals',
  //   desc: 'Planning an event? We provide high-quality sound system rentals for conferences, weddings, parties, and more. From speakers to microphones, we’ve got your audio needs covered.',
  // },
  {
    icon: <KeyRound className="w-6 h-6 text-white" />,
    title: 'Data Cleanup & Security Services',
    desc: 'Keep your systems secure and organized with our professional Data Cleanup and Lock Services, designed to enhance both digital and physical security.',
  },
];

const ServicesSection = () => {
  return (
    <section className="bg-white py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Services</h2>
          <p className="mt-2 text-gray-500 max-w-2xl mx-auto">
            At IT Service Pro, we’re your trusted tech partner, delivering reliable solutions that keep you connected, productive, and ahead of the curve. Whether you're an individual, a small business, or a large organization, we offer a wide range of services to meet your digital and hardware needs:
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 sm:grid-cols-2 grid-cols-1 gap-6">
          {services.map((service, index) => (
            <div key={index} className="flex flex-col gap-4 items-center md:items-start justify-start mx-auto h-[220px] md:h-[300px] lg:h-[250px] pt-5 px-2 border border-solid border-gray-300 shadow-lg rounded-md">
              <div className="bg-[#0A1F44] p-3 rounded-lg">
                {service.icon}
              </div>
              <div className='flex flex-col items-center md:items-start'>
                <h3 className="font-semibold text-gray-800">{service.title}</h3>
                <p className="text-sm text-gray-500">{service.desc}</p>
              </div>
            </div>
          ))}

          {/* Call to Action Box */}
          <div className="bg-[#00B9F1] text-white p-6 rounded-xl flex flex-col items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold mb-2">More service?</h4>
              <p className="text-sm">You can tell us what you need and we can help!</p>
            </div>
            <Link to="/quoterequest" className="mt-6 bg-white text-[#00B9F1] font-semibold px-6 py-2 rounded-full">
              Request Quote
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
