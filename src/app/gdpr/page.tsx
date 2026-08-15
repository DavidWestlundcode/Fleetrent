import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

const rights = [
  { title: 'Rätt till tillgång (art. 15)', desc: 'Du kan begära ut en kopia av de personuppgifter vi behandlar om dig, inklusive information om ändamål, kategorier och mottagare.' },
  { title: 'Rätt till rättelse (art. 16)', desc: 'Du kan begära att felaktiga eller ofullständiga uppgifter om dig korrigeras utan onödigt dröjsmål.' },
  { title: 'Rätt till radering (art. 17)', desc: 'Du kan begära att vi raderar dina personuppgifter när de inte längre är nödvändiga, om du återkallar samtycke eller invänder mot behandlingen.' },
  { title: 'Rätt till begränsning (art. 18)', desc: 'Du kan begära att vi begränsar behandlingen av dina uppgifter, exempelvis medan en invändning prövas.' },
  { title: 'Rätt till dataportabilitet (art. 20)', desc: 'Du kan begära att dina uppgifter lämnas ut i ett strukturerat, maskinläsbart format för att överföras till en annan tjänst.' },
  { title: 'Rätt att invända (art. 21)', desc: 'Du kan invända mot behandling som baseras på berättigat intresse. Vi upphör med behandlingen om vi inte kan visa tvingande berättigade skäl.' },
];

const processors = [
  { name: 'Supabase Inc.', country: 'USA (EU-region)', purpose: 'Databas och autentisering', safeguard: 'Standardavtalsklausuler (SCC)' },
  { name: 'Vercel Inc.', country: 'USA', purpose: 'Hosting och driftsättning', safeguard: 'Standardavtalsklausuler (SCC)' },
  { name: 'OpenAI LLC', country: 'USA', purpose: 'AI-funktioner (maskinsökning)', safeguard: 'Standardavtalsklausuler (SCC)' },
  { name: 'Fortnox AB', country: 'Sverige', purpose: 'Bokföringsintegration (om aktiverad)', safeguard: 'Inom EU/EES' },
  { name: 'Zigned', country: 'Sverige', purpose: 'E-signering av avtal (om aktiverad)', safeguard: 'Inom EU/EES' },
];

const legalBases = [
  { purpose: 'Tillhandahålla och administrera tjänsten', basis: 'Avtal', article: 'Art. 6(1)(b)' },
  { purpose: 'Fakturering och betalningshantering', basis: 'Avtal + Rättslig förpliktelse', article: 'Art. 6(1)(b)(c)' },
  { purpose: 'Bokföring och redovisning (7 år)', basis: 'Rättslig förpliktelse', article: 'Art. 6(1)(c)' },
  { purpose: 'Kundkommunikation och support', basis: 'Avtal', article: 'Art. 6(1)(b)' },
  { purpose: 'Förbättra och felsöka tjänsten', basis: 'Berättigat intresse', article: 'Art. 6(1)(f)' },
  { purpose: 'Säkerhetsloggning och missbruksskydd', basis: 'Berättigat intresse', article: 'Art. 6(1)(f)' },
];

