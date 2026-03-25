import { createContext, useContext, useState } from 'react';
import { dummyClasses } from '../data/dummyData';

const ClassesContext = createContext(null);
const LS_KEY = 'kuppi_classes';

function load() {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return dummyClasses;
}

function save(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

export function ClassesProvider({ children }) {
  const [classes, setClasses] = useState(load);

  function addClass(data, conductorUser) {
    const newCls = {
      id: Date.now(),
      conductorId: conductorUser?.id,
      conductor: conductorUser?.name ?? '',
      title: data.title,
      subject: data.subject,
      date: data.date,
      time: data.time,
      seats: Number(data.seats),
      enrolled: 0,
      fee: Number(data.fee) || 0,
      location: data.meetingLink,
      meetingLink: data.meetingLink,
      duration: data.duration || '',
      description: data.description,
    };
    setClasses(prev => {
      const next = [newCls, ...prev];
      save(next);
      return next;
    });
    return newCls;
  }

  function updateClass(id, data) {
    setClasses(prev => {
      const next = prev.map(c =>
        c.id === Number(id)
          ? {
              ...c,
              title: data.title,
              subject: data.subject,
              date: data.date,
              time: data.time,
              seats: Number(data.seats),
              location: data.meetingLink,
              meetingLink: data.meetingLink,
              fee: Number(data.fee) || c.fee,
              duration: data.duration || c.duration,
              description: data.description,
            }
          : c
      );
      save(next);
      return next;
    });
  }

  function deleteClass(id) {
    setClasses(prev => {
      const next = prev.filter(c => c.id !== Number(id));
      save(next);
      return next;
    });
  }

  function incrementEnrolled(classId) {
    setClasses(prev => {
      const next = prev.map(c =>
        c.id === Number(classId) ? { ...c, enrolled: (c.enrolled || 0) + 1 } : c
      );
      save(next);
      return next;
    });
  }

  function decrementEnrolled(classId) {
    setClasses(prev => {
      const next = prev.map(c =>
        c.id === Number(classId) ? { ...c, enrolled: Math.max(0, (c.enrolled || 0) - 1) } : c
      );
      save(next);
      return next;
    });
  }

  return (
    <ClassesContext.Provider value={{ classes, addClass, updateClass, deleteClass, incrementEnrolled, decrementEnrolled }}>
      {children}
    </ClassesContext.Provider>
  );
}

export function useClasses() {
  const ctx = useContext(ClassesContext);
  if (!ctx) throw new Error('useClasses must be used inside ClassesProvider');
  return ctx;
}
