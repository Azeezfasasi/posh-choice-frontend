import React from 'react';

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2348157574797'; // international format, no +
const WHATSAPP_MESSAGE = encodeURIComponent('Hello Posh Choice!\nI would like to make an enquiry about your products.');
const WHATSAPP_LINK = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

function WhatsAppChat() {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="group fixed right-4 bottom-4 md:right-6 md:bottom-6 z-40 inline-flex items-center gap-2 rounded-full bg-[#25D366] p-3.5 md:pl-4 md:pr-5 text-white shadow-[0_8px_24px_-6px_rgba(37,211,102,0.55)] hover:bg-[#1ebe5a] transition"
      aria-label="Chat with us on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="transition-transform group-hover:scale-110"
      >
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.472-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.151-.174.2-.298.3-.497.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.571-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.099 3.2 5.077 4.366.71.306 1.263.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.288.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.617h-.001a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.999-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.455 4.436-9.89 9.893-9.89 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.896 6.994c-.003 5.456-4.438 9.891-9.893 9.891m8.413-18.306A11.815 11.815 0 0 0 12.05 0C5.495 0 .06 5.435.058 12.09c0 2.13.557 4.213 1.615 6.044L0 24l6.064-1.591a11.888 11.888 0 0 0 5.983 1.527h.005c6.555 0 11.89-5.435 11.893-12.09a11.86 11.86 0 0 0-3.487-8.484"/>
      </svg>
      <span className="hidden md:inline text-sm font-semibold">Chat with us</span>
    </a>
  );
}

export default WhatsAppChat;
