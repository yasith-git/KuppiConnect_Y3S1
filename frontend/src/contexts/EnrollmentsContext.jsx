import { createContext, useContext, useState, useEffect } from 'react';

const EnrollmentsContext = createContext(null);
const LS_KEY = 'kuppi_student_enrollments';

function load() {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return [];
}

function save(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

export function EnrollmentsProvider({ children }) {
  const [enrollments, setEnrollments] = useState(load);

  // Sync across browser tabs: when localStorage is updated in another tab,
  // immediately reflect the new enrollments here (conductor sees student's registration live)
  useEffect(() => {
    function handleStorage(e) {
      if (e.key === LS_KEY && e.newValue) {
        try { setEnrollments(JSON.parse(e.newValue)); } catch {}
      }
    }
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  function enroll(cls, studentData) {
    const newEnrollment = {
      id: Date.now(),
      classId: cls.id,
      studentId: studentData.id,
      studentName: studentData.name,
      email: studentData.email,
      phone: studentData.phone || '',
      registeredAt: new Date().toISOString().split('T')[0],
      classTitle: cls.title,
      classSubject: cls.subject,
      classDate: cls.date,
      classTime: cls.time,
      classFee: cls.fee,
      classMeetingLink: cls.meetingLink || cls.location || '',
      conductor: cls.conductor,
      conductorId: cls.conductorId,
    };
    const next = [...enrollments, newEnrollment];
    setEnrollments(next);
    save(next);
    return newEnrollment;
  }

  function unenroll(enrollmentId) {
    const next = enrollments.filter(e => e.id !== enrollmentId);
    setEnrollments(next);
    save(next);
  }

  function isEnrolled(classId, studentId) {
    if (!studentId) return false;
    return enrollments.some(e => e.classId === classId && e.studentId === studentId);
  }

  function getStudentEnrollments(studentId) {
    if (!studentId) return [];
    return enrollments.filter(e => e.studentId === studentId);
  }

  function getConductorEnrollments(conductorId) {
    if (!conductorId) return [];
    return enrollments.filter(e => e.conductorId === conductorId);
  }

  return (
    <EnrollmentsContext.Provider value={{ enrollments, enroll, unenroll, isEnrolled, getStudentEnrollments, getConductorEnrollments }}>
      {children}
    </EnrollmentsContext.Provider>
  );
}

export function useEnrollments() {
  const ctx = useContext(EnrollmentsContext);
  if (!ctx) throw new Error('useEnrollments must be used inside EnrollmentsProvider');
  return ctx;
}
