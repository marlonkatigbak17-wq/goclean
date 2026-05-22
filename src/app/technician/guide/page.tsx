export default function TechnicianGuidePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="bg-[#0f1f5c] px-6 py-5 text-center">
          <div className="text-2xl font-extrabold text-white tracking-wide">GoClean</div>
          <div className="text-blue-300 text-sm mt-1">Technician App Guide</div>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-4">

          <Step n={1} title="Open the app on your phone">
            Go to your browser and type:
            <div className="mt-1.5 bg-blue-50 rounded-xl px-4 py-2 text-center font-bold text-[#0f1f5c] text-base tracking-wide">
              gocleanair.co/technician
            </div>
          </Step>

          <Step n={2} title="Log in">
            Use the <strong>email</strong> and <strong>password</strong> given to you by the admin.
          </Step>

          <Step n={3} title="View your jobs">
            You will see all jobs assigned to you. Tap any job to open it.
          </Step>

          <Step n={4} title="Update job status">
            Inside the job, tap the status button to update:
            <div className="flex gap-2 mt-2 flex-wrap">
              {['Pending', 'Confirmed', 'Completed'].map((s, i) => (
                <span key={s} className={`px-3 py-1 rounded-full text-xs font-bold ${
                  i === 0 ? 'bg-yellow-100 text-yellow-700' :
                  i === 1 ? 'bg-blue-100 text-blue-700' :
                  'bg-green-100 text-green-700'
                }`}>{s}</span>
              ))}
            </div>
          </Step>

          <Step n={5} title="Log parts used">
            Type the part name and quantity, then tap <strong>Add</strong>. Tap <strong>Save Parts</strong> when done.
          </Step>

          <Step n={6} title="Take job photos">
            Scroll down and tap <strong>Take / Upload Photo</strong> to capture before and after photos using your camera.
          </Step>

        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 text-center border-t">
          <div className="text-xs text-gray-400">Questions? Contact your admin</div>
          <div className="font-bold text-[#0f1f5c] text-sm mt-0.5">0917 823 7205</div>
        </div>

      </div>

      <p className="fixed bottom-4 text-xs text-gray-400 text-center w-full">
        Screenshot this page and save as JPG to share with your technicians
      </p>
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <div className="w-7 h-7 rounded-full bg-[#0f1f5c] text-white text-xs font-extrabold flex items-center justify-center shrink-0 mt-0.5">
        {n}
      </div>
      <div className="text-sm text-gray-700">
        <div className="font-bold text-[#0f1f5c] mb-0.5">{title}</div>
        {children}
      </div>
    </div>
  );
}
