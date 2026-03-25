import { useState, useEffect } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { dummyUsers } from '../../../data/dummyData';

const SUBJECTS_ALL = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology',
  'Computer Science', 'English', 'Economics', 'Statistics', 'Other',
];

const LS_KEY = 'kuppi_profile';

function loadProfile(userId) {
  try {
    const s = localStorage.getItem(`${LS_KEY}_${userId}`);
    if (s) return JSON.parse(s);
  } catch {}
  return null;
}

function saveProfile(userId, data) {
  try { localStorage.setItem(`${LS_KEY}_${userId}`, JSON.stringify(data)); } catch {}
}

function validate(form) {
  const e = {};
  if (!form.name.trim())       e.name       = 'Full name is required.';
  if (!form.title.trim())      e.title      = 'Academic title is required.';
  if (!form.university.trim()) e.university = 'University is required.';
  if (!form.bio.trim())        e.bio        = 'Short bio is required.';
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                               e.email      = 'Invalid email format.';
  if (form.phone && !/^\+?[\d\s\-]{7,15}$/.test(form.phone))
                               e.phone      = 'Invalid phone number.';
  return e;
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-err text-xs mt-1.5">⚠ {msg}</p>;
}

function StarIcon({ filled }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth="1.5" className="text-amber-400">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

export default function Profile() {
  const { user } = useAuth();

  const baseUser = dummyUsers.find(u => u.id === user?.id) ?? {};

  const initialProfile = loadProfile(user?.id) ?? {
    name:         baseUser.name ?? user?.name ?? '',
    email:        baseUser.email ?? user?.email ?? '',
    phone:        baseUser.phone ?? '',
    title:        baseUser.title ?? '',
    university:   baseUser.university ?? '',
    bio:          baseUser.bio ?? '',
    subjects:     baseUser.subjects ?? [],
    rating:       baseUser.rating ?? null,
    totalStudents:baseUser.totalStudents ?? 0,
    classesHeld:  baseUser.classesHeld ?? 0,
    photo:        baseUser.photo ?? null,
  };

  const [form, setForm] = useState(initialProfile);
  const [errors, setErrors] = useState({});
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [subjectInput, setSubjectInput] = useState('');

  function inputCls(name) {
    return `w-full px-4 py-3 text-sm border rounded-xl focus:outline-none transition-all ${
      errors[name]
        ? 'border-err bg-red-50 focus:ring-2 focus:ring-err/20'
        : 'border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/15'
    }`;
  }

  function patch(key, value) {
    setForm(f => ({ ...f, [key]: value }));
    if (errors[key]) setErrors(e => ({ ...e, [key]: '' }));
  }

  function addSubject(s) {
    const trimmed = s.trim();
    if (trimmed && !form.subjects.includes(trimmed)) {
      patch('subjects', [...form.subjects, trimmed]);
    }
    setSubjectInput('');
  }

  function removeSubject(s) {
    patch('subjects', form.subjects.filter(x => x !== s));
  }

  function handlePhotoUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = evt => patch('photo', evt.target.result);
    reader.readAsDataURL(file);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    saveProfile(user?.id, form);
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const ratingStars = Array.from({ length: 5 }, (_, i) => i < Math.floor(form.rating ?? 0));

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Conductor Portal</p>
          <h1 className="text-3xl font-bold text-ink">My Profile</h1>
          <p className="text-sub text-sm mt-1">Students see this profile on the class detail page.</p>
        </div>
        {!editing && (
          <button
            onClick={() => { setEditing(true); setSaved(false); }}
            className="shrink-0 bg-primary hover:bg-primary-dark text-white text-sm font-bold px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(14,165,233,0.35)] hover:-translate-y-0.5"
          >
            ✏️ Edit Profile
          </button>
        )}
      </div>

      {saved && (
        <div className="mb-6 bg-green-50 border border-green-200 text-ok rounded-xl px-4 py-3 text-sm flex items-center gap-2">
          ✓ Profile saved successfully! Students will see updated info on class pages.
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Profile card (preview) ── */}
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm lg:sticky lg:top-8">
            <p className="text-primary text-xs font-bold uppercase tracking-widest mb-4">Preview</p>

            {/* Avatar */}
            <div className="flex flex-col items-center text-center mb-5">
              <div className="w-20 h-20 rounded-full shadow-sm mb-3 overflow-hidden flex items-center justify-center bg-gradient-to-br from-sky-400 to-primary">
                {form.photo
                  ? <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
                  : <span className="text-white font-extrabold text-3xl">{form.name.charAt(0).toUpperCase()}</span>
                }
              </div>
              <h2 className="font-bold text-ink text-base leading-tight">{form.name || '—'}</h2>
              <p className="text-dim text-xs mt-0.5">{form.title || '—'}</p>
              <p className="text-dim text-xs">{form.university || '—'}</p>
            </div>

            {/* Rating */}
            {form.rating && (
              <div className="flex items-center justify-center gap-1.5 mb-4">
                <div className="flex gap-0.5">
                  {ratingStars.map((f, i) => <StarIcon key={i} filled={f} />)}
                </div>
                <span className="text-sm font-bold text-ink">{form.rating}</span>
                <span className="text-xs text-dim">/ 5</span>
              </div>
            )}

            {/* Bio */}
            {form.bio && (
              <p className="text-xs text-sub leading-relaxed text-center mb-4 border-t border-slate-100 pt-4">
                {form.bio}
              </p>
            )}

            {/* Subjects */}
            {form.subjects.length > 0 && (
              <div className="flex flex-wrap gap-1.5 justify-center mb-4">
                {form.subjects.map(s => (
                  <span key={s} className="bg-sky-50 text-primary text-xs font-semibold px-2.5 py-1 rounded-full border border-sky-200">{s}</span>
                ))}
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <div className="text-center p-2.5 bg-sky-50 rounded-xl border border-sky-100">
                <p className="text-base font-extrabold text-primary">{form.totalStudents ?? 0}+</p>
                <p className="text-[10px] text-dim">Students</p>
              </div>
              <div className="text-center p-2.5 bg-sky-50 rounded-xl border border-sky-100">
                <p className="text-base font-extrabold text-primary">{form.classesHeld ?? 0}</p>
                <p className="text-[10px] text-dim">Classes</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Right: Details / Edit form ── */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">

            {!editing ? (
              /* View mode */
              <div>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-5">Personal Information</h3>
                  <dl className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: 'Full Name',   value: form.name },
                      { label: 'Email',       value: form.email },
                      { label: 'Phone',       value: form.phone },
                      { label: 'Title',       value: form.title },
                      { label: 'University',  value: form.university },
                    ].map(({ label, value }) => (
                      <div key={label} className="p-3 bg-sky-50 rounded-xl border border-sky-100">
                        <dt className="text-xs text-dim font-medium mb-0.5">{label}</dt>
                        <dd className="text-sm font-semibold text-ink">{value || '—'}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-3">Bio</h3>
                  <p className="text-sub text-sm leading-relaxed">{form.bio || '—'}</p>
                </div>
                <div className="p-6">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-3">Teaching Subjects</h3>
                  {form.subjects.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {form.subjects.map(s => (
                        <span key={s} className="bg-sky-50 text-primary text-sm font-semibold px-3 py-1.5 rounded-full border border-sky-200">{s}</span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-dim text-sm">No subjects added.</p>
                  )}
                </div>
              </div>
            ) : (
              /* Edit mode */
              <form onSubmit={handleSubmit} noValidate>
                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-5">Profile Picture</h3>
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-sky-400 to-primary shrink-0 shadow-sm">
                      {form.photo
                        ? <img src={form.photo} alt="Profile preview" className="w-full h-full object-cover" />
                        : <span className="text-white font-extrabold text-2xl">{form.name.charAt(0).toUpperCase() || 'K'}</span>
                      }
                    </div>
                    <div>
                      <label className="cursor-pointer inline-flex items-center gap-2 bg-sky-50 hover:bg-sky-100 text-primary border border-sky-200 text-sm font-bold px-4 py-2.5 rounded-xl transition-all">
                        📷 Upload Photo
                        <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                      </label>
                      {form.photo && (
                        <button type="button"
                          onClick={() => patch('photo', null)}
                          className="ml-3 text-xs text-err hover:underline">
                          Remove
                        </button>
                      )}
                      <p className="text-xs text-dim mt-1.5">JPG, PNG or GIF · Max 5 MB</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-5">Personal Information</h3>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Full Name <span className="text-err">*</span></label>
                        <input type="text" value={form.name}
                          onChange={e => patch('name', e.target.value)}
                          className={inputCls('name')} />
                        <FieldError msg={errors.name} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Email</label>
                        <input type="email" value={form.email}
                          onChange={e => patch('email', e.target.value)}
                          className={inputCls('email')} />
                        <FieldError msg={errors.email} />
                      </div>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Phone Number</label>
                        <input type="tel" value={form.phone}
                          onChange={e => patch('phone', e.target.value)}
                          placeholder="e.g. +94 77 123 4567"
                          className={inputCls('phone')} />
                        <FieldError msg={errors.phone} />
                      </div>
                      <div />
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">Academic Title <span className="text-err">*</span></label>
                        <input type="text" value={form.title}
                          onChange={e => patch('title', e.target.value)}
                          placeholder="e.g. Senior Lecturer"
                          className={inputCls('title')} />
                        <FieldError msg={errors.title} />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-ink mb-1.5">University <span className="text-err">*</span></label>
                        <input type="text" value={form.university}
                          onChange={e => patch('university', e.target.value)}
                          placeholder="e.g. University of Colombo"
                          className={inputCls('university')} />
                        <FieldError msg={errors.university} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-4">Bio <span className="text-err">*</span></h3>
                  <textarea value={form.bio} rows={4}
                    onChange={e => patch('bio', e.target.value)}
                    placeholder="Brief professional biography visible to students..."
                    className={`${inputCls('bio')} resize-none`} />
                  <FieldError msg={errors.bio} />
                </div>

                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-4">Teaching Subjects</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {form.subjects.map(s => (
                      <span key={s}
                        className="flex items-center gap-1.5 bg-sky-50 text-primary text-sm font-semibold px-3 py-1.5 rounded-full border border-sky-200">
                        {s}
                        <button type="button" onClick={() => removeSubject(s)}
                          className="text-primary/60 hover:text-err transition-colors text-base leading-none ml-0.5">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={subjectInput}
                      onChange={e => setSubjectInput(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSubject(subjectInput); } }}
                      placeholder="Type a subject and press Add..."
                      className="flex-1 text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all bg-white"
                    />
                    <button type="button"
                      disabled={!subjectInput.trim()}
                      onClick={() => addSubject(subjectInput)}
                      className="bg-sky-50 text-primary border border-sky-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-sky-100 transition-all disabled:opacity-40">
                      Add
                    </button>
                  </div>
                </div>

                <div className="p-6 border-b border-slate-100">
                  <h3 className="font-bold text-ink text-sm uppercase tracking-wide mb-4">Stats</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Total Students Taught</label>
                      <input type="number" value={form.totalStudents} min="0"
                        onChange={e => patch('totalStudents', Number(e.target.value))}
                        className={inputCls('totalStudents')} />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-ink mb-1.5">Classes Held</label>
                      <input type="number" value={form.classesHeld} min="0"
                        onChange={e => patch('classesHeld', Number(e.target.value))}
                        className={inputCls('classesHeld')} />
                    </div>
                  </div>
                </div>

                <div className="p-6 flex gap-3">
                  <button type="submit"
                    className="flex-1 bg-primary hover:bg-primary-dark text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(14,165,233,0.35)]">
                    Save Profile
                  </button>
                  <button type="button"
                    onClick={() => { setEditing(false); setErrors({}); setForm(loadProfile(user?.id) ?? initialProfile); }}
                    className="px-8 py-3.5 border border-slate-200 text-sub rounded-xl text-sm font-semibold hover:bg-slate-50 transition-all">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
