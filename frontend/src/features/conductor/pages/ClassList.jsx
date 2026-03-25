import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useClasses } from '../../../contexts/ClassesContext';
import { dummyEnrollments } from '../../../data/dummyData';

const SUBJECT_COLORS = {
  Mathematics:     'bg-blue-50   text-blue-700  border-blue-200',
  Physics:         'bg-violet-50 text-violet-700 border-violet-200',
  Chemistry:       'bg-green-50  text-green-700  border-green-200',
  Biology:         'bg-orange-50 text-orange-700 border-orange-200',
  'Computer Science': 'bg-indigo-50 text-indigo-700 border-indigo-200',
  English:         'bg-pink-50   text-pink-700   border-pink-200',
  Economics:       'bg-teal-50   text-teal-700   border-teal-200',
};

function subjectCls(subject) {
  return SUBJECT_COLORS[subject] ?? 'bg-sky-50 text-primary border-sky-200';
}

export default function ClassList() {
  const { user } = useAuth();
  const { classes, deleteClass } = useClasses();
  const navigate = useNavigate();

  const [confirmId, setConfirmId] = useState(null);
  const [deleted, setDeleted] = useState(null);

  const myClasses = classes.filter(c => c.conductorId === user?.id);

  const totalEnrolled = myClasses.reduce((s, c) => s + (c.enrolled ?? 0), 0);
  const totalSeats    = myClasses.reduce((s, c) => s + (c.seats ?? 0), 0);
  const openClasses   = myClasses.filter(c => (c.enrolled ?? 0) < c.seats).length;

  function handleDelete(id) {
    const cls = myClasses.find(c => c.id === id);
    deleteClass(id);
    setDeleted(cls?.title ?? 'Class');
    setConfirmId(null);
    setTimeout(() => setDeleted(null), 3000);
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Conductor Portal</p>
          <h1 className="text-3xl font-bold text-ink">My Classes</h1>
          <p className="text-sub text-sm mt-1">Manage, edit, or cancel your scheduled kuppi sessions.</p>
        </div>
        <Link
          to="/conductor/create"
          className="shrink-0 bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(14,165,233,0.35)] hover:-translate-y-0.5 flex items-center gap-2"
        >
          <span>➕</span> New Class
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Classes', value: myClasses.length,  icon: '📚' },
          { label: 'Total Enrolled', value: totalEnrolled,   icon: '🎓' },
          { label: 'Classes Open',   value: openClasses,     icon: '✅' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-2xl font-extrabold text-primary">{s.value}</p>
            <p className="text-xs text-dim font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toast */}
      {deleted && (
        <div className="mb-5 bg-green-50 border border-green-200 text-ok text-sm rounded-xl px-4 py-3 flex items-center gap-2">
          ✓ <span><strong>{deleted}</strong> was removed successfully.</span>
        </div>
      )}

      {/* Classes grid */}
      {myClasses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-5xl block mb-4">📚</span>
          <p className="font-bold text-ink text-lg mb-2">No classes yet</p>
          <p className="text-sub text-sm mb-6">Create your first kuppi session and it will appear here.</p>
          <Link
            to="/conductor/create"
            className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-3 rounded-full transition-all shadow-sm inline-block"
          >
            Create a Class
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-5">
          {myClasses.map(cls => {
            const isFull = (cls.enrolled ?? 0) >= cls.seats;
            const pct = Math.min(100, ((cls.enrolled ?? 0) / Math.max(1, cls.seats)) * 100);
            const enrollCount = dummyEnrollments.filter(e => e.classId === cls.id).length;
            const isConfirming = confirmId === cls.id;

            return (
              <div
                key={cls.id}
                className="bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-primary/20 hover:shadow-[0_4px_20px_rgba(14,165,233,0.08)] transition-all"
              >
                {/* Card header */}
                <div className="p-5 border-b border-slate-100">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full border ${subjectCls(cls.subject)}`}>
                      {cls.subject}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isFull ? 'bg-red-50 text-err' : 'bg-green-50 text-ok'
                    }`}>
                      {isFull ? 'Full' : 'Open'}
                    </span>
                  </div>
                  <h3 className="font-bold text-ink text-base leading-snug mb-1">{cls.title}</h3>
                  <p className="text-dim text-xs mb-3 line-clamp-2">{cls.description}</p>

                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-sub">
                    <span>📅 {cls.date}</span>
                    <span>🕐 {cls.time}</span>
                    {cls.duration && <span>⏱ {cls.duration}</span>}
                  </div>
                </div>

                {/* Enrollment bar */}
                <div className="px-5 py-4 border-b border-slate-100">
                  <div className="flex justify-between text-xs text-dim mb-1.5">
                    <span>{cls.enrolled ?? 0} enrolled</span>
                    <span className="font-bold text-ink">{cls.seats} seats</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-err' : 'bg-primary'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Footer: fee + actions */}
                <div className="px-5 py-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-primary text-base">Rs. {(cls.fee ?? 0).toLocaleString()}</span>
                    <div className="flex gap-2">
                      <Link
                        to={`/conductor/edit/${cls.id}`}
                        className="text-xs font-semibold px-4 py-2 rounded-xl bg-sky-50 text-primary border border-sky-200 hover:bg-sky-100 transition-all"
                      >
                        ✏️ Edit
                      </Link>
                      {!isConfirming ? (
                        <button
                          onClick={() => setConfirmId(cls.id)}
                          className="text-xs font-semibold px-4 py-2 rounded-xl bg-red-50 text-err border border-red-100 hover:bg-red-100 transition-all"
                        >
                          🗑 Delete
                        </button>
                      ) : (
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => handleDelete(cls.id)}
                            className="text-xs font-bold px-3 py-2 rounded-xl bg-err text-white hover:bg-red-700 transition-all"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setConfirmId(null)}
                            className="text-xs font-semibold px-3 py-2 rounded-xl border border-slate-200 text-sub hover:bg-slate-50 transition-all"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
