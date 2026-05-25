import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Toast from '@/components/ui/Toast';
import ChatWidget from '@/components/ui/ChatWidget';
import FloatingChat from '@/components/ui/FloatingChat';
import TawkTo from '@/components/ui/TawkTo';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  verification: {
    google: 'ACpNqgTgtpsqE2XFH--SPCwG3_pmT4yjZWHhjTWQhJY',
  },
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
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'GoClean',
    startupImage: [
      { url: '/splash/apple-splash-2048x2732.png', media: '(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash/apple-splash-1668x2388.png', media: '(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash/apple-splash-1536x2048.png', media: '(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash/apple-splash-1125x2436.png', media: '(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/splash/apple-splash-1242x2688.png', media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)' },
      { url: '/splash/apple-splash-828x1792.png',  media: '(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)' },
      { url: '/splash/apple-splash-750x1334.png',  media: '(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)' },
    ],
  },
  icons: {
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-WN0ZRQXWNY" strategy="afterInteractive" />
        <Script id="google-analytics" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-WN0ZRQXWNY');
        `}</Script>
        <Script id="facebook-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1964017237599227');
          fbq('track', 'PageView');
        `}</Script>
      </head>
      <body className={`${inter.className} min-h-full flex flex-col bg-white text-[#1a1a2e] antialiased`}>
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <Toast />
        <FloatingChat />
        <ChatWidget />
        <TawkTo />
      </body>
    </html>
  );
}
