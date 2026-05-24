import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — GoClean Aircon',
  description: 'Privacy Policy for GoClean Aircon Supplies and Services Co.',
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-extrabold text-[#1e3a5f] mb-2">Privacy Policy</h1>
      <p className="text-sm text-gray-400 mb-10">Last updated: May 2026</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">1. Information We Collect</h2>
          <p>When you use our website, book a service, or contact us through chat or Messenger, we may collect:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Full name</li>
            <li>Mobile number and email address</li>
            <li>Service address and location</li>
            <li>Messages and inquiries sent to us</li>
            <li>Booking and transaction details</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>Process and confirm your service bookings</li>
            <li>Contact you to schedule and confirm appointments</li>
            <li>Respond to your inquiries via chat, Messenger, or phone</li>
            <li>Send service reminders and follow-ups via SMS</li>
            <li>Improve our services and customer experience</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">3. Data Sharing</h2>
          <p>We do <strong>not</strong> sell, rent, or share your personal information with third parties for marketing purposes. Your data is only used internally to provide and improve our services.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">4. Facebook Messenger</h2>
          <p>If you contact us via Facebook Messenger, your messages are handled by our AI assistant (Christine) powered by Anthropic Claude. Conversations may be stored temporarily to provide context for follow-up responses. We do not share Messenger conversation data with third parties.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">5. Data Security</h2>
          <p>We take reasonable steps to protect your personal information. Our website uses HTTPS encryption and our data is stored securely on trusted cloud infrastructure.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">6. Your Rights</h2>
          <p>You may request to access, update, or delete your personal data at any time by contacting us directly.</p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[#1e3a5f] mb-3">7. Contact Us</h2>
          <p>If you have questions about this Privacy Policy, please contact us:</p>
          <ul className="list-none mt-2 space-y-1">
            <li>📧 <strong>Email:</strong> gocleanair@gmail.com</li>
            <li>📞 <strong>Phone:</strong> 0917 117 8606</li>
            <li>📍 <strong>Address:</strong> Seaoil Compound, Gen. Malvar St., Tubigan, Binan, Laguna</li>
          </ul>
        </section>

      </div>
    </div>
  );
}
