import { Logo } from '@/components/ui/Logo';

const FOOTER_COLUMNS = [
  { title: 'Företag', links: [
    { label: 'Om oss', href: '/om-oss' },
    { label: 'Karriär', href: '/karriar' },
    { label: 'Press', href: '/press' },
    { label: 'Senaste händelserna', href: '/handelser' },
    { label: 'Kontakt', href: '/kontakt' },
  ]},
  { title: 'Branscher', links: [
    { label: 'Byggmaskiner', href: '/uthyrning/byggmaskiner' },
    { label: 'Truckar', href: '/uthyrning/truckar' },
    { label: 'Liftar & skylift', href: '/uthyrning/liftar' },
  ]},
  { title: 'Juridik', links: [
    { label: 'Integritetspolicy', href: '/integritetspolicy' },
    { label: 'Villkor', href: '/villkor' },
    { label: 'GDPR', href: '/gdpr' },
    { label: 'Säkerhet', href: '/sakerhet' },
  ]},
];

export default function PublicFooter() {
  return (
    <footer className="bg-[#030810] border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Logo size={28} />
              <span className="text-[14px] font-bold text-white tracking-tight">FleetOS</span>
            </div>
            <p className="text-[13px] text-slate-500 leading-relaxed max-w-[220px]">
              Det moderna uthyrningssystemet för maskinföretag i Sverige.
            </p>
          </div>
          {FOOTER_COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <h4 className="text-[12px] font-semibold text-white uppercase tracking-wider mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-[13px] text-slate-500 hover:text-slate-300 transition-colors">{label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[12px] text-slate-600">
            © {new Date().getFullYear()} DSE ENTERPRISE AB. Alla rättigheter förbehållna.
          </p>
          <div className="flex items-center gap-2">
            <a
              href="https://www.instagram.com/fleetos.se/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
