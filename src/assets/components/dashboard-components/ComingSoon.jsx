import { Clock } from 'lucide-react';

function ComingSoon() {
  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-cream px-4">
      <div className="bg-white ring-1 ring-line rounded-2xl p-8 max-w-lg text-center space-y-6 border border-dashed border-plum-600">
        <div className="flex justify-center">
          <div className="p-4 bg-plum-50 text-plum-700 rounded-full animate-pulse">
            <Clock size={40} />
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-ink">Coming Soon</h1>
        <p className="text-ink-soft">
          We're working hard to bring this feature to life. Stay tuned — exciting updates are on the way!
        </p>
        <button className="mt-4 px-6 py-2 bg-plum-600 text-white rounded-lg hover:bg-plum-700 transition">
          Notify Me
        </button>
      </div>
    </div>
    </>
  )
}

export default ComingSoon