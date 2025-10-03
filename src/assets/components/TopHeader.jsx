import React from 'react'
import { Mail, Phone } from 'lucide-react';

function TopHeader() {
  return (
    <>
    {/* Top Bar */}
      <div className="bg-purple-500 text-white text-sm py-1 px-4 flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-0">
        <div className="hidden lg:flex items-center space-x-2 justify-center md:justify-start">
            <span className="h-2 w-2 bg-white rounded-full inline-block" />
            <span>We are ready 24 Hours</span>
        </div>
        <div className="flex flex-col md:flex-row items-center space-y-1 md:space-y-0 md:space-x-6 justify-center md:justify-end">
            <div className="flex items-center space-x-1">
            <Phone className="w-4 h-4" />
            <span>Fast Order: <a href="tel:08157574797" className="text-white ">(+234) 08157574797</a></span>
            </div>
            <div className="flex items-center space-x-1">
            <Mail className="w-4 h-4" />
            <a href="mailto:info@poshchoicestore.com.ng" className="text-white">info@poshchoicestore.com.ng</a>
            </div>
        </div>
    </div>
    </>
  )
}

export default TopHeader

