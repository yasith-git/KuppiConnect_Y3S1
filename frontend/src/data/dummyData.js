// Dummy data shared across the app

export const dummyUsers = [
  { id: 1, name: 'Alice Fernando', email: 'alice@student.com', password: 'student123', role: 'student' },
  { id: 2, name: 'Bob Perera', email: 'bob@student.com', password: 'student123', role: 'student' },
  { id: 3, name: 'Dr. Kamal Silva', email: 'kamal@conductor.com', password: 'conductor123', role: 'conductor' },
  { id: 4, name: 'Dr. Nimal Jayawardena', email: 'nimal@conductor.com', password: 'conductor123', role: 'conductor' },
];

export const dummyClasses = [
  { id: 1, title: 'Mathematics - Algebra Basics', conductor: 'Dr. Kamal Silva', subject: 'Mathematics', date: '2026-04-01', time: '10:00 AM', seats: 30, enrolled: 18, fee: 1500 },
  { id: 2, title: 'Physics - Mechanics', conductor: 'Dr. Nimal Jayawardena', subject: 'Physics', date: '2026-04-03', time: '02:00 PM', seats: 25, enrolled: 25, fee: 1500 },
  { id: 3, title: 'Chemistry - Organic Chemistry', conductor: 'Dr. Kamal Silva', subject: 'Chemistry', date: '2026-04-05', time: '09:00 AM', seats: 20, enrolled: 10, fee: 1200 },
  { id: 4, title: 'Biology - Cell Biology', conductor: 'Dr. Nimal Jayawardena', subject: 'Biology', date: '2026-04-07', time: '11:00 AM', seats: 35, enrolled: 30, fee: 1300 },
];

export const dummyAnnouncements = [
  { id: 1, title: 'Platform Launch!', body: 'KuppiConnect is now live. Register today to start learning.', date: '2026-03-24', pinned: true },
  { id: 2, title: 'April Schedule Released', body: 'The April class schedule has been published. Check available classes.', date: '2026-03-22', pinned: false },
  { id: 3, title: 'New Conductors Joined', body: 'Three new conductors have joined the platform this month.', date: '2026-03-20', pinned: false },
];

export const dummyContent = [
  { id: 1, classId: 1, title: 'Algebra Basics - Lecture Notes', type: 'PDF', url: '#', uploadedBy: 'Dr. Kamal Silva', uploadedAt: '2026-03-20' },
  { id: 2, classId: 1, title: 'Algebra Practice Problems', type: 'PDF', url: '#', uploadedBy: 'Dr. Kamal Silva', uploadedAt: '2026-03-21' },
  { id: 3, classId: 3, title: 'Organic Chemistry - Module 1', type: 'Video', url: '#', uploadedBy: 'Dr. Kamal Silva', uploadedAt: '2026-03-22' },
];

export const dummyReviews = [
  { id: 1, classId: 1, studentName: 'Alice Fernando', rating: 5, comment: 'Excellent explanations! Very clear and well-paced.', date: '2026-03-23' },
  { id: 2, classId: 1, studentName: 'Bob Perera', rating: 4, comment: 'Good class, would recommend to others.', date: '2026-03-23' },
  { id: 3, classId: 3, studentName: 'Alice Fernando', rating: 5, comment: 'Best chemistry class I have attended.', date: '2026-03-22' },
];
