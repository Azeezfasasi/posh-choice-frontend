import React from 'react'
import { Mail, Phone, MapPin } from 'lucide-react'

function ContactInfo() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Contact Details */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold text-[#0A1F44] mb-4">Contact Information</h2>
          <div className="mb-4 flex items-start">
            <MapPin className="w-5 h-5 text-purple-500 mt-1 mr-3" />
            <span className="text-gray-700">Ikotun, Lagos</span>
          </div>
          <div className="mb-4 flex items-start">
            <Phone className="w-5 h-5 text-purple-500 mt-1 mr-3" />
            <a href="tel:08157574797" className="text-gray-700 hover:text-[#00B9F1] transition">(+234) 08157574797</a>
          </div>
          <div className="mb-4 flex items-start">
            <Mail className="w-5 h-5 text-purple-500 mt-1 mr-3" />
            <a href="mailto:info@poshchoicestore.com.ng" className="text-gray-700 hover:text-[#00B9F1] transition">info@poshchoicestore.com.ng</a>
          </div>
          <div className="mt-6">
            <h3 className="font-semibold text-[#0A1F44] mb-1">Business Hours</h3>
            <p className="text-gray-600">Monday - Saturday: 8:00am - 6:00pm</p>
            <p className="text-gray-600">Sunday: Closed</p>
          </div>
        </div>
        {/* Map */}
        <div className="flex-1 min-h-[250px]">
          <iframe
            title="Posh Choice Store Location"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.465478637447!2d3.281570173117978!3d6.588918422403552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b9038a7fd51d9%3A0xead27163d091ff5c!2s2%20Alhaji%20Oloye%20Street%2C%20Abule%20Odu%2C%20Lagos%20102213%2C%20Lagos!5e0!3m2!1sen!2sng!4v1751819869375!5m2!1sen!2sng"
            width="100%"
            height="100%"
            className="rounded-lg shadow min-h-[250px] w-full h-64 md:h-full"
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </section>
  )
}

export default ContactInfo