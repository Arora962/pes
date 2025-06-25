import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [darkMode, setDarkMode] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (reducedMotion) {
      document.documentElement.classList.add('motion-reduce');
    } else {
      document.documentElement.classList.remove('motion-reduce');
    }
  }, [reducedMotion]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <div className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors duration-500 ${darkMode ? 'dark bg-slate-900' : 'bg-gradient-to-br from-teal-100 to-blue-200'}`}>
      {/* Animated Background Blobs */}
      <div className="absolute w-80 h-80 bg-teal-300 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-[blob_7s_infinite] -top-20 -left-20 dark:bg-teal-800"></div>
      <div className="absolute w-80 h-80 bg-blue-300 opacity-30 rounded-full mix-blend-multiply filter blur-2xl animate-[blob_7s_infinite_2s] -bottom-20 -right-10 dark:bg-blue-800"></div>
      {/* Main Card */}
      <div className="relative z-10 bg-white/70 dark:bg-gray-900/70 shadow-2xl rounded-2xl p-10 w-full max-w-xl text-center backdrop-blur-lg">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Peer Evaluation System</h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">Welcome! Please login or register to continue.</p>

        <div className="grid grid-cols-3 gap-4 mb-6 text-left">
          <div className="bg-indigo-50 dark:bg-indigo-900 p-4 rounded-xl shadow-sm">
            <p className="font-semibold text-indigo-800 dark:text-indigo-200 text-sm">Track Progress</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-300">Monitor your evaluation status and feedback in real time.</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900 p-4 rounded-xl shadow-sm">
            <p className="font-semibold text-green-800 dark:text-green-200 text-sm">Easy Evaluation</p>
            <p className="text-xs text-green-600 dark:text-green-300">Submit and review peer evaluations with a simple interface.</p>
          </div>
          <div className="bg-pink-50 dark:bg-pink-900 p-4 rounded-xl shadow-sm">
            <p className="font-semibold text-pink-800 dark:text-pink-200 text-sm">Secure & Private</p>
            <p className="text-xs text-pink-600 dark:text-pink-300">Your data is encrypted and privacy is our top priority.</p>
          </div>
        </div>

        <div className="flex justify-center gap-6">
          <Link to="/login" className="flex flex-col items-center">
            <div className="h-14 w-14 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition">
              🔐
            </div>
            <span className="mt-2 text-gray-700 dark:text-gray-300">Login</span>
          </Link>
          <Link to="/register" className="flex flex-col items-center">
            <div className="h-14 w-14 bg-green-500 rounded-full flex items-center justify-center text-white text-xl shadow-lg hover:scale-110 transition">
              📝
            </div>
            <span className="mt-2 text-gray-700 dark:text-gray-300">Register</span>
          </Link>
        </div>
      </div>

      {/* Settings Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="h-12 w-12 bg-gray-800 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.397-.164-.853-.142-1.203.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.142-.854-.108-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.806.272 1.203.107.397-.165.71-.505.781-.929l.149-.894zM15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>

        {showSettings && (
          <div className="mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl shadow-xl p-4 text-sm space-y-4 w-60">
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-800 dark:text-white">Dark Mode</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 rounded-full peer dark:bg-gray-600 peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-gray-800 dark:text-white">Reduced Motion</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={reducedMotion} onChange={() => setReducedMotion(!reducedMotion)} className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 dark:peer-focus:ring-indigo-600 rounded-full peer dark:bg-gray-600 peer-checked:bg-green-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>
          </div>
        )}

        {/* Blob animation keyframes */}
        <style>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
}
