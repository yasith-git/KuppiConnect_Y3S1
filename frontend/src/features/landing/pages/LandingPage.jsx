import { Link } from 'react-router-dom';
import { dummyAnnouncements, dummyClasses } from '../../../data/dummyData';

function LandingPage() {
  const pinned = dummyAnnouncements.filter((a) => a.pinned);
  const featured = dummyClasses.slice(0, 3);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="bg-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
          <span className="text-2xl font-bold">KuppiConnect</span>
          <nav className="flex gap-4 text-sm font-medium">
            <Link to="/announcements" className="hover:text-indigo-200 transition">Announcements</Link>
            <Link to="/login" className="hover:text-indigo-200 transition">Login</Link>
            <Link to="/register" className="bg-white text-indigo-700 px-4 py-1.5 rounded-full font-semibold hover:bg-indigo-100 transition">
              Get Started
            </Link>
          </nav>
        </div>
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl font-extrabold mb-4 leading-tight">
            Connect. Learn. Succeed.
          </h1>
          <p className="text-indigo-200 text-lg max-w-xl mx-auto mb-8">
            KuppiConnect bridges students and conductors for seamless kuppi class management and learning.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-indigo-700 px-6 py-3 rounded-full font-bold hover:bg-indigo-100 transition"
            >
              Join as Student
            </Link>
            <Link
              to="/register"
              className="border border-white text-white px-6 py-3 rounded-full font-bold hover:bg-indigo-600 transition"
            >
              Become a Conductor
            </Link>
          </div>
        </div>
      </header>

      {/* Pinned Announcements */}
      {pinned.length > 0 && (
        <section className="bg-indigo-50 border-b border-indigo-100 py-4">
          <div className="max-w-7xl mx-auto px-6 flex items-center gap-3 flex-wrap">
            <span className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">NOTICE</span>
            {pinned.map((a) => (
              <span key={a.id} className="text-sm text-indigo-800 font-medium">{a.title}: {a.body}</span>
            ))}
          </div>
        </section>
      )}

      {/* Featured Classes */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Featured Classes</h2>
        <p className="text-gray-500 mb-8">Explore top kuppi sessions available this week.</p>
        <div className="grid md:grid-cols-3 gap-6">
          {featured.map((cls) => (
            <div key={cls.id} className="border rounded-xl p-6 hover:shadow-md transition">
              <span className="text-xs font-semibold bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                {cls.subject}
              </span>
              <h3 className="text-lg font-bold text-gray-800 mt-3 mb-1">{cls.title}</h3>
              <p className="text-sm text-gray-500 mb-1">{cls.conductor}</p>
              <p className="text-sm text-gray-500">{cls.date} · {cls.time}</p>
              <p className="text-sm font-semibold text-indigo-600 mt-2">Rs. {cls.fee}</p>
              <p className="text-xs text-gray-400 mt-1">{cls.enrolled}/{cls.seats} enrolled</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/login" className="bg-indigo-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-indigo-700 transition">
            View All Classes
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
        © 2026 KuppiConnect. Built for students, by students.
      </footer>
    </div>
  );
}

export default LandingPage;
