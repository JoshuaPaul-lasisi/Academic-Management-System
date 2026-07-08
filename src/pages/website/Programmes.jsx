import { Link } from 'react-router-dom'
import { MessageCircle, CheckCircle } from 'lucide-react'

const WA_LINK = 'https://wa.me/2348012345678?text=Hello%2C%20I%27d%20like%20to%20know%20more%20about%20your%20programmes'

const PROGRAMMES = [
  {
    id: 'nursery',
    badge:   'Nursery & Creche',
    color:   'gold',
    classes: ['Pre-Nursery', 'Nursery 1', 'Nursery 2'],
    ages:    'Ages 18 months – 5 years',
    icon:    '🌱',
    about:   'Our nursery programme creates a warm, stimulating environment for our youngest learners. Through play, song, storytelling and structured activities, children develop language, social skills and a love of learning that sets them up for a lifetime of success.',
    subjects: [
      'Literacy & Phonics', 'Numeracy & Number Sense', 'Creative Arts & Crafts',
      'Music, Rhymes & Movement', 'Environmental Studies', 'Physical Education',
    ],
    highlights: [
      'Small class sizes — maximum 15 per class',
      'Fully trained early-childhood educators',
      'Structured daily routine with play-based learning',
      'Weekly parent communication updates',
    ],
  },
  {
    id: 'primary',
    badge:   'Primary School',
    color:   'burgundy',
    classes: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5'],
    ages:    'Ages 5 – 11 years',
    icon:    '📚',
    about:   'Our primary school builds on the nursery foundation with a comprehensive, skills-based curriculum aligned to the National Policy on Education. Pupils develop confidence in English, Mathematics, Science and Social Studies, alongside creative arts, ICT and physical education.',
    subjects: [
      'English Language', 'Mathematics', 'Basic Science & Technology',
      'Social Studies', 'Civic Education', 'CRS / IRS',
      'Computer Studies', 'Cultural & Creative Arts',
      'Physical & Health Education', 'Yoruba / French',
    ],
    highlights: [
      'Strong literacy and numeracy focus',
      'Annual inter-school competitions',
      'Computer lab access from Primary 2',
      'Regular formative assessments and termly exams',
    ],
  },
  {
    id: 'secondary',
    badge:   'Secondary School',
    color:   'blue',
    classes: ['JSS 1', 'JSS 2', 'JSS 3', 'SS 1', 'SS 2', 'SS 3'],
    ages:    'Ages 11 – 18 years',
    icon:    '🎓',
    about:   'Our secondary department prepares students for BECE (JSS3), WAEC and NECO (SS3). Junior secondary covers a broad curriculum, while senior secondary students choose from Science, Arts or Commercial tracks, supported by specialist subject teachers and regular mock examinations.',
    subjects: [
      'English Language', 'Mathematics', 'Biology', 'Chemistry', 'Physics',
      'Agricultural Science', 'Economics', 'Government',
      'Literature in English', 'Business Studies (JSS)',
      'Commerce', 'Accounting', 'Geography',
      'Computer Studies', 'CRS / IRS', 'French / Yoruba',
    ],
    highlights: [
      'JSS 1–3: broad general curriculum including Business Studies & Literature',
      'SS 1–3: Science, Arts and Commercial subject tracks',
      'Dedicated WAEC/NECO preparation programme',
      'University counselling and career guidance',
    ],
  },
]

const colorMap = {
  gold:     { badge: 'bg-gold-500 text-white',     ring: 'border-gold-200',   bg: 'bg-gold-50'     },
  burgundy: { badge: 'bg-burgundy-700 text-white',  ring: 'border-burgundy-200', bg: 'bg-burgundy-50' },
  blue:     { badge: 'bg-blue-700 text-white',      ring: 'border-blue-200',   bg: 'bg-blue-50'     },
}

export default function Programmes() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-900 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Academic Programmes</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white mb-4">
            From First Steps<br />to Final Exams
          </h1>
          <p className="text-gray-400 text-lg max-w-xl mx-auto">
            A seamless academic journey from Pre-Nursery all the way through to SS3 — on two campuses, with one consistent standard of excellence.
          </p>
        </div>
      </section>

      {/* Programmes */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6 space-y-20">
          {PROGRAMMES.map(prog => {
            const c = colorMap[prog.color]
            return (
              <div key={prog.id} id={prog.id} className="scroll-mt-20">
                <div className="grid md:grid-cols-2 gap-10 items-start">
                  <div>
                    <span className={`inline-block text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${c.badge}`}>
                      {prog.icon}  {prog.badge}
                    </span>
                    <p className="text-xs text-gray-400 font-medium mb-2">{prog.ages}</p>
                    <h2 className="font-serif text-3xl text-gray-900 mb-4">{prog.badge}</h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-6">{prog.about}</p>

                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Classes Offered</h4>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {prog.classes.map(cl => (
                        <span key={cl} className={`px-3 py-1 rounded-full text-xs font-medium border-2 ${c.ring} ${c.bg} text-gray-700`}>
                          {cl}
                        </span>
                      ))}
                    </div>

                    <h4 className="text-sm font-semibold text-gray-900 mb-3">Key Highlights</h4>
                    <ul className="space-y-2">
                      {prog.highlights.map(h => (
                        <li key={h} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle size={15} className="text-green-500 mt-0.5 flex-shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`rounded-2xl border-2 p-6 ${c.ring} ${c.bg}`}>
                    <h4 className="text-sm font-semibold text-gray-800 mb-4 uppercase tracking-wide">Subjects Covered</h4>
                    <div className="flex flex-wrap gap-2">
                      {prog.subjects.map(s => (
                        <span key={s} className="px-2.5 py-1 bg-white rounded-lg text-xs text-gray-700 border border-gray-200">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                {prog !== PROGRAMMES[PROGRAMMES.length - 1] && (
                  <div className="mt-16 border-t border-gray-100" />
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-burgundy-700">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-white mb-4">Find the Right Programme</h2>
          <p className="text-white/75 mb-8">
            Not sure which class to enrol your child in? Our admissions team will guide you through the assessment process.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors"
            >
              <MessageCircle size={18} /> Ask on WhatsApp
            </a>
            <Link
              to="/admissions"
              className="inline-flex items-center justify-center gap-2 border-2 border-white/40 text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Admissions Process
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
