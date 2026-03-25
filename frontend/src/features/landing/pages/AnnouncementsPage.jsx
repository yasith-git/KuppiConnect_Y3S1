import { Link } from 'react-router-dom';
import { dummyAnnouncements } from '../../../data/dummyData';

function AnnouncementsPage() {
  return (
    <div className="min-h-screen bg-page">

      {/* Header */}
      <header className="bg-gradient-to-r from-primary-dark to-secondary shadow-md">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center gap-3">
          <Link to="/" className="text-white/70 hover:text-white text-sm font-medium transition">
            ← Home
          </Link>
          <span className="text-white/30">/</span>
          <h1 className="text-white font-semibold text-sm">Announcements</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Updates</p>
          <h2 className="text-3xl font-bold text-ink">Announcements</h2>
          <p className="text-sub text-sm mt-1">Stay up to date with the latest news from KuppiConnect.</p>
        </div>

        <div className="space-y-4">
          {dummyAnnouncements.map((a) => (
            <div
              key={a.id}
              className={`bg-card rounded-2xl p-6 border transition-all ${
                a.pinned
                  ? 'border-primary/40 shadow-[0_4px_20px_rgba(13,148,136,0.12)]'
                  : 'border-rim hover:shadow-[0_4px_20px_rgba(13,148,136,0.10)] hover:border-primary/25 hover:-translate-y-0.5'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                {a.pinned && (
                  <span className="bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Pinned
                  </span>
                )}
                <span className="text-xs text-dim">{a.date}</span>
              </div>
              <h3 className="text-base font-bold text-ink mb-1">{a.title}</h3>
              <p className="text-sub text-sm leading-relaxed">{a.body}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default AnnouncementsPage;
