import { Shield, Award, Users, Wrench, CheckCircle } from 'lucide-react';

const tesda = [
  { code: 'HVC723340', title: 'Installation of Packaged Air-Conditioning Unit' },
  { code: 'HVC723341', title: 'Installation of CRE' },
  { code: 'HVC723342', title: 'Service and Maintaining of PACU' },
  { code: 'HVC723343', title: 'Service and Maintaining of CRE' },
  { code: 'HVC723344', title: 'Troubleshooting and Repair of PACU' },
  { code: 'HVC723345', title: 'Troubleshooting and Repair of CRE' },
  { code: 'HVC723346', title: 'Perform Start-up Test and Commissioning for PACU' },
  { code: 'HVC723347', title: 'Perform Start-up Test and Commissioning for CRE' },
];

const values = [
  { icon: Shield, title: 'Licensed & Certified', desc: 'All technicians hold National Certificate Level III from TESDA — the highest qualification in RAC servicing in the Philippines.' },
  { icon: Award, title: 'Authorized Daikin Dealer', desc: 'GoClean is an official authorized dealer and installer of Daikin Airconditioning Philippines Inc. and a Certified Daikin VRV Expert.' },
  { icon: Users, title: 'Customer-First', desc: 'Since 2016, we have served hundreds of residential, commercial, and industrial clients with integrity and professionalism.' },
  { icon: Wrench, title: 'Expert Workmanship', desc: 'We specialize in project-based HVAC contracting — from single-unit installations to full chilled water systems for large facilities.' },
];

const stats = [
  { value: '2016', label: 'Year Founded' },
  { value: '100+', label: 'Corporate Clients' },
  { value: 'NC III', label: 'TESDA Certified' },
  { value: 'Daikin', label: 'Authorized Dealer' },
];

export default function AboutPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-4">About GoClean Aircon</h1>
          <p className="text-gray-500 max-w-3xl mx-auto text-lg">
            GoClean Aircon Supplies &amp; Services — your trusted HVAC partner for residential, commercial, and industrial air-conditioning needs in Laguna and Metro Manila.
          </p>
        </div>

        {/* Story */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
          <div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-4">Our Story</h2>
            <p className="text-gray-600 mb-4">
              GoClean Aircon Supplies &amp; Services started in <strong>March 2016</strong> with a vision to alleviate the household burden of unsafe, unhealthy air caused by dirty air conditioning units.
            </p>
            <p className="text-gray-600 mb-4">
              Our founder and owner, <strong>Marlon Punzalan Katigbak</strong>, who is also a father of two, realized the importance of keeping healthy, clean air at home to protect his family — particularly his children with asthma — from airborne diseases.
            </p>
            <p className="text-gray-600 mb-4">
              Through the government-sponsored programs of <strong>TESDA</strong>, Mr. Katigbak completed the 3-month intensive Refrigeration and Air Conditioning (RAC) program at Santa Rosa Manpower Training Center, earning a <strong>National Certificate III in RAC</strong> — the highest level in the field.
            </p>
            <p className="text-gray-600">
              Today, GoClean is an <strong>Authorized Daikin Dealer &amp; Installer</strong> and a <strong>Certified Daikin VRV Expert</strong>, serving over 100 corporate clients across Laguna, Metro Manila, and beyond.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-[#1e3a5f] text-white rounded-xl p-6 text-center">
                <div className="text-3xl font-extrabold text-[#f0a500] mb-1">{s.value}</div>
                <div className="text-blue-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Vision & Mission */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <div className="bg-[#1e3a5f] text-white rounded-2xl p-8">
            <h2 className="text-xl font-bold mb-3 text-[#f0a500]">Our Vision</h2>
            <p className="text-blue-100 leading-relaxed">
              GoClean Aircon aims to be known as one of the best and most respected technical and engineering solutions providers, well recognized for its consistent quality services in industrial air-conditioning and refrigeration systems. We will continue to grow — adopting modern technologies and developing competencies among our people — to continuously assure customer satisfaction through quality service workmanship.
            </p>
          </div>
          <div className="bg-gray-50 border rounded-2xl p-8">
            <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">Our Mission</h2>
            <p className="text-gray-600 mb-4">We are a service-based company with a mission to provide our customers with quality services. Our goal is to be a world-class industrial air-conditioning and refrigeration systems service provider.</p>
            <p className="text-gray-600 font-medium mb-2">Our success is based upon:</p>
            <ul className="space-y-1.5">
              {[
                'Overriding concern for Customer Satisfaction',
                'Pursuit for continual improvement',
                'Highest level of ethical standards of business',
                'Adherence to the law of preservation and environmental protection',
                'Upliftment and well-being of our employees',
              ].map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Values */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-[#1e3a5f] text-center mb-8">Why Choose GoClean</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="text-center p-6 border rounded-2xl hover:shadow-md transition-all">
                <v.icon className="text-[#2563eb] mx-auto mb-3" size={32} />
                <h3 className="font-bold text-[#1e3a5f] mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TESDA Competency */}
        <div className="mb-16">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">TESDA Competency Certifications</h2>
            <p className="text-gray-500 text-sm mb-6">
              GoClean Aircon has completed the competency requirements under the Philippine TVET Competency Assessment and Certification System in the following units:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {tesda.map((t) => (
                <div key={t.code} className="flex items-start gap-3 bg-white border rounded-xl p-3">
                  <span className="text-xs font-mono bg-[#1e3a5f] text-white px-2 py-1 rounded shrink-0">{t.code}</span>
                  <span className="text-sm text-gray-700">{t.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Daikin authorized badge */}
        <div className="text-center bg-gradient-to-br from-[#1e3a5f] to-[#0f2140] text-white rounded-2xl p-10">
          <div className="text-[#f0a500] text-4xl mb-3">★★★</div>
          <h2 className="text-2xl font-bold mb-2">Certified Daikin VRV Expert</h2>
          <p className="text-blue-200 max-w-xl mx-auto mb-6">
            GoClean Aircon Supplies and Services Co. is a bonafide <strong>Authorized Dealer and Installer</strong> of Daikin Airconditioning Philippines Inc. — your assurance of genuine Daikin products and factory-trained installation.
          </p>
          <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-6 py-3 text-sm font-medium text-blue-100">
            Authorized valid from July 2023 · Binan, Laguna
          </div>
        </div>
      </div>
    </div>
  );
}
