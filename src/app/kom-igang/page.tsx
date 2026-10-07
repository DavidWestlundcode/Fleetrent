import type { Metadata } from 'next';
import { pageMetadata } from '@/lib/seo';
import KomIgangForm from './KomIgangForm';

export const metadata: Metadata = pageMetadata({
  path: '/kom-igang',
  title: 'Boka demo av uthyrningssystemet',
  description: 'Boka en kostnadsfri genomgång av FleetOS, uthyrningssystemet för maskiner, truckar och liftar. Fyll i formuläret så återkommer vi inom 24 timmar.',
});

export default function KomIgangPage() {
  return <KomIgangForm />;
}
