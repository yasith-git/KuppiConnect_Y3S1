import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';

function formatSize(bytes) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function PdfIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export default function UploadNotes({ classId, conductorId }) {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadFileName, setUploadFileName] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const fileRef = useRef();

  const isConductor = user?.role === 'conductor' && String(user?.id) === String(conductorId);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`kuppi_notes_${classId}`);
      if (raw) setNotes(JSON.parse(raw));
    } catch { /* silent */ }
  }, [classId]);

  function persist(updated) {
    setNotes(updated);
    localStorage.setItem(`kuppi_notes_${classId}`, JSON.stringify(updated));
  }

  function processFile(file) {
    if (!file) return;
    if (file.type !== 'application/pdf') { alert('Only PDF files are allowed.'); return; }
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
        fileData: ev.target.result, // base64 — enables real download
      };
      persist([entry, ...notes]);
      setUploading(false);
      setUploadFileName('');
      setSuccessMsg(`"${file.name}" uploaded successfully!`);
      setTimeout(() => setSuccessMsg(''), 4000);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files?.[0]);
  }

  function handleFileInput(e) {
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
    if (!window.confirm('Delete this file?')) return;
    persist(notes.filter(n => n.id !== id));
  }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-3 mb-1">
        <h2 className="font-bold text-ink text-lg">📄 Class Notes</h2>
        {notes.length > 0 && (
          <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
            {notes.length} file{notes.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>
      <p className="text-dim text-xs mb-6">
        {isConductor
          ? 'Upload PDF notes for your students. They can download them anytime.'
          : 'Download PDF notes shared by your conductor.'}
      </p>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-ok font-semibold">
          ✓ {successMsg}
        </div>
      )}

      {/* Upload dropzone — conductor only */}
      {isConductor && (
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 mb-6 select-none ${
            dragging
              ? 'border-primary bg-sky-50 scale-[1.015]'
              : 'border-slate-200 hover:border-primary/50 hover:bg-sky-50/40'
          }`}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handleFileInput}
          />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-[3px] border-primary/25 border-t-primary rounded-full animate-spin" />
              <p className="text-sm text-primary font-semibold">Uploading "{uploadFileName}"…</p>
            </div>
          ) : (
            <>
              <div className="text-5xl mb-3">📑</div>
              <p className="text-sm font-semibold text-ink mb-1">
                {dragging ? 'Drop your PDF here!' : 'Drag & drop a PDF or click to browse'}
              </p>
              <p className="text-xs text-dim">PDF files only · Max 20 MB per file</p>
            </>
          )}
        </div>
      )}

      {/* Notes list */}
      {notes.length === 0 ? (
        <div className="text-center py-10 text-dim">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-sm font-medium">
            {isConductor ? 'No notes uploaded yet.' : 'No notes available for this class yet.'}
          </p>
          {!isConductor && (
            <p className="text-xs mt-1">Check back after the class — your conductor may upload notes.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map(note => (
            <div
              key={note.id}
              className="flex items-center gap-4 p-4 bg-slate-50 border border-slate-100 rounded-xl hover:border-primary/20 hover:bg-sky-50/40 transition-all group"
            >
              {/* Icon */}
              <div className="w-10 h-10 bg-red-50 border border-red-100 rounded-xl flex items-center justify-center shrink-0">
                <PdfIcon />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-ink truncate">{note.fileName}</p>
                <p className="text-xs text-dim mt-0.5">
                  {formatSize(note.size)} · Uploaded {note.uploadedAt}
                  {note.uploadedBy && ` by ${note.uploadedBy}`}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleDownload(note)}
                  className="flex items-center gap-1.5 text-xs text-primary font-bold px-3 py-1.5 bg-sky-50 border border-sky-200 rounded-lg hover:bg-primary hover:text-white hover:border-primary transition-all"
                >
                  ⬇&#xFE0E; Download
                </button>
                {isConductor && (
                  <button
                    onClick={() => handleDelete(note.id)}
                    className="text-xs text-err px-2.5 py-1.5 rounded-lg hover:bg-red-50 border border-transparent hover:border-red-200 transition-all font-medium"
                    title="Delete file"
                  >
                    🗑
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
