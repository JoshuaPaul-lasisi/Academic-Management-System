import { useState } from 'react'
import { MessageCircle, Phone, Mail, MapPin, Clock, Send } from 'lucide-react'

const WA_LINK = 'https://wa.me/2348012345678?text=Hello%2C%20I%27d%20like%20to%20get%20in%20touch%20with%20Debbyfield%20Schools'

const CAMPUSES = [
  {
    name:    'Lagos Campus',
    address: '12 Debbyfield Close, Off Oshodi–Apapa Expressway, Lagos State',
    phone:   '+234 801 234 5678',
    email:   'lagos@debbyfield.sch.ng',
    hours:   'Mon – Fri: 7:30am – 4:00pm',
    color:   'border-burgundy-200 bg-burgundy-50',
    accent:  'text-burgundy-700',
  },
  {
    name:    'Mowe Campus',
    address: '8 School Road, Mowe, Ifo Local Government, Ogun State',
    phone:   '+234 808 765 4321',
    email:   'mowe@debbyfield.sch.ng',
    hours:   'Mon – Fri: 7:30am – 4:00pm',
    color:   'border-gold-200 bg-gold-50',
    accent:  'text-gold-700',
  },
]

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [sent, setSent] = useState(false)

  const setF = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent('Enquiry from Debbyfield Website')
    const body = encodeURIComponent(
      `Name: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\n\n${form.message}`
    )
    window.open(`mailto:info@debbyfield.sch.ng?subject=${subject}&body=${body}`, '_blank')
    setSent(true)
  }

  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy-700 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Get in Touch</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white mb-4">We'd Love to Hear From You</h1>
          <p className="text-white/75 text-lg max-w-xl mx-auto">
            Our admissions team is available on weekdays from 7:30am to 4:00pm. We typically respond to WhatsApp messages within the hour.
          </p>
        </div>
      </section>

      {/* WhatsApp CTA strip */}
      <div className="bg-green-500">
        <div className="max-w-4xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-white font-medium">Fastest response: message us on WhatsApp</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-5 py-2 rounded-lg hover:bg-green-50 transition-colors text-sm flex-shrink-0"
          >
            <MessageCircle size={15} /> Open WhatsApp
          </a>
        </div>
      </div>

      {/* Campuses */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Campuses</p>
            <h2 className="font-serif text-3xl text-gray-900">Find Us</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {CAMPUSES.map(c => (
              <div key={c.name} className={`rounded-2xl border-2 p-6 ${c.color}`}>
                <h3 className={`font-serif text-xl font-semibold mb-5 ${c.accent}`}>{c.name}</h3>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <MapPin size={17} className={`mt-0.5 flex-shrink-0 ${c.accent}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Address</p>
                      <p className="text-sm text-gray-700">{c.address}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Phone size={17} className={`mt-0.5 flex-shrink-0 ${c.accent}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Phone</p>
                      <a href={`tel:${c.phone.replace(/\s/g, '')}`} className={`text-sm ${c.accent} hover:underline`}>{c.phone}</a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Mail size={17} className={`mt-0.5 flex-shrink-0 ${c.accent}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">Email</p>
                      <a href={`mailto:${c.email}`} className={`text-sm ${c.accent} hover:underline break-all`}>{c.email}</a>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Clock size={17} className={`mt-0.5 flex-shrink-0 ${c.accent}`} />
                    <div>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">School Hours</p>
                      <p className="text-sm text-gray-700">{c.hours}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact form */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Send a Message</p>
            <h2 className="font-serif text-3xl text-gray-900">Drop Us a Line</h2>
            <p className="text-sm text-gray-400 mt-2">This will open your email app. For instant replies, use WhatsApp.</p>
          </div>

          {sent ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Email app opened!</h3>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">
                Complete and send the pre-filled email. For faster response, send us a WhatsApp message too.
              </p>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 bg-green-500 text-white font-semibold px-6 py-2.5 rounded-xl text-sm hover:bg-green-600 transition-colors"
              >
                <MessageCircle size={15} /> Message on WhatsApp
              </a>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full name *</label>
                  <input
                    required
                    value={form.name}
                    onChange={e => setF('name', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-700"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone number</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={e => setF('phone', e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-700"
                    placeholder="080 ..."
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email address *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setF('email', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-700"
                  placeholder="your@email.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                <textarea
                  required
                  value={form.message}
                  onChange={e => setF('message', e.target.value)}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-burgundy-700 resize-none"
                  placeholder="How can we help you? E.g. 'I'd like to enrol my child in Primary 2 next term…'"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-burgundy-700 hover:bg-burgundy-800 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <Send size={16} /> Send Message
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
