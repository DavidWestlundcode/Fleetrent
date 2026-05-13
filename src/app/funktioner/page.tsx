import PublicLayout from '@/components/layout/PublicLayout';

export default function FunktionerPage() {
  return (
    <PublicLayout title="Funktioner">
      <p className="text-lg text-slate-500 mb-10">En komplett plattform för att hantera din maskinflotta — från registrering till fakturering.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose mb-12">
        {[
          { title: 'AI-igenkänning', desc: 'Fotografera typskylten och låt AI fylla i maskinkortet automatiskt.' },
          { title: 'AI-sökning', desc: 'Sök på naturligt språk — "diesel motviktstruck över 3 ton med lyfthöjd 5 m".' },
          { title: 'Orderhantering', desc: 'Skapa, följa upp och avsluta uthyrningsordrar med automatisk prissättning.' },
          { title: 'Prismallar', desc: 'Definiera prismallar per kategori och kapacitetsintervall som appliceras automatiskt.' },
          { title: 'Servicehistorik', desc: 'Registrera och följa upp service, reparationer och besiktningar.' },
          { title: 'Lönsamhetsanalys', desc: 'Se ROI, återbetalningstakt och intäktsutveckling per maskin.' },
          { title: 'QR-koder', desc: 'Varje maskin får en unik QR-kod för snabb åtkomst i fält.' },
          { title: 'Mobilanpassat', desc: 'Fungerar i webbläsaren på alla enheter — ingen app att installera.' },
        ].map(({ title, desc }) => (
          <div key={title} className="p-5 bg-slate-50 rounded-xl border border-slate-200">
            <h3 className="font-semibold text-slate-900 mb-1">{title}</h3>
            <p className="text-sm text-slate-500">{desc}</p>
          </div>
        ))}
      </div>
    </PublicLayout>
  );
}
