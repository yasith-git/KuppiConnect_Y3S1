import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useClasses } from '../../../contexts/ClassesContext';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PdfIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export default function UploadNotesPage() {
  const { user } = useAuth();
  const { classes } = useClasses();

  const myClasses = classes.filter(c => String(c.conductorId) === String(user?.id));

  const [selectedClassId, setSelectedClassId] = useState('');
  const [notes, setNotes] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileRef = useRef();

  /* Load notes when selected class changes */
  useEffect(() => {
    if (!selectedClassId) { setNotes([]); return; }
    try {
      const raw = localStorage.getItem(`kuppi_notes_${selectedClassId}`);
      setNotes(raw ? JSON.parse(raw) : []);
    } catch { setNotes([]); }
  }, [selectedClassId]);

  function persist(updated) {
    setNotes(updated);
    localStorage.setItem(`kuppi_notes_${selectedClassId}`, JSON.stringify(updated));
  }

  function processFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Only PDF files are accepted.'); return; }
    if (file.size > 20 * 1024 * 1024) { alert('File must be under 20 MB.'); return; }

    setUploadFileName(file.name);
    setUploading(true);

    const reader = new FileReader();
    reader.onload = ev => {
      const entry = {
        id: Date.now(),
        fileName: file.name,
        size: file.size,
        uploadedBy: user.name,
        uploadedAt: new Date().toISOString().slice(0, 10),
        fileData: ev.target.result,
      };
      persist([entry, ...notes]);
      setUploadFileName('');
      setUploading(false);
      setSuccessMsg(`"${file.name}" uploaded successfully! Students can now download it.`);
      setTimeout(() => setSuccessMsg(''), 5000);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  function handleInput(e) {
    processFile(e.target.files?.[0]);
    if (e.target) e.target.value = '';
  }

  function handleDownload(note) {
    const a = document.createElement('a');
    a.href = note.fileData;
    a.download = note.fileName;
    a.click();
  }

  function handleDelete(id) {
    if (!window.confirm('Delete this file? Students will no longer be able to download it.')) return;
    persist(notes.filter(n => n.id !== id));
  }

  /* Total notes across all my classes (for stats) */
  const totalNotes = myClasses.reduce((acc, cls) => {
    try {
      const raw = localStorage.getItem(`kuppi_notes_${cls.id}`);
      return acc + (raw ? JSON.parse(raw).length : 0);
    } catch { return acc; }
  }, 0);

  const selectedClass = myClasses.find(c => String(c.id) === String(selectedClassId));

  return (
    <div>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Resources</p>
        <h1 className="text-3xl font-bold text-ink">Upload Class Notes</h1>
        <p className="text-sub text-sm mt-1">
          Upload PDF notes for your classes. Students can download them directly from the class page.
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {[
          { icon: '📚', label: 'My Classes', value: myClasses.length },
          { icon: '📄', label: 'Total Files', value: totalNotes },
          { icon: '🎓', label: 'Students Access', value: 'Live' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-rim rounded-2xl p-5 flex items-center gap-4 hover:border-primary/30 hover:shadow-[0_4px_20px_rgba(14,165,233,0.08)] hover:-translate-y-0.5 transition-all">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-xl font-extrabold text-ink">{s.value}</p>
              <p className="text-xs text-dim mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Class selector */}
      <div className="bg-white border border-rim rounded-2xl p-6 shadow-sm mb-6">
        <label className="block text-sm font-bold text-ink mb-3">
          Select Class <span className="text-err">*</span>
        </label>
        {myClasses.length === 0 ? (
          <div className="p-5 bg-sky-50 border border-sky-100 rounded-xl text-sm text-sub text-center">
            You haven't created any classes yet.{' '}
            <a href="/conductor/create" className="text-primary font-semibold hover:underline">Create one →</a>
          </div>
        ) : (
          <select
            value={selectedClassId}
            onChange={e => setSelectedClassId(e.target.value)}
            className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 bg-white transition-all"
          >
            <option value="">— Choose a class to manage notes —</option>
            {myClasses.map(cls => (
              <option key={cls.id} value={cls.id}>
                {cls.title} · {cls.subject} · {cls.date}
              </option>
            ))}
          </select>
        )}
        {selectedClass && (
          <div className="mt-3 flex flex-wrap gap-3 text-xs text-dim">
            <span className="inline-flex items-center gap-1">📅 {selectedClass.date} at {selectedClass.time}</span>
            <span className="inline-flex items-center gap-1">👥 {selectedClass.enrolled}/{selectedClass.seats} enrolled</span>
            <span className="inline-flex items-center gap-1">📍 {selectedClass.location || selectedClass.meetingLink}</span>
          </div>
        )}
      </div>

      {/* Upload + file list — shown only after selecting a class */}
      {selectedClassId && (
        <>
          {/* Success banner */}
          {successMsg && (
            <div className="mb-4 flex items-center gap-3 px-5 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-ok font-semibold shadow-sm">
              <span>✓</span> {successMsg}
            </div>
          )}

          {/* Upload dropzone */}
          <div className="bg-white border border-rim rounded-2xl p-6 shadow-sm mb-6">
            <h2 className="font-bold text-ink text-base mb-4">Upload PDF Notes</h2>
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !uploading && fileRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer select-none transition-all duration-200 ${
                dragging
                  ? 'border-primary bg-sky-50 scale-[1.01]'
                  : 'border-slate-200 hover:border-primary/50 hover:bg-sky-50/40'
              }`}
            >
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleInput}
              />
              {uploading ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 border-[3px] border-primary/25 border-t-primary rounded-full animate-spin" />
                  <p className="text-sm text-primary font-semibold">Uploading "{uploadFileName}"…</p>
                  <p className="text-xs text-dim">Please wait</p>
                </div>
              ) : (
                <>
                  <div className="text-6xl mb-4">📑</div>
                  <p className="text-base font-semibold text-ink mb-1.5">
                    {dragging ? 'Drop your PDF here!' : 'Drag & drop a PDF or click to browse'}
                  </p>
                  <p className="text-xs text-dim">PDF files only · Max 20 MB per file</p>
                  <div className="mt-4 inline-flex items-center gap-2 px-5 py-2 bg-primary text-white text-xs font-bold rounded-lg shadow-sm pointer-events-none">
                    📂 Browse Files
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Uploaded files list */}
          <div className="bg-white border border-rim rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-ink text-base">Uploaded Files</h2>
              <span className="text-xs text-dim bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
                {notes.length} file{notes.length !== 1 ? 's' : ''}
              </span>
            </div>

            {notes.length === 0 ? (
              <div className="text-center py-12 text-dim">
                <p className="text-4xl mb-3">📭</p>
                <p className="text-sm font-medium">No files uploaded for this class yet.</p>
                <p className="text-xs mt-1">Upload a PDF above and it will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notes.map(note => (
                  <div
                    key={note.id}
                    className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-primary/20 hover:bg-sky-50/40 transition-all"
                  >
                    <div className="w-11 h-11 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
                      <PdfIcon />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-ink truncate">{note.fileName}</p>
                      <p className="text-xs text-dim mt-0.5">
                        {formatSize(note.size)} · Uploaded {note.uploadedAt}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDownload(note)}
                        className="flex items-center gap-1.5 text-xs text-primary font-bold px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                      >
                        ⬇&#xFE0E; Preview
                      </button>
                      <button
                        onClick={() => handleDelete(note.id)}
                        className="text-xs text-err font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition-all"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
