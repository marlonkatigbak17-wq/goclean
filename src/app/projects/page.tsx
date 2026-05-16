import { Building2, MapPin } from 'lucide-react';

const featuredProjects = [
  { title: 'Ayala Malls Solenad', type: 'Commercial HVAC', location: 'Nuvali, Sta. Rosa, Laguna', desc: 'Chilled water installation and maintenance for multiple tenant brands including Sony Center, Unica Hija, and Levis.' },
  { title: 'SM City Branches', type: 'Commercial HVAC', location: 'Sucat, Sta. Rosa, Dasmariñas', desc: 'Full AC installation and preventive maintenance for SM mall tenants across three SM City branches.' },
  { title: 'Nike Factory Store', type: 'Retail HVAC', location: 'Paseo de Sta. Rosa & SLEX Branch', desc: 'Installation and regular maintenance of HVAC systems for Nike Factory Store retail outlets.' },
  { title: 'Philippine National Police Academy', type: 'Government / Institutional', location: 'Laguna', desc: 'Supply and installation of air-conditioning units for the PNPA facility.' },
  { title: 'Carmelray Industrial Park', type: 'Industrial HVAC', location: 'Calamba, Laguna', desc: 'HVAC installation and maintenance for industrial locators within Carmelray 2 Industrial Park.' },
  { title: 'Kumon Learning Centers', type: 'Educational', location: 'Los Baños, Sta. Cruz, Calamba, Paseo de Sta. Rosa, San Lorenzo', desc: 'Window and split-type aircon installation and maintenance for 5 Kumon branches in Laguna.' },
  { title: 'Festival Mall Alabang', type: 'Mall / Retail', location: 'Alabang, Muntinlupa', desc: 'HVAC installation for multiple retail tenants at Festival Mall, including Bayo and other brands.' },
  { title: 'Alabang Town Center', type: 'Mall / Retail', location: 'Alabang, Muntinlupa', desc: 'Chilled water and split-type AC installation for Unica Hija and Viceversa outlets.' },
  { title: 'Evia Lifestyle Center', type: 'Commercial HVAC', location: 'Las Piñas', desc: 'HVAC installation and maintenance for lifestyle mall tenants at Evia Lifestyle Center.' },
  { title: 'Technofreeze Inc.', type: 'Cold Storage / Industrial', location: 'Laguna', desc: 'Specialized cold storage and commercial refrigeration system installation and service.' },
  { title: 'UCPB Savings Bank', type: 'Banking / Office', location: 'Paseo Branch', desc: 'Office HVAC installation and preventive maintenance for UCPB Savings Bank branch.' },
  { title: 'Asia-Pacific Eye Center', type: 'Medical Facility', location: 'Laguna', desc: 'Precision AC installation for a medical eye care facility requiring controlled temperature environments.' },
];

const allClients = [
  'Empyrean Construction Corp', 'ECOLAB', 'Office Ware House Inc.', 'Datablazers Inc. (DBI)', 'HKTP',
  'MNHL Engineering Services', 'Kumon (5 branches)', 'Bayo (4 branches)', 'Unica Hija (8 branches)',
  'Nike Factory Store', 'Levis', 'Viceversa', 'Maguire Company', 'Carmelray JTCI Corporation',
  'BCM Asia Inc.', 'FT Group Philippines', 'Next Century Bldg Systems', 'Soldercoat Narita Philippines',
  'Blue Room Spa', 'Mang Inasal', 'MDGI (Major Drilling)', 'Guillys Island Paseo', 'RaiRaiken',
  'Herbalife Office Calamba', 'Executive Wellspring Resort', 'Energia', 'Philippine National Police Academy',
  'OOCL Logistics Phils', 'Precepts Electro-Tech Construction', 'Maninvest General Services',
  'Cleanfuel Philippines', 'Sony Center Solenad', 'Mineski Franchise Corp', 'Chevrolet Sta. Rosa',
  'Hyundai Sta. Rosa', 'Gemalto Philippines', 'Powerflo Solutions (Asia)', 'Mr. Donut Lipa',
  'SUSALUM Corp', 'Emori Philippines', 'Print Town Group of Companies', 'Mirai Philippines Corp',
  'Hicaps Marketing Corp', 'Digital Paradise Inc', 'Suzuki Calamba', 'Daisees Bakeshop',
  'EQUINOX', 'Eternal Gardens Memorial Park', 'SAMGAS', 'READYMAN Inc.', 'Oasis Animal Clinic (4 branches)',
  'KULIM Hi Technology Philippines', 'ETON City', 'Exemplar Labor Service Cooperative',
  'Acestar Integrated Logistics', 'Herbalife Office Calamba', 'BBQ Chicken and Beer', 'DOHJIMA Corp',
  'SIIX Logistics Phils', 'RYONAN Electric Philippines Corp', 'MTEC Water Treatment Technologies',
  'PBCOM Paseo Branch', 'JSW Plastics Machinery Philippines', 'Evia Unica Hija', 'PLANEX T&M Inc.',
  'Motorcentral', 'Boracay Spa San Lorenzo', 'Asia-Pacific Eye Center', 'UCPB Savings',
  'The Mills Country Club', 'United Power & Resources Pte. Ltd. Phil.', 'Extraserve Wellness Corp',
  'OPPO Service Center Calamba', 'Pemara Labels Philippines', 'Technofreeze Inc.', 'Outlet Central',
  'Nagatsu-Sanpla Precision Mold Phil Inc',
];

export default function ProjectsPage() {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-3">Our Projects</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Trusted by malls, schools, hospitals, banks, factories, and retail chains across Laguna, Metro Manila, and beyond — since 2016.
          </p>
        </div>

        {/* Featured projects */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {featuredProjects.map((p) => (
            <div key={p.title} className="border rounded-2xl overflow-hidden hover:shadow-lg transition-all">
              <div className="bg-gradient-to-br from-[#1e3a5f] to-[#2563eb] h-36 flex items-center justify-center">
                <Building2 size={44} className="text-white/25" />
              </div>
              <div className="p-5">
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{p.type}</span>
                <h3 className="font-bold text-[#1e3a5f] mt-2 mb-1">{p.title}</h3>
                <p className="text-gray-500 text-sm mb-3">{p.desc}</p>
                <div className="flex items-center gap-1.5 text-xs text-gray-400">
                  <MapPin size={12} /> {p.location}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Full client list */}
        <div className="bg-gray-50 border rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-[#1e3a5f] mb-2">List of Clients</h2>
          <p className="text-gray-500 text-sm mb-6">GoClean Aircon has proudly served the following companies and organizations:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {allClients.map((c) => (
              <div key={c} className="text-xs text-gray-600 bg-white border rounded-lg px-3 py-2 hover:border-blue-300 transition-colors">
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
