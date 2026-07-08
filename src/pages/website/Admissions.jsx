import { MessageCircle, ClipboardList, UserCheck, FileText, CheckCircle } from 'lucide-react'

const WA_LINK = 'https://wa.me/2348012345678?text=Hello%2C%20I%27d%20like%20to%20start%20the%20admissions%20process%20for%20my%20child'

const STEPS = [
  {
    n: '01',
    icon: MessageCircle,
    title: 'Enquiry',
    desc: 'Chat with our admissions team on WhatsApp or call any campus to ask about availability and class placement.',
  },
  {
    n: '02',
    icon: FileText,
    title: 'Application Form',
    desc: 'Collect and complete an application form from any campus. You may also download and fill it on WhatsApp.',
  },
  {
    n: '03',
    icon: ClipboardList,
    title: 'Assessment',
    desc: 'Students sit a short, age-appropriate entrance assessment so we can place them in the right class.',
  },
  {
    n: '04',
    icon: UserCheck,
    title: 'Enrolment',
    desc: 'Successful applicants receive an admission letter. Pay term fees and collect your welcome pack — you\'re in!',
  },
]

const REQUIREMENTS = [
  'Completed application / registration form',
  'Birth certificate or immunisation card (nursery & primary)',
  'Most recent school report card (for transfer students)',
  'Two recent passport-sized photographs',
  "Photocopies of parent/guardian's valid ID",
  'Proof of address (utility bill or tenancy agreement)',
]

const TERMS = [
  { term: 'First Term',  period: 'September – December', open: 'June – August' },
  { term: 'Second Term', period: 'January – March',      open: 'November – December' },
  { term: 'Third Term',  period: 'April – July',         open: 'February – March' },
]

export default function Admissions() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-burgundy-700 pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gold-400 text-sm font-semibold uppercase tracking-widest mb-3">Admissions</p>
          <h1 className="font-serif text-4xl sm:text-5xl text-white mb-4">
            Join the Debbyfield Family
          </h1>
          <p className="text-white/75 text-lg max-w-2xl mx-auto mb-8">
            We welcome new students every term. The admissions process is simple, supportive and designed to be completed within a week.
          </p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors shadow-lg"
          >
            <MessageCircle size={18} /> Start on WhatsApp
          </a>
        </div>
      </section>

      {/* Process */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Simple Process</p>
            <h2 className="font-serif text-3xl sm:text-4xl text-gray-900">How to Enrol in 4 Steps</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="relative">
                <div className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow h-full">
                  <div className="w-14 h-14 bg-burgundy-50 rounded-2xl flex items-center justify-center mx-auto mb-4 relative">
                    <s.icon size={22} className="text-burgundy-700" />
                    <span className="absolute -top-2 -right-2 w-6 h-6 bg-gold-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                      {i + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gray-200 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Requirements */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Checklist</p>
              <h2 className="font-serif text-3xl text-gray-900 mb-6">Documents Required</h2>
              <ul className="space-y-3">
                {REQUIREMENTS.map(r => (
                  <li key={r} className="flex items-start gap-3">
                    <CheckCircle size={17} className="text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-gray-600">{r}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                <strong>Note:</strong> All documents should be originals brought for verification, with one clear photocopy each. Nursing or creche-age children may need a recent medical fitness certificate.
              </div>
            </div>

            <div>
              <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">Intake Windows</p>
              <h2 className="font-serif text-3xl text-gray-900 mb-6">When to Apply</h2>
              <p className="text-sm text-gray-500 mb-6">
                We accept new students at the start of every term, subject to available spaces. To avoid disappointment, apply at least one month before the target term begins.
              </p>
              <div className="space-y-3">
                {TERMS.map(t => (
                  <div key={t.term} className="p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <p className="font-semibold text-gray-900 text-sm">{t.term}</p>
                    <p className="text-xs text-gray-500 mt-0.5">School period: {t.period}</p>
                    <p className="text-xs text-burgundy-700 font-medium mt-1">Applications open: {t.open}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-burgundy-700 text-sm font-semibold uppercase tracking-widest mb-3">FAQs</p>
            <h2 className="font-serif text-3xl text-gray-900">Common Questions</h2>
          </div>
          <div className="space-y-5">
            {[
              {
                q: 'Do you accept mid-term transfers?',
                a: 'Yes, we do accept transfers during term subject to space availability. Please contact us as early as possible.',
              },
              {
                q: 'Is there a placement test for young children?',
                a: 'Nursery and creche applicants are assessed informally through observation. Primary and secondary applicants sit a short written assessment.',
              },
              {
                q: 'Do you offer school buses?',
                a: 'We have partnered bus services covering major Lagos and Mowe routes. Please ask our admissions team for current routes and fees.',
              },
              {
                q: 'What is the medium of instruction?',
                a: 'All subjects are taught in English. Yoruba is offered as a language subject. French is available from Primary level.',
              },
            ].map(f => (
              <div key={f.q} className="border border-gray-100 rounded-xl p-5 hover:shadow-sm transition-shadow">
                <p className="font-semibold text-gray-900 text-sm mb-2">{f.q}</p>
                <p className="text-sm text-gray-500 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-2xl mx-auto px-6 text-center">
          <h2 className="font-serif text-3xl text-white mb-4">Ready to Begin?</h2>
          <p className="text-gray-400 mb-8">Send us a WhatsApp message and our admissions team will respond within the hour on school days.</p>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-8 py-4 rounded-xl text-base transition-colors shadow-lg"
          >
            <MessageCircle size={18} /> WhatsApp Admissions Now
          </a>
        </div>
      </section>
    </div>
  )
}
