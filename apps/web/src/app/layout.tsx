import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EventOS | Remo&Rent',
  description: 'Sistema Operativo para Eventos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-screen bg-slate-100 antialiased">{children}</body>
    </html>
  );
}
