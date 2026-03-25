import { createContext, useContext, useState } from 'react';
import { dummyAnnouncements } from '../data/dummyData';

const AnnouncementsContext = createContext(null);
const LS_KEY = 'kuppi_announcements';

function load() {
  try {
    const s = localStorage.getItem(LS_KEY);
    if (s) return JSON.parse(s);
  } catch {}
  return dummyAnnouncements;
}

function save(list) {
  try { localStorage.setItem(LS_KEY, JSON.stringify(list)); } catch {}
}

export function AnnouncementsProvider({ children }) {
  const [announcements, setAnnouncements] = useState(load);

  function addAnnouncement(data, conductorId) {
    const newAnn = {
      id: Date.now(),
      conductorId,
      title: data.title,
      body: data.description,
      description: data.description,
      image: data.imagePreview || null,
      date: new Date().toISOString().split('T')[0],
      startDate: data.startDate,
      endDate: data.endDate,
      pinned: false,
    };
    setAnnouncements(prev => {
      const next = [newAnn, ...prev];
      save(next);
      return next;
    });
    return newAnn;
  }

  function updateAnnouncement(id, data) {
    setAnnouncements(prev => {
      const next = prev.map(a =>
        a.id === id
          ? {
              ...a,
              title: data.title,
              body: data.description,
              description: data.description,
              image: data.imagePreview !== undefined ? data.imagePreview : a.image,
              startDate: data.startDate,
              endDate: data.endDate,
            }
          : a
      );
      save(next);
      return next;
    });
  }

  function deleteAnnouncement(id) {
    setAnnouncements(prev => {
      const next = prev.filter(a => a.id !== id);
      save(next);
      return next;
    });
  }

  return (
    <AnnouncementsContext.Provider value={{ announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement }}>
      {children}
    </AnnouncementsContext.Provider>
  );
}

export function useAnnouncements() {
  const ctx = useContext(AnnouncementsContext);
  if (!ctx) throw new Error('useAnnouncements must be used inside AnnouncementsProvider');
  return ctx;
}