export default function GdprPage() {
  return (
    <PublicLayout title="GDPR & Dataskydd">
      <p className="text-sm text-slate-400 mb-2">Senast uppdaterad: juni 2026</p>
      <p className="text-lg text-slate-500 mb-10">
        FleetOS behandlar personuppgifter i enlighet med EU:s dataskyddsförordning (GDPR, 2016/679). Den här sidan beskriver vad vi samlar in, varför, hur länge vi sparar det och vilka rättigheter du har.
      </p>

      {/* 1. Personuppgiftsansvarig */}
      <h2>1. Personuppgiftsansvarig</h2>
      <div className="not-prose mb-8 p-5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-600 space-y-1">
        <p className="font-semibold text-slate-900">DSE ENTERPRISE AB</p>
        <p>Org.nr: 559510-0248</p>
        <p>Sverige</p>
        <p className="pt-2">
          Dataskyddsfrågor:{' '}
          <a href="mailto:david@fleetos.se,elias@fleetos.se" className="text-blue-600 hover:underline">david@fleetos.se & elias@fleetos.se</a>
        </p>
      </div>

      {/* 2. Vilka uppgifter */}
      <h2>2. Vilka personuppgifter behandlar vi?</h2>
      <p className="mb-4">Vi behandlar personuppgifter i tre huvudkategorier:</p>
      <div className="not-prose mb-8 space-y-3">
        {[
          {
            title: 'Kontouppgifter',
            items: ['Namn', 'E-postadress', 'Företagsnamn', 'Roll i organisationen'],
          },
          {
            title: 'Kunddata (din organisations kunder)',
            items: ['Namn och kontaktuppgifter', 'Företagsnamn och organisationsnummer', 'Adress och faktureringsinformation'],
          },
          {
            title: 'Teknisk data',
            items: ['IP-adress (vid inloggning och API-anrop)', 'Webbläsartyp och enhet', 'Tidsstämplar för händelser och ändringar'],
          },
        ].map(({ title, items }) => (
          <div key={title} className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-900 mb-2">{title}</p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item} className="text-sm text-slate-600 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 3. Ändamål och laglig grund */}
      <h2>3. Ändamål och laglig grund</h2>
      <p className="mb-4">Vi behandlar personuppgifter enbart för specificerade ändamål med stöd av laglig grund enligt GDPR artikel 6.</p>
      <div className="not-prose mb-8 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Ändamål</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Laglig grund</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">Artikel</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {legalBases.map(({ purpose, basis, article }) => (
              <tr key={purpose} className="bg-white">
                <td className="px-4 py-3 text-slate-700">{purpose}</td>
                <td className="px-4 py-3 text-slate-600">{basis}</td>
                <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{article}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Lagringstider */}
      <h2>4. Lagringstider</h2>
      <p className="mb-4">Vi sparar personuppgifter så länge det är nödvändigt för respektive ändamål.</p>
      <div className="not-prose mb-8 space-y-2">
        {[
          { category: 'Kontouppgifter', retention: 'Raderas inom 30 dagar efter att kontot avslutats' },
          { category: 'Order- och kunddata', retention: '7 år (bokföringslagens krav)' },
          { category: 'Säkerhetsloggar', retention: '90 dagar' },
          { category: 'Leads via kontaktformulär', retention: '2 år eller tills du begär radering' },
        ].map(({ category, retention }) => (
          <div key={category} className="flex items-start justify-between gap-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-sm font-semibold text-slate-900">{category}</p>
            <p className="text-sm text-slate-500 text-right">{retention}</p>
          </div>
        ))}
      </div>

      {/* 5. Underbiträden */}
      <h2>5. Underbiträden och tredjeparter</h2>
      <p className="mb-4">
        Vi anlitar ett antal underbiträden för att tillhandahålla tjänsten. Samtliga är bundna av personuppgiftsbiträdesavtal och får endast behandla uppgifter enligt våra instruktioner.
      </p>
      <div className="not-prose mb-8 overflow-hidden rounded-xl border border-slate-200">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Leverantör</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Land</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Ändamål</th>
              <th className="text-left px-4 py-3 font-semibold text-slate-900">Skyddsåtgärd</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {processors.map(({ name, country, purpose, safeguard }) => (
              <tr key={name} className="bg-white">
                <td className="px-4 py-3 font-medium text-slate-800">{name}</td>
                <td className="px-4 py-3 text-slate-600">{country}</td>
                <td className="px-4 py-3 text-slate-600">{purpose}</td>
                <td className="px-4 py-3 text-slate-500">{safeguard}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 6. Internationella överföringar */}
      <h2>6. Internationella överföringar</h2>
      <p className="mb-8">
        Vissa underbiträden (Supabase, Vercel, OpenAI) är etablerade i USA. Överföringar till dessa sker med stöd av EU-kommissionens standardavtalsklausuler (SCC) enligt GDPR artikel 46(2)(c), vilket säkerställer en adekvat skyddsnivå för dina uppgifter.
      </p>

      {/* 7. Datasäkerhet */}
      <h2>7. Datasäkerhet</h2>
      <p className="mb-4">Vi vidtar tekniska och organisatoriska åtgärder för att skydda personuppgifter mot obehörig åtkomst, förlust eller ändring:</p>
      <div className="not-prose mb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {[
          { title: 'Kryptering i transit', desc: 'All kommunikation sker över HTTPS/TLS.' },
          { title: 'Kryptering i vila', desc: 'Data krypteras i databasen av underbiträdet (Supabase/AES-256).' },
          { title: 'Åtkomstkontroll', desc: 'Row Level Security (RLS) säkerställer att varje organisation enbart ser sin egen data.' },
          { title: 'Hashat autentisering', desc: 'Lösenord lagras aldrig i klartext.' },
        ].map(({ title, desc }) => (
          <div key={title} className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
            <p className="text-sm font-semibold text-blue-900 mb-1">{title}</p>
            <p className="text-sm text-blue-700">{desc}</p>
          </div>
        ))}
      </div>

      {/* 8. Dina rättigheter */}
      <h2>8. Dina rättigheter</h2>
      <p className="mb-4">Som registrerad har du följande rättigheter enligt GDPR. Vi svarar på alla begäran inom 30 dagar.</p>
      <div className="not-prose space-y-2 mb-8">
        {rights.map(({ title, desc }) => (
          <div key={title} className="flex gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-slate-900">{title}</p>
              <p className="text-sm text-slate-500">{desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 9. Utöva rättigheter + klagomål */}
      <h2>9. Utöva dina rättigheter och lämna klagomål</h2>
      <div className="not-prose mb-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-sm font-semibold text-slate-900 mb-2">Kontakta oss</p>
          <p className="text-sm text-slate-500 mb-3">Skicka din begäran till vår dataskyddskontakt. Vi svarar inom 30 dagar.</p>
          <a href="mailto:david@fleetos.se,elias@fleetos.se" className="text-sm text-blue-600 hover:underline font-medium">david@fleetos.se & elias@fleetos.se</a>
        </div>
        <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
          <p className="text-sm font-semibold text-slate-900 mb-2">Tillsynsmyndighet</p>
          <p className="text-sm text-slate-500 mb-3">Om du anser att vi hanterar dina uppgifter felaktigt kan du lämna klagomål till IMY.</p>
          <a href="https://www.imy.se" target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline font-medium">imy.se →</a>
        </div>
      </div>

      {/* 10. Ändringar */}
      <h2>10. Ändringar i denna information</h2>
      <p className="mb-8">
        Vi kan komma att uppdatera denna sida när tjänsten förändras eller lagkrav ändras. Väsentliga förändringar meddelas via e-post till registrerade användare. Datumet längst upp på sidan anger när informationen senast reviderades.
      </p>
    </PublicLayout>
  );
}
