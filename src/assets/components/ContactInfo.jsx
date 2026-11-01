import React from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '2348157574797';

const CHANNELS = [
  { icon: Phone, title: 'Call us', value: '(+234) 08157574797', href: 'tel:+2348157574797', note: 'Fastest for orders and delivery questions' },
  { icon: MessageCircle, title: 'WhatsApp', value: 'Chat with us', href: `https://wa.me/${WHATSAPP_NUMBER}`, note: 'Send product photos or ask about stock', external: true },
  { icon: Mail, title: 'Email', value: 'info@poshchoicestore.com.ng', href: 'mailto:info@poshchoicestore.com.ng', note: 'For quotes, partnerships and invoices' },
];

function ContactInfo() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-10 md:py-14">
        <div className="grid sm:grid-cols-3 gap-4">
          {CHANNELS.map(({ icon, title, value, href, note, external }) => {
            const Icon = icon;
            return (
              <a
                key={title}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="group rounded-3xl border border-line bg-white p-6 transition hover:-translate-y-0.5 hover:border-plum-200 hover:shadow-[0_12px_32px_-16px_rgba(15,27,61,0.25)]"
              >
                <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-plum-50 text-plum-600 group-hover:bg-plum-600 group-hover:text-white transition">
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                </span>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-gold">{title}</p>
                <p className="mt-1 font-semibold text-ink break-all">{value}</p>
                <p className="mt-1 text-sm text-ink-soft">{note}</p>
              </a>
            );
          })}
        </div>

        <div className="mt-6 grid lg:grid-cols-[1fr_1.4fr] gap-6">
          <div className="rounded-3xl border border-line bg-cream p-6 md:p-8 space-y-6">
            <div className="flex gap-4">
              <MapPin className="w-5 h-5 text-plum-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink">Visit us</p>
                <p className="text-sm text-ink-soft mt-1">Ikotun, Lagos</p>
              </div>
            </div>
            <div className="flex gap-4">
              <Clock className="w-5 h-5 text-plum-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-ink">Business hours</p>
                <dl className="text-sm text-ink-soft mt-1 space-y-1">
                  <div className="flex gap-3"><dt className="w-36">Monday – Saturday</dt><dd className="text-ink">8:00am – 6:00pm</dd></div>
                  <div className="flex gap-3"><dt className="w-36">Sunday</dt><dd className="text-ink">Closed</dd></div>
                </dl>
              </div>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden border border-line min-h-[280px] bg-cream">
            <iframe
              title="Posh Choice Store location"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3963.465478637447!2d3.281570173117978!3d6.588918422403552!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x103b9038a7fd51d9%3A0xead27163d091ff5c!2s2%20Alhaji%20Oloye%20Street%2C%20Abule%20Odu%2C%20Lagos%20102213%2C%20Lagos!5e0!3m2!1sen!2sng!4v1751819869375!5m2!1sen!2sng"
              className="w-full h-full min-h-[280px] block"
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  )
}

export default ContactInfo
