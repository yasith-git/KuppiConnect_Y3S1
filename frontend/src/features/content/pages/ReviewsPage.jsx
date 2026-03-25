import { useState } from 'react';
import { useAuth } from '../../auth/AuthContext';
import { dummyReviews, dummyClasses } from '../../../data/dummyData';

function StarRow({ rating, interactive = false, onChange }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type={interactive ? 'button' : undefined}
          onClick={interactive ? () => onChange(n) : undefined}
          className={`text-xl transition-transform ${
            interactive ? 'hover:scale-110 cursor-pointer' : 'cursor-default pointer-events-none'
          } ${n <= rating ? 'opacity-100' : 'opacity-20'}`}
        >
          ⭐
        </button>
      ))}
    </div>
  );
}

function ReviewsPage() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState(dummyReviews);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ classId: '', rating: 5, comment: '' });

  const avgRating = (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1);

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.classId || !form.comment.trim()) return;
    setReviews(prev => [{
      id: Date.now(),
      classId: Number(form.classId),
      studentName: user?.name || 'Anonymous',
      rating: form.rating,
      comment: form.comment.trim(),
      date: new Date().toISOString().slice(0, 10),
    }, ...prev]);
    setForm({ classId: '', rating: 5, comment: '' });
    setShowForm(false);
  }

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <p className="text-primary text-xs font-bold uppercase tracking-widest mb-1">Community</p>
          <h1 className="text-3xl font-bold text-ink">Reviews & Ratings</h1>
          <p className="text-sub text-sm mt-1">See what students say about their kuppi classes.</p>
        </div>
        {user?.role === 'student' && (
          <button
            onClick={() => setShowForm(v => !v)}
            className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(13,148,136,0.4)]"
          >
            {showForm ? 'Cancel' : '+ Write Review'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Reviews',    value: reviews.length,                          icon: '💬' },
          { label: 'Average Rating',   value: `${avgRating} ★`,                       icon: '⭐' },
          { label: 'Classes Reviewed', value: new Set(reviews.map(r => r.classId)).size, icon: '🎓' },
        ].map(s => (
          <div key={s.label} className="bg-card border border-rim rounded-2xl p-5 flex items-center gap-4 hover:shadow-[0_4px_20px_rgba(13,148,136,0.12)] hover:border-primary/30 hover:-translate-y-0.5 transition-all">
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-2xl font-extrabold text-ink">{s.value}</p>
              <p className="text-dim text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Write review form */}
      {showForm && (
            <div className="bg-card border border-primary/30 rounded-2xl p-6 mb-6 shadow-[0_4px_20px_rgba(13,148,136,0.12)]">
          <h2 className="font-bold text-ink mb-4">Write a Review</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Select Class</label>
              <select
                value={form.classId}
                onChange={e => setForm({ ...form, classId: e.target.value })}
                className="w-full border border-field bg-white rounded-xl px-4 py-2.5 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40"
                required
              >
                <option value="">Choose a class…</option>
                {dummyClasses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Rating</label>
              <StarRow rating={form.rating} interactive onChange={r => setForm({ ...form, rating: r })} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-ink mb-1.5">Comment</label>
              <textarea
                value={form.comment}
                onChange={e => setForm({ ...form, comment: e.target.value })}
                placeholder="Share your experience with this class…"
                rows={3}
                className="w-full border border-field bg-white rounded-xl px-4 py-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white font-bold text-sm px-6 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-[0_4px_16px_rgba(13,148,136,0.4)]"
            >
              Submit Review
            </button>
          </form>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {reviews.map(review => {
          const cls = dummyClasses.find(c => c.id === review.classId);
          return (
            <div key={review.id} className="bg-card border border-rim rounded-2xl p-6 hover:shadow-[0_6px_25px_rgba(13,148,136,0.12)] hover:border-primary/25 hover:-translate-y-0.5 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {review.studentName.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-ink text-sm">{review.studentName}</p>
                    <p className="text-dim text-xs">{review.date}</p>
                  </div>
                </div>
                <StarRow rating={review.rating} />
              </div>
              {cls && <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-2">{cls.title}</p>}
              <p className="text-sub text-sm leading-relaxed">{review.comment}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default ReviewsPage;
