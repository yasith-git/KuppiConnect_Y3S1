import { Link } from 'react-router-dom';
import { dummyAnnouncements } from '../../../data/dummyData';

function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-6 py-4 flex items-center gap-4">
        <Link to="/" className="text-indigo-200 hover:text-white text-sm">← Back to Home</Link>
        <h1 className="text-xl font-bold">Announcements</h1>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-10 space-y-4">
        {dummyAnnouncements.map((a) => (
          <div key={a.id} className={`bg-white rounded-xl p-6 shadow-sm border ${a.pinned ? 'border-indigo-300' : 'border-gray-100'}`}>
            <div className="flex items-center gap-2 mb-2">
              {a.pinned && <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">Pinned</span>}
              <span className="text-xs text-gray-400">{a.date}</span>
            </div>
            <h2 className="text-lg font-bold text-gray-800">{a.title}</h2>
            <p className="text-gray-600 text-sm mt-1">{a.body}</p>
          </div>
        ))}
      </main>
    </div>
  );
}

export default AnnouncementsPage;
