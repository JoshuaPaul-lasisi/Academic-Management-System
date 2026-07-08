import { useNavigate, Link } from 'react-router-dom'
import { MessageCircle, ChevronRight, BookOpen, Award, Users, Heart, Star } from 'lucide-react'

const WA_LINK = 'https://wa.me/2348012345678?text=Hello%2C%20I%27m%20interested%20in%20enrolling%20my%20child%20at%20Debbyfield%20Schools'

const STATS = [
  { value: '2003', label: 'Established' },
  { value: '2',    label: 'Campuses' },
  { value: '14',   label: 'Classes' },
  { value: '500+', label: 'Students' },
]

const PILLARS = [
  {
    icon: BookOpen,
    title: 'Academic Excellence',
    desc: 'Rigorous, Nigeria-aligned curriculum from nursery through senior secondary, delivered by passionate educators.',
  },
  {
    icon: Heart,
    title: 'Character Formation',
    desc: 'We build integrity, resilience, and empathy — values that outlast every examination result.',
  },
  {
    icon: Award,
    title: 'Holistic Development',
    desc: 'Sports, arts, technology, and leadership programmes nurture the whole child, not just the scholar.',
  },
  {
    icon: Users,
    title: 'Community & Family',
    desc: 'A warm, inclusive environment where parents, staff, and students grow together as one family.',
  },
]

const LEVELS = [
  {
    colour:  'bg-gold-50 border-gold-200',
    badge:   'bg-gold-500 text-white',
    label:   'Nursery',
    classes: 'Pre-Nursery · Nursery 1 · Nursery 2',
    desc:    'Play-based early childhood education that builds curiosity, language and social skills.',
    href:    '/programmes#nursery',
  },
  {
    colour:  'bg-burgundy-50 border-burgundy-200',
    badge:   'bg-burgundy-700 text-white',
    label:   'Primary',
    classes: 'Primary 1 – Primary 5',
    desc:    'A strong foundation in literacy, numeracy, science and the arts prepares pupils for secondary school.',
    href:    '/programmes#primary',
  },
  {
    colour:  'bg-blue-50 border-blue-200',
    badge:   'bg-blue-700 text-white',
    label:   'Secondary',
    classes: 'JSS 1–3 · SS 1–3',
    desc:    'WAEC/NECO-focused secondary education with science, arts and commercial tracks for SS students.',
    href:    '/programmes#secondary',
  },
]

const TESTIMONIALS = [
  {
    quote: "My daughter joined Pre-Nursery at Debbyfield three years ago. Today she reads fluently and loves school. The teachers here genuinely care.",
    name: 'Mrs Adunola Fashola',
    role: 'Parent · Lagos Campus',
  },
  {
    quote: "Debbyfield prepared my son so well that he passed his WAEC with eight A's. The discipline and academic rigour here are unmatched.",
    name: 'Mr Emeka Okafor',
    role: 'Parent · Mowe Campus',
  },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #601220 0%, #8B1A2F 50%, #751628 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full border border-white/5" />
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full border border-white/5" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full border border-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-white/3" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center py-24">
          <div className="inline-block bg-gold-500/20 border border-gold-500/30 rounded-full px-4 py-1.5 mb-8">
            <span className="text-gold-300 text-sm font-medium tracking-wide">
              Lagos & Mowe Campuses · Est. 2003
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-white leading-tight mb-6">
            Where Every Child<br />
            <em className="text-gold-400 not-italic">Achieves Life's Purpose</em>
          </h1>

          <p className="text-white/75 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Debbyfield Schools offers world-class education from nursery through senior secondary,
            nurturing academic excellence, strong character, and lifelong confidence.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg"
            >
              <MessageCircle size={18} /> Chat with Admissions
            </a>
            <Link
              to="/admissions"
              className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors"
            >
              How to Apply <ChevronRight size={16} />
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 opacity-50">
          <div className="w-px h-8 bg-white/40 animate-pulse" />
          <p className="text-white/50 text-xs tracking-widest uppercase">Scroll</p>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────── */}
      <section className="bg-gold-500 py-8">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {STATS.map(s => (
              <div key={s.label}>
                <p className="text-3xl font-serif font-bold text-white">{s.value}</p>
                <p className="text-white/80 text-sm font-medium mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Debbyfield ───────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Why Choose Us</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900">
              Education That Shapes Destinies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map(p => (
              <div key={p.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow group">
                <div className="w-14 h-14 bg-burgundy-50 group-hover:bg-burgundy-100 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  <p.icon size={26} className="text-burgundy-700" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Programmes ───────────────────────────────────────── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Our Programmes</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900">
              From First Steps to Final Exams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {LEVELS.map(l => (
              <div key={l.label} className={`rounded-2xl border-2 p-6 ${l.colour}`}>
                <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${l.badge}`}>
                  {l.label}
                </span>
                <p className="text-xs text-gray-500 mb-3 font-medium">{l.classes}</p>
                <p className="text-gray-700 text-sm leading-relaxed mb-6">{l.desc}</p>
                <Link
                  to="/programmes"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-burgundy-700 hover:gap-2 transition-all"
                >
                  Learn more <ChevronRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 bg-burgundy-700">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Parent Voices</p>
            <h2 className="font-serif text-3xl text-white">What Our Families Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} size={14} className="fill-gold-400 text-gold-400" />
                  ))}
                </div>
                <p className="text-white/90 text-sm leading-relaxed italic mb-5">"{t.quote}"</p>
                <div>
                  <p className="text-white font-semibold text-sm">{t.name}</p>
                  <p className="text-white/50 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl sm:text-4xl text-gray-900 mb-4">
            Ready to Give Your Child<br />the Best Start?
          </h2>
          <p className="text-gray-500 mb-8 text-lg">
            Spaces are limited each term. Reach our admissions team today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-3.5 rounded-xl text-base transition-colors shadow-md"
            >
              <MessageCircle size={18} /> WhatsApp Admissions
            </a>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 border-2 border-burgundy-700 text-burgundy-700 hover:bg-burgundy-50 font-semibold px-8 py-3.5 rounded-xl text-base transition-colors"
            >
              All Contact Details
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
