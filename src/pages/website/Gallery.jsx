import { useState } from 'react'
import { Camera, MessageCircle } from 'lucide-react'

const WA_LINK = 'https://wa.me/2348055771756?text=Hello%2C%20I%27d%20like%20to%20visit%20the%20campus'

const CATEGORIES = ['All', 'Campus', 'Classrooms', 'Sports', 'Events', 'Graduation']

// Placeholder gallery items — replace with real photo URLs when available
const ITEMS = [
  { category: 'Campus',     label: 'Lagos Campus Entrance',   bg: 'from-burgundy-800 to-burgundy-600', icon: '🏫' },
  { category: 'Classrooms', label: 'Modern Primary Classroom', bg: 'from-blue-700 to-blue-500',         icon: '📚' },
  { category: 'Campus',     label: 'Mowe Campus Grounds',      bg: 'from-green-800 to-green-600',       icon: '🌳' },
  { category: 'Sports',     label: 'Sports Day 2024',          bg: 'from-orange-700 to-orange-500',     icon: '🏃' },
  { category: 'Events',     label: 'End-of-Term Concert',      bg: 'from-purple-800 to-purple-600',     icon: '🎵' },
  { category: 'Graduation', label: 'SS3 Graduation Ceremony',  bg: 'from-gold-700 to-gold-500',         icon: '🎓' },
  { category: 'Classrooms', label: 'Computer Lab',             bg: 'from-teal-700 to-teal-500',         icon: '💻' },
  { category: 'Sports',     label: 'Football Inter-House',     bg: 'from-red-800 to-red-600',           icon: '⚽' },
  { category: 'Events',     label: 'Independence Day Parade',  bg: 'from-green-700 to-green-500',       icon: '🇳🇬' },
  { category: 'Campus',     label: 'Library & Reading Corner', bg: 'from-amber-700 to-amber-500',       icon: '📖' },
  { category: 'Events',     label: 'Prize-Giving Day',         bg: 'from-burgundy-700 to-burgundy-500', icon: '🏆' },
  { category: 'Graduation', label: 'Graduation 2023',          bg: 'from-indigo-700 to-indigo-500',     icon: '🎉' },
]

export default function Gallery() {
  const [active, setActive] = useState('All')

  const shown = active === 'All' ? ITEMS : ITEMS.filter(i => i.category === active)

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-900 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Gallery</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white mb-4">Life at Debbyfield</h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            A glimpse into the vibrant, nurturing environment where our students learn, grow and thrive every day.
          </p>
        </div>
      </section>

      {/* Filter tabs */}
      <section className="bg-white border-b border-gray-100 sticky top-16 z-30">
        <div className="max-w-5xl mx-auto px-6 py-3 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActive(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                  active === cat
                    ? 'bg-burgundy-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {shown.map((item, i) => (
              <div
                key={i}
                className={`aspect-square rounded-2xl bg-gradient-to-br ${item.bg} flex flex-col items-center justify-center p-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-sm`}
              >
                <span className="text-4xl mb-2">{item.icon}</span>
                <p className="text-white/90 text-xs font-medium text-center leading-tight">{item.label}</p>
                <span className="mt-2 text-white/50 text-xs">{item.category}</span>
              </div>
            ))}
          </div>

          {/* Coming soon notice */}
          <div className="mt-12 text-center py-10 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Camera size={32} className="text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-500 mb-1">More photos coming soon</p>
            <p className="text-sm text-gray-400 max-w-sm mx-auto">
              We're building our online gallery. Visit our campus to see the full Debbyfield experience in person.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-burgundy-700">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-white mb-4">See It For Yourself</h2>
          <p className="text-white/75 mb-8">Schedule a campus visit and experience the Debbyfield environment first-hand.</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow"
          >
            <MessageCircle size={18} /> Book a Campus Tour
          </a>
        </div>
      </section>
    </div>
  )
}
