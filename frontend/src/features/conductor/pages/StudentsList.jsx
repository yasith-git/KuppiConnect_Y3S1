import { useState, useMemo } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { useClasses } from '../../../contexts/ClassesContext';
import { useEnrollments } from '../../../contexts/EnrollmentsContext';
import { dummyEnrollments } from '../../../data/dummyData';

function downloadCSV(rows, filename) {
  const header = ['Name', 'Email', 'Phone', 'Class', 'Registered At'];
  const lines = [header, ...rows.map(r => [r.name, r.email, r.phone || '—', r.className, r.registeredAt])];
  const csv = lines.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function StudentsList() {
  const { user } = useAuth();
  const { classes } = useClasses();
  const { enrollments } = useEnrollments();

  const [selectedClassId, setSelectedClassId] = useState('all');

  const myClasses = useMemo(
    () => classes.filter(c => c.conductorId === user?.id),
    [classes, user]
  );

  // Build full enrollment rows: merge dummy + real (context) enrollments, dedupe by classId+studentId
  const allRows = useMemo(() => {
    const myIds = new Set(myClasses.map(c => c.id));

    const toRow = (e) => {
      const cls = myClasses.find(c => c.id === e.classId);
      return {
        classId:      e.classId,
        className:    cls?.title ?? `Class #${e.classId}`,
        subject:      cls?.subject ?? '',
        name:         e.studentName,
        email:        e.email,
        phone:        e.phone || '—',
        registeredAt: e.registeredAt,
        _key:         `${e.classId}-${e.studentId ?? e.email}`,
      };
    };

    const dummyRows = dummyEnrollments
      .filter(e => myIds.has(e.classId))
      .map(toRow);

    const realRows = enrollments
      .filter(e => myIds.has(e.classId))
      .map(toRow);

    // Merge: real enrollments override dummy ones with same key
    const merged = new Map();
    [...dummyRows, ...realRows].forEach(r => merged.set(r._key, r));
    return Array.from(merged.values());
  }, [myClasses, enrollments]);

  const filtered = useMemo(() => {
    if (selectedClassId === 'all') return allRows;
    return allRows.filter(r => r.classId === Number(selectedClassId));
  }, [allRows, selectedClassId]);

  function handleDownload() {
    const filename =
      selectedClassId === 'all'
        ? 'all-students.csv'
        : `students-class-${selectedClassId}.csv`;
    downloadCSV(filtered, filename);
  }

  return (
    <div className="max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Conductor Portal</p>
        <h1 className="text-3xl font-bold text-ink">Registered Students</h1>
        <p className="text-sub text-sm mt-1">
          View students enrolled in your classes and export the list as CSV.
        </p>
      </div>

      {myClasses.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <span className="text-5xl block mb-4">👥</span>
          <p className="font-bold text-ink text-lg mb-2">No classes yet</p>
          <p className="text-sub text-sm">Create a class first to see enrolled students here.</p>
        </div>
      ) : (
        <>
          {/* Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            {/* Class filter */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-semibold text-ink shrink-0">Filter by class:</label>
              <select
                value={selectedClassId}
                onChange={e => setSelectedClassId(e.target.value)}
                className="text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all bg-white flex-1 sm:flex-none sm:min-w-[220px]"
              >
                <option value="all">All my classes ({allRows.length} students)</option>
                {myClasses.map(c => {
                  const count = allRows.filter(r => r.classId === c.id).length;
                  return (
                    <option key={c.id} value={c.id}>
                      {c.title} ({count})
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Download button */}
            <button
              onClick={handleDownload}
              disabled={filtered.length === 0}
              className="flex items-center gap-2 bg-ok hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-[0_4px_14px_rgba(5,150,105,0.35)]"
            >
              <span>📥</span> Download Excel / CSV
            </button>
          </div>

          {/* Summary cards per class */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {myClasses.map(c => {
              const count = allRows.filter(r => r.classId === c.id).length;
              const pct = Math.min(100, (count / Math.max(1, c.seats)) * 100);
              return (
                <button
                  key={c.id}
                  onClick={() => setSelectedClassId(String(c.id))}
                  className={`text-left p-4 rounded-2xl border transition-all shadow-sm ${
                    selectedClassId === String(c.id)
                      ? 'border-primary bg-sky-50 ring-2 ring-primary/10'
                      : 'border-slate-100 bg-white hover:border-primary/30 hover:bg-sky-50/50'
                  }`}
                >
                  <p className="font-bold text-ink text-sm leading-snug mb-1 line-clamp-2">{c.title}</p>
                  <p className="text-dim text-xs mb-2">{c.subject} · {c.date}</p>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-sub">{count} students</span>
                    <span className="font-bold text-primary">{c.seats} seats</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </button>
              );
            })}
          </div>

          {/* Students table */}
          <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-bold text-ink text-base">
                {selectedClassId === 'all'
                  ? `All Students (${filtered.length})`
                  : `${myClasses.find(c => c.id === Number(selectedClassId))?.title} — ${filtered.length} students`}
              </h2>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16">
                <span className="text-4xl block mb-3">🎓</span>
                <p className="font-bold text-ink mb-1">No students enrolled</p>
                <p className="text-sub text-sm">Students will appear here once they register.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-sky-50 border-b border-sky-100">
                      <th className="text-left px-6 py-3 text-xs font-bold text-dim uppercase tracking-wider">#</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-dim uppercase tracking-wider">Student</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-dim uppercase tracking-wider hidden sm:table-cell">Email</th>
                      <th className="text-left px-6 py-3 text-xs font-bold text-dim uppercase tracking-wider hidden md:table-cell">Phone</th>
                      {selectedClassId === 'all' && (
                        <th className="text-left px-6 py-3 text-xs font-bold text-dim uppercase tracking-wider hidden lg:table-cell">Class</th>
                      )}
                      <th className="text-left px-6 py-3 text-xs font-bold text-dim uppercase tracking-wider hidden xl:table-cell">Registered</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filtered.map((row, i) => (
                      <tr key={`${row.classId}-${row.email}`} className="hover:bg-sky-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm text-dim">{i + 1}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-sky-400 to-primary rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {row.name.charAt(0)}
                            </div>
                            <span className="font-semibold text-ink text-sm">{row.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-sub hidden sm:table-cell">{row.email}</td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          {row.phone && row.phone !== '—'
                            ? <a href={`tel:${row.phone}`} className="text-sm text-primary font-medium hover:underline">{row.phone}</a>
                            : <span className="text-dim text-sm">—</span>}
                        </td>
                        {selectedClassId === 'all' && (
                          <td className="px-6 py-4 hidden lg:table-cell">
                            <span className="text-xs font-semibold bg-sky-50 text-primary border border-sky-200 px-2.5 py-1 rounded-full">
                              {row.subject}
                            </span>
                          </td>
                        )}
                        <td className="px-6 py-4 text-xs text-dim hidden xl:table-cell">{row.registeredAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
