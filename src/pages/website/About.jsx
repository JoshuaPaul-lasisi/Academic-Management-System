import { Link } from 'react-router-dom'
import { MessageCircle, Target, Eye, Gem } from 'lucide-react'

const WA_LINK = 'https://wa.me/2348055771756?text=Hello%2C%20I%27d%20like%20to%20know%20more%20about%20Debbyfield%20Schools'

const VALUES = [
  { icon: '🎓', title: 'Academic Excellence',  desc: 'We hold every student to the highest standard, celebrating effort as much as achievement.' },
  { icon: '🤝', title: 'Integrity',              desc: 'Honesty and moral courage are taught, modelled and expected at every level.' },
  { icon: '🌱', title: 'Growth Mindset',         desc: 'We believe every child can improve with the right support, persistence and encouragement.' },
  { icon: '🏆', title: 'Service',                desc: 'We prepare students to lead and serve their communities with compassion and competence.' },
  { icon: '🌍', title: 'Inclusivity',            desc: 'Every child, regardless of background, receives the same quality of care and education.' },
  { icon: '💡', title: 'Innovation',             desc: 'Modern tools and creative teaching methods keep learning relevant and engaging.' },
]

const TEAM = [
  { name: 'The Proprietress', role: 'Founder & Director',     initials: 'D' },
  { name: 'Lagos Principal',   role: 'Lagos Campus Principal', initials: 'P' },
  { name: 'Mowe Principal',    role: 'Mowe Campus Principal',  initials: 'P' },
]

export default function About() {
  return (
    <div>
      {/* Page hero */}
      <section className="bg-burgundy-700 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Our Story</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white mb-4">
            Two Decades of<br />Shaping Futures
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto">
            Since 2003, Debbyfield Schools has been a beacon of academic excellence and character
            formation across Lagos and Mowe.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Our History</p>
              <h2 className="font-serif text-3xl text-gray-900 mb-6">A Legacy Born of Purpose</h2>
              <div className="space-y-4 text-gray-600 leading-relaxed text-sm">
                <p>
                  Debbyfield Schools was founded in 2003 with a singular vision: to create an institution
                  where every Nigerian child — regardless of background — could discover their potential
                  and pursue it with confidence.
                </p>
                <p>
                  What began as a small nursery school in Lagos has grown into a full-service educational
                  institution spanning two thriving campuses, offering classes from Pre-Nursery right
                  through to Senior Secondary School (SS3).
                </p>
                <p>
                  Over twenty years, thousands of graduates have gone on to prestigious universities,
                  professional careers, and leadership positions — each one carrying the Debbyfield
                  motto: <em className="text-burgundy-700 font-medium">Achieving Life's Purpose.</em>
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: '2003', sub: 'Year Founded' },
                { label: '2',    sub: 'Campuses' },
                { label: '14',   sub: 'Class Levels' },
                { label: '20+',  sub: 'Years of Excellence' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-2xl p-6 text-center border border-gray-100">
                  <p className="font-serif text-4xl font-bold text-burgundy-700 mb-1">{s.label}</p>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">{s.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-burgundy-700 text-white rounded-2xl p-8">
              <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center mb-5">
                <Eye size={22} className="text-gold-300" />
              </div>
              <h3 className="font-serif text-2xl mb-4">Our Vision</h3>
              <p className="text-white/80 leading-relaxed">
                To be the most trusted name in quality education in Nigeria — an institution that
                produces graduates who are academically capable, morally grounded, and ready to
                lead Nigeria into a prosperous future.
              </p>
            </div>
            <div className="bg-white border-2 border-gold-200 rounded-2xl p-8">
              <div className="w-12 h-12 bg-gold-50 rounded-xl flex items-center justify-center mb-5">
                <Target size={22} className="text-gold-600" />
              </div>
              <h3 className="font-serif text-2xl text-gray-900 mb-4">Our Mission</h3>
              <p className="text-gray-600 leading-relaxed">
                To provide a safe, stimulating, and values-driven learning environment where every
                child is seen, known and equipped — academically, socially and spiritually — to
                achieve their God-given purpose.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">What We Stand For</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(v => (
              <div key={v.title} className="p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <span className="text-3xl mb-3 block">{v.icon}</span>
                <h4 className="font-semibold text-gray-900 mb-2">{v.title}</h4>
                <p className="text-sm text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Leadership</p>
            <h2 className="font-serif text-3xl text-gray-900">Guided by Dedicated Leaders</h2>
            <p className="text-gray-500 mt-3 text-sm max-w-lg mx-auto">
              Our administrative team brings decades of combined educational experience to serve our school community.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {TEAM.map(t => (
              <div key={t.name} className="text-center bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-20 h-20 rounded-full bg-burgundy-100 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold text-burgundy-700">{t.initials}</span>
                </div>
                <p className="font-semibold text-gray-900">{t.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gold-500">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-white mb-4">Become Part of Our Story</h2>
          <p className="text-white/80 mb-8">Join a community that has been shaping young lives for over twenty years.</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-gold-700 font-semibold px-7 py-3.5 rounded-xl hover:bg-gold-50 transition-colors shadow"
          >
            <MessageCircle size={18} /> Talk to Admissions
          </a>
        </div>
      </section>
    </div>
  )
}
