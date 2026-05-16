import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import FloatingChat from '@/components/ui/FloatingChat';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Goclean Aircon Supplies and Service Co.',
  description:
    'Your trusted HVAC partner in the Philippines. Quality aircon units, expert installation, cleaning, repair, and preventive maintenance.',
  keywords: [
    'aircon supplier Philippines',
    'HVAC contractor',
    'aircon installation',
    'split type aircon',
    'aircon cleaning services',
    'HVAC supplies',
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-full flex flex-col bg-white text-[#1a1a2e] antialiased`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toast />
        <FloatingChat />
      </body>
    </html>
  );
}
