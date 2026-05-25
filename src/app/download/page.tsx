'use client';

import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Apple, Download, CheckCircle } from 'lucide-react';

const ANDROID_URL = 'https://gocleanair.co/goclean.apk';
const IOS_URL = 'https://gocleanair.co';

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-[#1a5ff0] text-sm font-semibold px-4 py-1.5 rounded-full mb-4">
            <Smartphone size={16} /> Available on Android & iOS
          </div>
          <h1 className="text-4xl font-extrabold text-[#1e3a5f] mb-3">Download the GoClean App</h1>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            Book services, shop aircon units, and track your orders — right from your phone.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* Android */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center">
            <div className="bg-green-100 rounded-full p-4 mb-4">
              <Smartphone size={36} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-1">Android</h2>
            <p className="text-gray-500 text-sm mb-6">Scan the QR code or tap the button to download the APK and install it on your Android phone.</p>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm mb-6">
              <QRCodeSVG
                value={ANDROID_URL}
                size={200}
                bgColor="#ffffff"
                fgColor="#1e3a5f"
                level="M"
                imageSettings={{
                  src: '/icon-192.png',
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <p className="text-xs text-gray-400 mt-2">Scan with your Android camera</p>
            </div>

            <a
              href="/goclean.apk"
              download
              className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              <Download size={18} /> Download APK
            </a>

            <div className="mt-6 text-left space-y-2 w-full">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">How to install</p>
              {[
                'Tap "Download APK" or scan the QR code',
                'Open the downloaded file on your phone',
                'Allow "Install from unknown sources" if prompted',
                'Tap Install — done!',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
                  {step}
                </div>
              ))}
            </div>
          </div>

          {/* iOS */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8 flex flex-col items-center text-center">
            <div className="bg-blue-100 rounded-full p-4 mb-4">
              <Apple size={36} className="text-[#1a5ff0]" />
            </div>
            <h2 className="text-2xl font-bold text-[#1e3a5f] mb-1">iPhone / iPad</h2>
            <p className="text-gray-500 text-sm mb-6">Scan the QR code with your iPhone camera to open the site, then add it to your home screen.</p>

            {/* QR Code */}
            <div className="bg-white p-4 rounded-xl border-2 border-gray-100 shadow-sm mb-6">
              <QRCodeSVG
                value={IOS_URL}
                size={200}
                bgColor="#ffffff"
                fgColor="#1e3a5f"
                level="M"
                imageSettings={{
                  src: '/icon-192.png',
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <p className="text-xs text-gray-400 mt-2">Scan with your iPhone camera</p>
            </div>

            <a
              href={IOS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#1a5ff0] hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
            >
              <Apple size={18} /> Open in Safari
            </a>

            <div className="mt-6 text-left space-y-2 w-full">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">How to install</p>
              {[
                'Open gocleanair.co in Safari (not Chrome)',
                'Tap the Share button at the bottom',
                'Scroll down and tap "Add to Home Screen"',
                'Tap Add — the GoClean icon appears on your home screen!',
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle size={16} className="text-[#1a5ff0] mt-0.5 shrink-0" />
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-14 bg-[#1a5ff0] rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-2">What you can do in the app</h3>
          <p className="text-blue-200 mb-8">Everything from the website — optimized for mobile</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: '🛒', label: 'Shop Aircon Units' },
              { icon: '🔧', label: 'Book a Service' },
              { icon: '📦', label: 'Track Orders' },
              { icon: '💬', label: 'Chat with Christine AI' },
            ].map((f) => (
              <div key={f.label} className="bg-white/10 rounded-xl p-4">
                <div className="text-3xl mb-2">{f.icon}</div>
                <p className="text-sm font-semibold">{f.label}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
