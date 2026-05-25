import { CheckCircle, Smartphone, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function TechProSuccessPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
        <div className="bg-green-100 rounded-full p-4 w-fit mx-auto mb-4">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-[#1a1a2e] mb-2">Payment Successful!</h1>
        <p className="text-gray-500 mb-6">Your TechPro Aircon Premium license key has been sent to your mobile number via SMS.</p>

        <div className="bg-blue-50 rounded-xl p-4 text-left space-y-3 mb-6">
          <div className="flex items-start gap-3">
            <MessageSquare size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Check your SMS</p>
              <p className="text-xs text-blue-600">Your license key is in the SMS we just sent you. Format: TECH-XXXX-XXXX-XXXX</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Smartphone size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-blue-800">Open TechPro Aircon app</p>
              <p className="text-xs text-blue-600">Tap the lock icon → Enter your key → Tap Activate</p>
            </div>
          </div>
        </div>

        <Link
          href="/techpro"
          className="text-sm text-blue-600 hover:underline"
        >
          ← Back to TechPro
        </Link>
      </div>
    </div>
  );
}
