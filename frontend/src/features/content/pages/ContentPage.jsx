import { useAuth } from '../../auth/AuthContext';
import { dummyContent, dummyClasses } from '../../../data/dummyData';

const TYPE_ICON = { PDF: '📄', Video: '🎥', Slides: '📊', Notes: '📝' };

function ContentPage() {
  const { user } = useAuth();
  const isConductor = user?.role === 'conductor';

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">
            {isConductor ? 'Conductor Portal' : 'Student Portal'}
          </p>
          <h1 className="text-3xl font-bold text-ink">Content & Materials</h1>
          <p className="text-sub text-sm mt-1">
            {isConductor
              ? 'Upload and manage study materials for your classes.'
              : 'Access study materials shared by your conductors.'}
          </p>
        </div>
        {isConductor && (
          <button className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(13,148,136,0.4)] flex items-center gap-2">
            + Upload File
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Files', value: dummyContent.length,                              icon: '📁' },
          { label: 'PDFs',        value: dummyContent.filter(c => c.type === 'PDF').length,   icon: '📄' },
          { label: 'Videos',      value: dummyContent.filter(c => c.type === 'Video').length, icon: '🎥' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-rim rounded-2xl p-5 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(13,148,136,0.12)] hover:border-primary/30 hover:-translate-y-0.5 transition-all">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-extrabold text-ink">{s.value}</p>
              <p className="text-dim text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* File list */}
      <div className="bg-card border border-rim rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-rim flex items-center justify-between">
          <h2 className="font-bold text-ink">Materials</h2>
          <span className="text-xs text-dim">{dummyContent.length} files</span>
        </div>
        <div className="divide-y divide-rim">
          {dummyContent.map(item => {
            const cls = dummyClasses.find(c => c.id === item.classId);
            return (
              <div key={item.id} className="px-6 py-5 flex items-center justify-between hover:bg-gradient-to-r hover:from-section/60 hover:to-card transition-colors">
                <div className="flex items-center gap-4 min-w-0">
                  <span className="w-10 h-10 bg-section rounded-xl flex items-center justify-center text-xl border border-rim flex-shrink-0">
                    {TYPE_ICON[item.type] || '📄'}
                  </span>
                  <div className="min-w-0">
                    <p className="font-semibold text-ink text-sm truncate">{item.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold bg-section text-primary px-2 py-0.5 rounded-full border border-rim">{item.type}</span>
                      {cls && <span className="text-dim text-xs truncate">{cls.subject} · {item.uploadedBy}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 ml-4 flex-shrink-0">
                  <span className="text-xs text-dim hidden sm:block">{item.uploadedAt}</span>
                  <a
                    href={item.url}
                    className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white text-xs font-bold px-4 py-2 rounded-xl transition-all hover:shadow-[0_4px_14px_rgba(13,148,136,0.4)]"
                  >
                    Download
                  </a>
                  {isConductor && (
                    <button className="border border-err/30 text-err hover:bg-red-50 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ContentPage;
