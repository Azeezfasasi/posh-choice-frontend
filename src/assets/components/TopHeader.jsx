import React from 'react'
import { Link } from 'react-router-dom';
import { Mail, Phone, Clock } from 'lucide-react';

function TopHeader() {
  return (
    <div className="bg-ink text-white/85 text-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-9 flex items-center justify-center md:justify-between gap-4">
        <div className="hidden md:flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-gold" />
          <span>Open 24 hours. Bulk &amp; custom orders welcome.</span>
        </div>
        <div className="flex items-center gap-5">
          <a href="tel:+2348157574797" className="flex items-center gap-1.5 hover:text-white transition">
            <Phone className="w-3.5 h-3.5 text-gold" />
            <span>(+234) 08157574797</span>
          </a>
          <a href="mailto:info@poshchoicestore.com.ng" className="hidden sm:flex items-center gap-1.5 hover:text-white transition">
            <Mail className="w-3.5 h-3.5 text-gold" />
            <span>info@poshchoicestore.com.ng</span>
          </a>
          <Link to="/app/trackorder" className="hidden lg:inline hover:text-white transition underline-offset-4 hover:underline">
            Track your order
          </Link>
        </div>
      </div>
    </div>
  )
}

export default TopHeader
