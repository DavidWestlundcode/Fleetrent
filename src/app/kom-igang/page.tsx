import type { Metadata } from 'next';
import KomIgangForm from './KomIgangForm';

export const metadata: Metadata = {
  title: 'Kom igång med FleetOS – testa maskinuthyrningssystemet gratis',
  description: 'Boka en genomgång eller kom igång direkt med FleetOS, affärssystemet för maskinuthyrning. Fyll i formuläret så återkommer vi inom 24 timmar.',
  alternates: { canonical: 'https://fleetos.se/kom-igang' },
  openGraph: {
    title: 'Kom igång med FleetOS – testa maskinuthyrningssystemet gratis',
    description: 'Boka en genomgång eller kom igång direkt med FleetOS, affärssystemet för maskinuthyrning.',
    url: 'https://fleetos.se/kom-igang',
  },
};

export default function KomIgangPage() {
  return <KomIgangForm />;
}
