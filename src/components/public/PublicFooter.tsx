import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

const FOOTER_COLUMNS = [
  { title: 'Produkt', links: [
    { label: 'Funktioner', href: '/funktioner' },
    { label: 'Priser', href: '/priser' },
    { label: 'Fortnox-integration', href: '/integrationer/fortnox' },
    { label: 'Serviceprotokoll-integration', href: '/integrationer/serviceprotokoll' },
    { label: 'Kundcase', href: '/kunder' },
  ]},
  { title: 'Branscher', links: [
    { label: 'Truckar', href: '/uthyrning/truckar' },
    { label: 'Byggmaskiner', href: '/uthyrning/byggmaskiner' },
    { label: 'Liftar och skylift', href: '/uthyrning/liftar' },
  ]},
  { title: 'Företag', links: [
    { label: 'Om oss', href: '/om-oss' },
    { label: 'Kontakt', href: '/kontakt' },
    { label: 'Senaste händelserna', href: '/handelser' },
    { label: 'Press', href: '/press' },
    { label: 'Karriär', href: '/karriar' },
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
    <footer className="bg-slate-50 border-t border-slate-200/70">
      <div className="max-w-6xl mx-auto px-6 pt-16 pb-10">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-x-8 gap-y-10 mb-14">
          <div className="col-span-2">
            <Link href="/" className="inline-flex items-center gap-2 mb-4">
              <Logo size={24} decorative />
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">FleetOS</span>
            </Link>
            <p className="text-[13.5px] text-slate-500 leading-relaxed max-w-[260px]">
              Uthyrningssystem för företag som hyr ut maskiner, truckar och liftar.
            </p>
            <Link
              href="/kom-igang"
              className="inline-flex mt-6 px-4 py-2 rounded-xl bg-white ring-1 ring-slate-900/10 text-[13px] font-semibold text-slate-900 hover:ring-slate-900/20 transition-[box-shadow,transform] duration-150 ease-out-strong active:scale-[0.97]"
            >
              Boka demo
            </Link>
          </div>
          {FOOTER_COLUMNS.map(({ title, links }) => (
            <div key={title}>
              <p className="text-[13px] font-semibold text-slate-900 mb-4">{title}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-[13.5px] text-slate-500 hover:text-slate-900 transition-colors">{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-6 border-t border-slate-200/70 flex flex-col md:flex-row md:items-center justify-between gap-3 text-[12.5px] text-slate-500">
          <p>
            © {new Date().getFullYear()} DSE ENTERPRISE AB, org.nr 559510-0248.{' '}
            <a href="mailto:david@fleetos.se" className="hover:text-slate-900 transition-colors">david@fleetos.se</a>
          </p>
          <a
            href="https://www.instagram.com/fleetos.se/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-900 transition-colors"
          >
            Instagram
          </a>
        </div>
      </div>
    </footer>
  );
}
