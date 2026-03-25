import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useEnrollments } from '../../../contexts/EnrollmentsContext';
import { useClasses } from '../../../contexts/ClassesContext';
import { dummyContent } from '../../../data/dummyData';

const today = new Date().toISOString().split('T')[0];

function CancellationEmailModal({ enrollment, onClose }) {
  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-slate-600 to-slate-700 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">📧</div>
            <div>
              <p className="text-white font-bold">Cancellation Email Sent</p>
              <p className="text-white/80 text-sm">To: {enrollment.email}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4 space-y-1 text-xs">
            <p><span className="font-bold text-ink w-16 inline-block">From:</span><span className="text-dim">noreply@kuppiconnect.lk</span></p>
            <p><span className="font-bold text-ink w-16 inline-block">To:</span><span className="text-dim">{enrollment.email}</span></p>
            <p><span className="font-bold text-ink w-16 inline-block">Subject:</span><span className="text-dim">Class Cancellation – {enrollment.classTitle}</span></p>
          </div>
          <pre className="text-xs text-sub leading-relaxed whitespace-pre-wrap font-sans border-l-2 border-slate-400 pl-4">{`Dear ${enrollment.studentName},

Your registration for the following class has been successfully cancelled:

Class: ${enrollment.classTitle}
Subject: ${enrollment.classSubject}
Date: ${enrollment.classDate} at ${enrollment.classTime}
Conductor: ${enrollment.conductor}

We hope to see you in future sessions at KuppiConnect.

Best regards,
KuppiConnect Team`}</pre>
          <button onClick={onClose}
            className="mt-5 w-full bg-slate-700 hover:bg-slate-800 text-white font-bold py-3 rounded-xl text-sm transition-all">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MyClasses() {
  const { user } = useAuth();
  const { getStudentEnrollments, unenroll } = useEnrollments();
  const { decrementEnrolled } = useClasses();

  const [tab, setTab]             = useState('upcoming');
  const [emailModal, setEmailModal] = useState(null);
  const [leavingId, setLeavingId]   = useState(null);

  const myEnrollments = getStudentEnrollments(user?.id);
  const upcoming  = myEnrollments.filter(e => e.classDate >= today);
  const completed = myEnrollments.filter(e => e.classDate < today);
  const list = tab === 'upcoming' ? upcoming : completed;

  function handleLeave(enrollment) {
    unenroll(enrollment.id);
    decrementEnrolled(enrollment.classId);
    setLeavingId(null);
    setEmailModal(enrollment);
  }

  function getClassNotes(classId) {
    return dummyContent.filter(c => c.classId === classId);
  }

  return (
    <>
      {emailModal && (
        <CancellationEmailModal enrollment={emailModal} onClose={() => setEmailModal(null)} />
      )}

      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Student Portal</p>
          <h1 className="text-3xl font-bold text-ink">My Classes</h1>
          <p className="text-sub text-sm mt-1">Track your registered and completed sessions.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 rounded-xl p-1 mb-6 w-fit">
          {[
            { key: 'upcoming',  label: 'Upcoming',  count: upcoming.length },
            { key: 'completed', label: 'Completed', count: completed.length },
          ].map(t => (
            <button key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${
                tab === t.key ? 'bg-white text-ink shadow-sm' : 'text-dim hover:text-ink'
              }`}>
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <div className="text-center py-20 bg-white border border-rim rounded-2xl">
            <p className="text-5xl mb-4">{tab === 'upcoming' ? '📅' : '🎓'}</p>
            <h3 className="font-bold text-ink text-lg mb-2">No {tab} classes</h3>
            <p className="text-sub text-sm mb-6">
              {tab === 'upcoming'
                ? 'Register for classes to see them here.'
                : 'Your completed sessions will appear here.'}
            </p>
            {tab === 'upcoming' && (
              <Link to="/student/classes"
                className="bg-primary text-white text-sm font-bold px-6 py-2.5 rounded-xl hover:bg-primary-dark transition-all shadow-sm">
                Browse Classes
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map(enrollment => {
              const notes    = getClassNotes(enrollment.classId);
              const canLeave = enrollment.classDate > today;
              const isPast   = enrollment.classDate < today;

              return (
                <div key={enrollment.id} className="bg-white border border-rim rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <span className="bg-sky-50 text-primary text-xs font-bold px-2.5 py-1 rounded-full border border-sky-200">
                            {enrollment.classSubject}
                          </span>
                          {isPast
                            ? <span className="bg-green-50 text-ok text-xs font-bold px-2.5 py-1 rounded-full border border-green-200">✓ Completed</span>
                            : <span className="bg-amber-50 text-amber-600 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-200">Upcoming</span>
                          }
                        </div>
                        <h3 className="font-bold text-ink text-lg mb-1 leading-tight">{enrollment.classTitle}</h3>
                        <p className="text-dim text-sm mb-4">{enrollment.conductor}</p>

                        <div className="grid sm:grid-cols-3 gap-3 text-xs">
                          {[
                            { icon: '📅', val: enrollment.classDate },
                            { icon: '🕐', val: enrollment.classTime },
                            { icon: '💰', val: `Rs. ${enrollment.classFee?.toLocaleString()}` },
                          ].map((d, i) => (
                            <div key={i} className="flex items-center gap-1.5 text-sub">
                              <span>{d.icon}</span><span>{d.val}</span>
                            </div>
                          ))}
                        </div>

                        {enrollment.classMeetingLink && (
                          <a href={enrollment.classMeetingLink} target="_blank" rel="noreferrer"
                            className="inline-flex items-center gap-1.5 mt-3 text-xs text-primary hover:underline font-semibold">
                            📎 Join Meeting Link →
                          </a>
                        )}
                      </div>

                      {/* Leave action */}
                      {canLeave && (
                        <div className="shrink-0">
                          {leavingId === enrollment.id ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-sub">Are you sure?</span>
                              <button onClick={() => handleLeave(enrollment)}
                                className="text-xs bg-err text-white px-3 py-2 rounded-xl font-bold hover:bg-red-700 transition-all">
                                Confirm
                              </button>
                              <button onClick={() => setLeavingId(null)}
                                className="text-xs border border-slate-200 text-sub px-3 py-2 rounded-xl font-semibold hover:bg-slate-50">
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button onClick={() => setLeavingId(enrollment.id)}
                              className="text-xs border border-red-200 text-err px-4 py-2 rounded-xl font-semibold hover:bg-red-50 transition-all">
                              Leave Class
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Notes / PDF download */}
                    {notes.length > 0 && (
                      <div className="mt-5 pt-5 border-t border-slate-100">
                        <p className="text-xs font-bold text-ink mb-2">📄 Class Notes & Materials</p>
                        <div className="flex flex-wrap gap-2">
                          {notes.map(note => (
                            <a key={note.id} href={note.url} target="_blank" rel="noreferrer"
                              className="flex items-center gap-1.5 bg-sky-50 text-primary text-xs font-semibold px-3 py-2 rounded-full border border-sky-200 hover:bg-sky-100 transition-all">
                              ⬇ {note.title} ({note.type})
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-dim">
                    <span>Registered on {enrollment.registeredAt}</span>
                    <span>Confirmation emailed to {enrollment.email}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
