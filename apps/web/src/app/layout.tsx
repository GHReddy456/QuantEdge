import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/Sidebar';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'QuantEdge | Quantitative Intelligence for Equity Markets',
  description:
    'Professional multi-market equity analytics, quantitative algorithmic research, and paper-trading terminal for traditional financial markets.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080c14] text-slate-100 flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto p-6 bg-[#080c14]">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
