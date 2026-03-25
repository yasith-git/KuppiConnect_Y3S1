import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../auth/AuthContext';

/* ── Helpers ── */
function timeAgo(ts) {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function pushNotification(conductorId, classId, authorName, preview) {
  try {
    const key = `kuppi_notifications_${conductorId}`;
    const existing = localStorage.getItem(key);
    const list = existing ? JSON.parse(existing) : [];
    list.unshift({
      id: Date.now(),
      classId,
      type: 'comment',
      message: `${authorName} commented on your class`,
      preview: preview?.slice(0, 70) || 'Attached an image',
      timestamp: Date.now(),
      read: false,
    });
    localStorage.setItem(key, JSON.stringify(list.slice(0, 50)));
  } catch { /* silent */ }
}

/* ── Avatar ── */
function Avatar({ name, role, size = 9 }) {
  return (
    <div
      className={`w-${size} h-${size} rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm ${
        role === 'conductor'
          ? 'bg-gradient-to-br from-amber-400 to-orange-500'
          : 'bg-gradient-to-br from-sky-400 to-primary'
      }`}
    >
      {name?.charAt(0)?.toUpperCase() ?? '?'}
    </div>
  );
}

/* ── Comment Input Box ── */
function CommentInput({ onPost, placeholder = 'Share your thoughts about this class...', autoFocus = false, compact = false }) {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [imgName, setImgName] = useState('');
  const [posting, setPosting] = useState(false);
  const fileRef = useRef();

  function handleImageSelect(e) {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    if (file.size > 5 * 1024 * 1024) { alert('Image must be under 5MB.'); return; }
    setImgName(file.name);
    const reader = new FileReader();
    reader.onload = ev => setImage(ev.target.result);
    reader.readAsDataURL(file);
  }

  function removeImage() { setImage(null); setImgName(''); if (fileRef.current) fileRef.current.value = ''; }

  function handlePost() {
    if (!text.trim() && !image) return;
    setPosting(true);
    setTimeout(() => {
      onPost({ text: text.trim(), image });
      setText('');
      removeImage();
      setPosting(false);
    }, 350);
  }

  if (!user) return null;

  return (
    <div className={`flex gap-3 ${compact ? '' : ''}`}>
      <Avatar name={user.name} role={user.role} size={compact ? 8 : 9} />
      <div className="flex-1">
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          rows={compact ? 2 : 3}
          onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handlePost(); }}
          className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 resize-none transition-all placeholder:text-slate-400"
        />
        {image && (
          <div className="mt-2 relative inline-block">
            <img src={image} alt="preview" className="h-24 rounded-xl border border-slate-200 object-cover shadow-sm" />
            <button
              onClick={removeImage}
              className="absolute -top-2 -right-2 w-5 h-5 bg-err text-white rounded-full text-xs flex items-center justify-center hover:bg-red-700 transition-colors shadow"
            >×</button>
          </div>
        )}
        <div className="flex items-center justify-between mt-2.5 gap-2">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex items-center gap-1.5 text-xs text-dim hover:text-primary transition-colors px-3 py-1.5 rounded-lg hover:bg-sky-50 border border-slate-200 hover:border-sky-200"
          >
            🖼️ {imgName ? <span className="max-w-[120px] truncate">{imgName}</span> : 'Attach Image'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-dim hidden sm:block">Ctrl+Enter to post</span>
            <button
              onClick={handlePost}
              disabled={(!text.trim() && !image) || posting}
              className="px-5 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-lg transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {posting ? 'Posting…' : 'Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Single Comment Card ── */
function CommentCard({ comment, conductorId, onReply, depth = 0 }) {
  const { user } = useAuth();
  const [showReply, setShowReply] = useState(false);
  const isOwnComment = user?.id === comment.authorId;

  return (
    <div className={depth > 0 ? 'ml-10 sm:ml-12 pl-4 border-l-2 border-sky-100' : ''}>
      <div className="flex gap-3">
        <Avatar name={comment.authorName} role={comment.authorRole} />
        <div className="flex-1 min-w-0">
          {/* Bubble */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
            <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
              <span className="text-xs font-bold text-ink">{comment.authorName}</span>
              {comment.authorRole === 'conductor' && (
                <span className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200 leading-none">
                  Conductor
                </span>
              )}
              {isOwnComment && (
                <span className="bg-sky-50 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full border border-sky-200 leading-none">
                  You
                </span>
              )}
              <span className="text-[11px] text-dim ml-auto">{timeAgo(comment.timestamp)}</span>
            </div>
            {comment.text && (
              <p className="text-sm text-sub leading-relaxed whitespace-pre-wrap">{comment.text}</p>
            )}
            {comment.image && (
              <img
                src={comment.image}
                alt="attachment"
                className="mt-2.5 max-h-52 max-w-full rounded-xl border border-slate-200 object-cover"
              />
            )}
          </div>

          {/* Actions */}
          {user && depth < 2 && (
            <button
              onClick={() => setShowReply(v => !v)}
              className="text-[11px] text-dim hover:text-primary font-semibold mt-1.5 ml-1 transition-colors"
            >
              {showReply ? 'Cancel' : '↩ Reply'}
            </button>
          )}

          {/* Reply input */}
          {showReply && (
            <div className="mt-3">
              <CommentInput
                placeholder={`Reply to ${comment.authorName}…`}
                autoFocus
                compact
                onPost={data => { onReply(comment.id, data); setShowReply(false); }}
              />
            </div>
          )}

          {/* Nested replies */}
          {comment.replies?.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentCard
                  key={reply.id}
                  comment={reply}
                  conductorId={conductorId}
                  onReply={onReply}
                  depth={depth + 1}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main Comments Component ── */
export default function Comments({ classId, conductorId }) {
  const { user } = useAuth();
  const [comments, setComments] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`kuppi_comments_${classId}`);
      if (raw) setComments(JSON.parse(raw));
    } catch { /* silent */ }
  }, [classId]);

  function persist(updated) {
    setComments(updated);
    localStorage.setItem(`kuppi_comments_${classId}`, JSON.stringify(updated));
  }

  function handlePost({ text, image }) {
    const entry = {
      id: Date.now(),
      classId,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role,
      text,
      image,
      timestamp: Date.now(),
      replies: [],
    };
    persist([entry, ...comments]);
    if (user.role !== 'conductor') {
      pushNotification(conductorId, classId, user.name, text);
    }
  }

  function handleReply(parentId, { text, image }) {
    function addReplyTo(list) {
      return list.map(c => {
        if (c.id === parentId) {
          return {
            ...c,
            replies: [
              ...(c.replies || []),
              {
                id: Date.now(),
                classId,
                authorId: user.id,
                authorName: user.name,
                authorRole: user.role,
                text,
                image,
                timestamp: Date.now(),
                replies: [],
                parentId,
              },
            ],
          };
        }
        if (c.replies?.length) return { ...c, replies: addReplyTo(c.replies) };
        return c;
      });
    }
    persist(addReplyTo(comments));
    if (user.role !== 'conductor') {
      pushNotification(conductorId, classId, user.name, text);
    }
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0);

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <h2 className="font-bold text-ink text-lg">💬 Discussion</h2>
          {totalCount > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2.5 py-0.5 rounded-full border border-primary/20">
              {totalCount}
            </span>
          )}
        </div>
        <span className="text-xs text-dim bg-slate-50 border border-slate-100 px-3 py-1 rounded-full">
          Students &amp; conductors can comment and reply
        </span>
      </div>

      {/* Input */}
      {user ? (
        <div className="mb-8">
          <CommentInput onPost={handlePost} />
        </div>
      ) : (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-200 rounded-xl text-sm text-sub text-center">
          <a href="/login" className="text-primary font-semibold hover:underline">Sign in</a>
          {' '}to join the discussion.
        </div>
      )}

      {/* Comments list */}
      {comments.length === 0 ? (
        <div className="text-center py-12 text-dim">
          <p className="text-5xl mb-3">💭</p>
          <p className="text-sm font-semibold text-ink">No comments yet.</p>
          <p className="text-xs mt-1">Be the first to share your thoughts about this class!</p>
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(c => (
            <CommentCard
              key={c.id}
              comment={c}
              conductorId={conductorId}
              onReply={handleReply}
            />
          ))}
        </div>
      )}
    </div>
  );
}
