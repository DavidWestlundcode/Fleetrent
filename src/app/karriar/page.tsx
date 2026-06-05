import PublicLayout from '@/components/layout/PublicLayout';

export const revalidate = 86400;

export default function KarriarPage() {
  return (
    <PublicLayout title="Karriär">
      <p className="text-lg text-slate-500 mb-8">
        Vi är ett litet och fokuserat team som bygger produkter vi är stolta över. Just nu har vi inga öppna tjänster, men vi är alltid intresserade av att höra från duktiga människor.
      </p>
      <p className="mb-6">
        Är du en produktutvecklare, designer eller säljare med passion för SaaS och industriprodukter? Hör av dig med en spontanansökan.
      </p>
      <div className="not-prose mt-10 p-6 bg-slate-50 rounded-xl border border-slate-200">
        <p className="text-sm font-semibold text-slate-900 mb-1">Spontanansökan</p>
        <p className="text-sm text-slate-500">
          Skicka ett mail till{' '}
          <a href="mailto:info@dseenterprise.se" className="text-blue-600 hover:underline">info@dseenterprise.se</a>
          {' '}med en kort beskrivning av dig själv och vad du vill göra.
        </p>
      </div>
    </PublicLayout>
  );
}
