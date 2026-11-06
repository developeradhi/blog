import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nexus Portal | Restricted Access',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function NexusLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
