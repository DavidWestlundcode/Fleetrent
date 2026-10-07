import type { Metadata } from 'next';

// Account confirmation / password reset — never useful in search results.
export const metadata: Metadata = {
  title: 'Konto',
  robots: { index: false, follow: false },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
