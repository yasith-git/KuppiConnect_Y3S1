import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useClasses } from '../../../contexts/ClassesContext';
import { useEnrollments } from '../../../contexts/EnrollmentsContext';
import { dummyUsers } from '../../../data/dummyData';
import Comments from '../../content/components/Comments';
import Rating from '../../content/components/Rating';
import UploadNotes from '../../content/components/UploadNotes';
import AISummary from '../../content/components/AISummary';

/* ── Icons ── */
function BackIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function StarIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function StarRating({ rating }) {
  const full = Math.floor(rating);
  return (
    <span className="flex items-center gap-0.5 text-amber-400">
      {Array.from({ length: 5 }, (_, i) => <StarIcon key={i} filled={i < full} />)}
    </span>
  );
}

/* ── Registration Modal ── */
function RegisterModal({ cls, user, onClose, onSuccess }) {
  const { enroll, isEnrolled } = useEnrollments();
  const { incrementEnrolled }  = useClasses();

  // Pre-fill phone from the student's saved profile
  const savedPhone = (() => {
    try {
      const s = localStorage.getItem(`kuppi_student_profile_${user?.id}`);
      return s ? (JSON.parse(s).phone || '') : '';
    } catch { return ''; }
  })();

  const [form, setForm]       = useState({ name: user?.name || '', email: user?.email || '', phone: savedPhone });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);

  function patch(k, v) {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '', form: '' }));
  }

  function validate() {
    const e = {};
    if (!form.name.trim())  e.name  = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email format.';
    if (!form.phone.trim()) e.phone = 'Phone number is required so the conductor can reach you.';
    else if (!/^\+?[\d\s\-]{7,15}$/.test(form.phone)) e.phone = 'Invalid phone number format.';
    return e;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (isEnrolled(cls.id, user?.id)) {
      setErrors({ form: 'You are already registered for this class.' });
      return;
    }
    setLoading(true);
    setTimeout(() => {
      enroll(cls, { id: user?.id, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() });
      incrementEnrolled(cls.id);
      setLoading(false);
      onSuccess({ name: form.name.trim(), email: form.email.trim() });
    }, 500);
  }

  const inputCls = name =>
    `w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-all ${
      errors[name]
        ? 'border-err bg-red-50 focus:ring-2 focus:ring-err/20'
        : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/15'
    }`;

  return (
    <div className="fixed inset-0 bg-ink/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={e => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-slate-100">
          <h2 className="font-bold text-ink text-lg">Register for Class</h2>
          <p className="text-dim text-sm mt-0.5">{cls.title}</p>
        </div>
        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-4">
          {errors.form && (
            <div className="bg-red-50 border border-red-200 text-err text-sm px-4 py-3 rounded-xl">{errors.form}</div>
          )}
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Full Name <span className="text-err">*</span></label>
            <input type="text" value={form.name} onChange={e => patch('name', e.target.value)}
              placeholder="Enter your full name" className={inputCls('name')} />
            {errors.name && <p className="text-err text-xs mt-1.5">⚠ {errors.name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">Email Address <span className="text-err">*</span></label>
            <input type="email" value={form.email} onChange={e => patch('email', e.target.value)}
              placeholder="Enter your email address" className={inputCls('email')} />
            {errors.email && <p className="text-err text-xs mt-1.5">⚠ {errors.email}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-ink mb-1.5">
              Phone Number <span className="text-err">*</span>
              <span className="text-dim font-normal text-xs ml-1">— so the conductor can contact you</span>
            </label>
            <input type="tel" value={form.phone} onChange={e => patch('phone', e.target.value)}
              placeholder="e.g. +94 77 123 4567" className={inputCls('phone')} />
            {errors.phone && <p className="text-err text-xs mt-1.5">⚠ {errors.phone}</p>}
          </div>
          <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 space-y-1.5 text-xs text-sub">
            <p><span className="font-bold text-ink">Class:</span> {cls.title}</p>
            <p><span className="font-bold text-ink">Date:</span> {cls.date} at {cls.time}</p>
            <p><span className="font-bold text-ink">Fee:</span> Rs. {cls.fee?.toLocaleString()}</p>
            <p><span className="font-bold text-ink">Conductor:</span> {cls.conductor}</p>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 border border-slate-200 text-sub py-3 rounded-xl font-semibold text-sm hover:bg-slate-50 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-primary hover:bg-primary-dark text-white py-3 rounded-xl font-bold text-sm transition-all shadow-sm disabled:opacity-70">
              {loading ? 'Registering...' : 'Confirm Registration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Email Confirmation Modal ── */
function EmailConfirmModal({ studentName, studentEmail, cls, onClose }) {
  const body = `Dear ${studentName},

Your registration has been confirmed!

────────────────────────
 Class Details
────────────────────────
Class:     ${cls.title}
Subject:   ${cls.subject}
Date:      ${cls.date}
Time:      ${cls.time}
Conductor: ${cls.conductor}
Fee:       Rs. ${cls.fee?.toLocaleString()}
${cls.meetingLink ? `Meeting:   ${cls.meetingLink}` : ''}

A reminder email will be sent 2 days before the class date.

Thank you for choosing KuppiConnect!

Best regards,
KuppiConnect Team`;

  return (
    <div className="fixed inset-0 bg-ink/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-ok to-emerald-500 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">🎉</div>
            <div>
              <p className="text-white font-bold text-base">Registration Successful!</p>
              <p className="text-white/80 text-sm">Confirmation email sent to {studentEmail}</p>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-1 text-xs">
            <p><span className="font-bold text-ink w-16 inline-block">From:</span><span className="text-dim">noreply@kuppiconnect.lk</span></p>
            <p><span className="font-bold text-ink w-16 inline-block">To:</span><span className="text-dim">{studentEmail}</span></p>
            <p><span className="font-bold text-ink w-16 inline-block">Subject:</span><span className="text-dim">Registration Confirmed – {cls.title}</span></p>
          </div>
          <pre className="text-xs text-sub leading-relaxed whitespace-pre-wrap font-sans border-l-2 border-ok pl-4">{body}</pre>
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-start gap-2">
            <span>⏰</span>
            <span>A <strong>reminder email</strong> will be automatically sent 2 days before the class date.</span>
          </div>
          <button onClick={onClose}
            className="mt-5 w-full bg-primary hover:bg-primary-dark text-white font-bold py-3 rounded-xl text-sm transition-all shadow-sm">
            Great, got it!
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Component ── */
export default function ClassDetails() {
  const { id } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { classes } = useClasses();
  const { isEnrolled } = useEnrollments();

  const [showRegister, setShowRegister] = useState(false);
  const [emailData, setEmailData]       = useState(null);
  const [activeTab, setActiveTab]       = useState('discussion');

  const cls = classes.find(c => c.id === Number(id));

  if (!cls) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-6xl mb-4">😕</p>
          <h1 className="text-2xl font-bold text-ink mb-2">Class Not Found</h1>
          <p className="text-sub text-sm mb-6">The class you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-all shadow-sm">
            Browse Classes
          </Link>
        </div>
      </div>
    );
  }

  const storedProfile = (() => {
    try {
      const s = localStorage.getItem(`kuppi_profile_${cls.conductorId}`);
      return s ? JSON.parse(s) : null;
    } catch { return null; }
  })();
  const conductor      = storedProfile ?? dummyUsers.find(u => u.id === cls.conductorId);
  const relatedClasses = classes.filter(c => c.conductorId === cls.conductorId && c.id !== cls.id);
  const isFull         = cls.enrolled >= cls.seats;
  const pct            = Math.min(100, (cls.enrolled / cls.seats) * 100);
  const alreadyEnrolled = user?.role === 'student' && isEnrolled(cls.id, user?.id);

  function handleLogout() { logout(); navigate('/'); }

  function handleRegisterClick() {
    if (!user) { navigate('/login'); return; }
    setShowRegister(true);
  }

  return (
    <div className="min-h-screen bg-white">
      {showRegister && (
        <RegisterModal cls={cls} user={user} onClose={() => setShowRegister(false)}
          onSuccess={d => { setShowRegister(false); setEmailData(d); }} />
      )}
      {emailData && (
        <EmailConfirmModal studentName={emailData.name} studentEmail={emailData.email}
          cls={cls} onClose={() => setEmailData(null)} />
      )}

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 shadow-[0_1px_0_rgba(0,0,0,0.05)]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">K</span>
            <span className="font-bold text-ink text-base tracking-tight">KuppiConnect</span>
          </Link>
          <div className="flex items-center gap-1">
            {user ? (
              <>
                <span className="hidden sm:block text-dim text-sm mr-1">Hi, <span className="text-ink font-semibold">{user.name.split(' ')[0]}</span></span>
                <Link to={user.role === 'conductor' ? '/conductor' : '/student'}
                  className="text-sub hover:text-ink text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">Dashboard</Link>
                <button onClick={handleLogout}
                  className="border border-slate-200 text-sub hover:text-err hover:border-err/30 text-sm font-medium transition-all px-4 py-2 rounded-full ml-1">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sub hover:text-ink text-sm font-medium transition-colors px-3 py-2 rounded-lg hover:bg-slate-50">Sign In</Link>
                <Link to="/register"
                  className="bg-primary hover:bg-primary-dark text-white text-sm font-semibold px-5 py-2 rounded-full transition-all shadow-sm ml-2 hover:shadow-[0_4px_14px_rgba(14,165,233,0.35)] hover:-translate-y-0.5">
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── Breadcrumb ── */}
      <div className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center gap-2 text-xs text-dim">
          <button onClick={() => navigate(-1)} className="flex items-center gap-1 text-sub hover:text-primary font-medium transition-colors">
            <BackIcon /> Back
          </button>
          <span>/</span>
          <Link to="/" className="hover:text-primary transition-colors">Classes</Link>
          <span>/</span>
          <span className="text-ink font-medium truncate max-w-[200px]">{cls.subject}</span>
        </div>
      </div>

      {/* ── Class Header ── */}
      <div className="bg-sky-50 border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <span className="inline-block bg-white border border-sky-200 text-primary text-xs font-bold px-3 py-1 rounded-full mb-4">{cls.subject}</span>
          <h1 className="text-3xl font-extrabold text-ink mb-4 leading-tight">{cls.title}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-sub">
            <span className="flex items-center gap-1.5">📅 <span>{cls.date}</span></span>
            <span className="flex items-center gap-1.5">🕐 <span>{cls.time}</span></span>
            {cls.duration && <span className="flex items-center gap-1.5">⏱ <span>{cls.duration}</span></span>}
            {(cls.location || cls.meetingLink) && <span className="flex items-center gap-1.5">📍 <span>{cls.location || cls.meetingLink}</span></span>}
            <span className="flex items-center gap-1.5">💰 <span className="font-semibold text-ink">Rs. {cls.fee?.toLocaleString()}</span></span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Left: Details */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm">
              <h2 className="font-bold text-ink text-lg mb-4">About This Class</h2>
              <p className="text-sub text-sm leading-relaxed">{cls.description || 'No description provided.'}</p>
            </div>

            <div className="bg-white border border-slate-100 rounded-2xl p-7 shadow-sm">
              <h2 className="font-bold text-ink text-lg mb-5">Class Details</h2>
              <dl className="grid sm:grid-cols-2 gap-4">
                {[
                  { label: 'Date',     value: cls.date,                              icon: '📅' },
                  { label: 'Time',     value: cls.time,                              icon: '🕐' },
                  { label: 'Duration', value: cls.duration || '—',                   icon: '⏱' },
                  { label: 'Location', value: cls.location || cls.meetingLink || '—', icon: '📍' },
                  { label: 'Fee',      value: `Rs. ${cls.fee?.toLocaleString()}`,     icon: '💰' },
                  { label: 'Subject',  value: cls.subject,                            icon: '📚' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-start gap-3 p-4 bg-sky-50 rounded-xl border border-sky-100">
                    <span className="text-lg">{icon}</span>
                    <div>
                      <dt className="text-xs text-dim font-medium mb-0.5">{label}</dt>
                      <dd className="text-sm font-semibold text-ink break-all">{value}</dd>
                    </div>
                  </div>
                ))}
              </dl>
              <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-sub font-medium">Enrollment</span>
                  <span className="text-ink font-bold">{cls.enrolled} / {cls.seats} seats</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-700 ${isFull ? 'bg-err' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                </div>
                <p className={`text-xs mt-2 font-medium ${isFull ? 'text-err' : 'text-ok'}`}>
                  {isFull ? 'This class is fully booked.' : `${cls.seats - cls.enrolled} seats remaining.`}
                </p>
              </div>
            </div>

            {relatedClasses.length > 0 && (
              <div>
                <h2 className="font-bold text-ink text-lg mb-4">More By {conductor?.name ?? cls.conductor}</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {relatedClasses.map(rc => (
                    <Link key={rc.id} to={`/class/${rc.id}`}
                      className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(14,165,233,0.08)] hover:-translate-y-0.5 transition-all block group">
                      <span className="inline-block bg-sky-50 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-sky-200 mb-3">{rc.subject}</span>
                      <h3 className="text-sm font-bold text-ink group-hover:text-primary transition-colors leading-snug mb-2">{rc.title}</h3>
                      <p className="text-xs text-dim">{rc.date} · Rs. {rc.fee?.toLocaleString()}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Sidebar */}
          <div className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-extrabold text-primary">Rs. {cls.fee?.toLocaleString()}</span>
                <span className="text-xs text-dim font-medium">per session</span>
              </div>
              <div className="mb-5">
                <div className="flex justify-between text-xs text-dim mb-1.5">
                  <span>{cls.enrolled} enrolled</span>
                  <span>{cls.seats} total seats</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div className={`h-full rounded-full ${isFull ? 'bg-err' : 'bg-primary'}`} style={{ width: `${pct}%` }} />
                </div>
              </div>

              {alreadyEnrolled ? (
                <div className="w-full py-3 rounded-xl bg-green-50 border border-green-200 text-ok text-sm font-bold text-center">
                  ✓ You are registered for this class
                </div>
              ) : isFull ? (
                <div className="w-full py-3 rounded-xl bg-slate-100 text-dim text-sm font-bold text-center">Class is Full</div>
              ) : user?.role === 'conductor' ? (
                <div className="w-full py-3 rounded-xl bg-sky-50 border border-sky-200 text-primary text-sm font-semibold text-center">
                  Conductors cannot register for classes
                </div>
              ) : (
                <button onClick={handleRegisterClick}
                  className="block w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold text-center transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(14,165,233,0.35)] hover:-translate-y-0.5">
                  {user ? 'Register for this Class' : 'Sign In to Register'}
                </button>
              )}

              {!user && (
                <p className="text-center text-xs text-dim mt-3">
                  Don't have an account?{' '}
                  <Link to="/register" className="text-primary font-semibold hover:underline">Register free</Link>
                </p>
              )}
            </div>

            {conductor && (
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
                <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">Your Conductor</p>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full overflow-hidden shrink-0 shadow-sm flex items-center justify-center bg-gradient-to-br from-sky-400 to-primary">
                    {conductor.photo
                      ? <img src={conductor.photo} alt={conductor.name} className="w-full h-full object-cover" />
                      : <span className="text-white font-extrabold text-xl">{conductor.name?.charAt(0)}</span>
                    }
                  </div>
                  <div>
                    <h3 className="font-bold text-ink text-base leading-tight">{conductor.name}</h3>
                    <p className="text-dim text-xs">{conductor.title}</p>
                    <p className="text-dim text-xs">{conductor.university}</p>
                  </div>
                </div>
                {conductor.rating && (
                  <div className="flex items-center gap-2 mb-4">
                    <StarRating rating={conductor.rating} />
                    <span className="text-sm font-bold text-ink">{conductor.rating}</span>
                    <span className="text-xs text-dim">/ 5.0</span>
                  </div>
                )}
                {conductor.bio && (
                  <p className="text-xs text-sub leading-relaxed mb-4 border-t border-slate-100 pt-4">{conductor.bio}</p>
                )}
                {conductor.subjects?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {conductor.subjects.map(s => (
                      <span key={s} className="bg-sky-50 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-sky-200">{s}</span>
                    ))}
                  </div>
                )}
                {(conductor.totalStudents || conductor.classesHeld) && (
                  <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    {conductor.totalStudents && (
                      <div className="text-center p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <p className="text-lg font-extrabold text-primary">{conductor.totalStudents}+</p>
                        <p className="text-[11px] text-dim">Students Taught</p>
                      </div>
                    )}
                    {conductor.classesHeld && (
                      <div className="text-center p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <p className="text-lg font-extrabold text-primary">{conductor.classesHeld}</p>
                        <p className="text-[11px] text-dim">Classes Held</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Class Hub: Notes · Discussion · Rating · AI ── */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        {/* Tab bar */}
        <div className="flex flex-wrap gap-1 border-b border-slate-100 mb-8">
          {[
            { key: 'discussion', icon: '💬', label: 'Discussion' },
            { key: 'notes',      icon: '📄', label: 'Class Notes' },
            { key: 'rating',     icon: '⭐', label: 'Rate Class' },
            { key: 'ai',         icon: '🤖', label: 'AI Analysis' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold transition-all border-b-2 -mb-px ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-sub hover:text-ink hover:border-slate-200'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab panels */}
        {activeTab === 'discussion' && (
          <div className="space-y-6">
            <Comments classId={cls.id} conductorId={cls.conductorId} />
            <AISummary classId={cls.id} />
          </div>
        )}
        {activeTab === 'notes' && (
          <UploadNotes classId={cls.id} conductorId={cls.conductorId} />
        )}
        {activeTab === 'rating' && (
          <Rating classId={cls.id} conductorId={cls.conductorId} />
        )}
        {activeTab === 'ai' && (
          <AISummary classId={cls.id} />
        )}
      </div>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-white mt-8">
        <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-dim">
            <span className="w-7 h-7 bg-primary rounded-lg flex items-center justify-center text-white font-bold text-xs">K</span>
            <span className="font-semibold text-ink">KuppiConnect</span>
            <span>· © 2026</span>
          </div>
          {(!user || user.role !== 'conductor') && (
            <div className="flex items-center gap-5 text-xs text-dim">
              <Link to="/" className="hover:text-ink transition-colors">Home</Link>
              {!user && <Link to="/login" className="hover:text-ink transition-colors">Sign In</Link>}
              {!user && <Link to="/register" className="hover:text-ink transition-colors">Register</Link>}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
