import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export default function IntegritetspolicyPage() {
  return (
    <PublicLayout title="Integritetspolicy">
      <p className="text-sm text-slate-400 mb-8">Senast uppdaterad: maj 2026</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">1. Personuppgiftsansvarig</h2>
      <p className="mb-4">DSE ENTERPRISE AB är personuppgiftsansvarig för behandlingen av dina personuppgifter i samband med användning av FleetOS.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">2. Vilka uppgifter samlar vi in?</h2>
      <p className="mb-4">Vi samlar in uppgifter som du själv lämnar vid registrering och användning av tjänsten, exempelvis namn, e-postadress, företagsnamn och organisationsnummer. Vi samlar även in teknisk data som IP-adress och användarbeteende i syfte att förbättra tjänsten.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">3. Hur använder vi uppgifterna?</h2>
      <p className="mb-4">Uppgifterna används för att tillhandahålla och förbättra tjänsten, hantera ditt konto, skicka relevanta meddelanden samt uppfylla rättsliga skyldigheter.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">4. Laglig grund</h2>
      <p className="mb-4">Behandlingen sker med stöd av avtalsuppfyllelse (när du är kund), berättigat intresse (förbättring av tjänsten) och rättslig förpliktelse (bokföring m.m.).</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">5. Dina rättigheter</h2>
      <p className="mb-4">Du har rätt att begära tillgång till, rättelse av och radering av dina personuppgifter. Du har även rätt att invända mot behandlingen och att begära dataportabilitet. Kontakta oss på <a href="mailto:david@fleetos.se,elias@fleetos.se" className="text-blue-600 hover:underline">david@fleetos.se & elias@fleetos.se</a> för att utöva dina rättigheter.</p>

      <h2 className="text-lg font-semibold text-slate-900 mt-8 mb-3">6. Kontakt</h2>
      <p className="mb-4">Frågor om vår behandling av personuppgifter skickas till <a href="mailto:david@fleetos.se,elias@fleetos.se" className="text-blue-600 hover:underline">david@fleetos.se & elias@fleetos.se</a>. Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY).</p>
    </PublicLayout>
  );
}
