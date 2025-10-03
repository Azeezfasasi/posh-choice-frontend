import { Clock } from 'lucide-react';

function ComingSoon() {
  return (
    <>
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-lg text-center space-y-6 border border-dashed border-blue-500">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-full animate-pulse">
            <Clock size={40} />
          </div>
        </div>
        <h1 className="text-3xl font-semibold text-gray-800">Coming Soon</h1>
        <p className="text-gray-600">
          We're working hard to bring this feature to life. Stay tuned — exciting updates are on the way!
        </p>
        <button className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          Notify Me
        </button>
      </div>
    </div>
    </>
  )
}

export default ComingSoon