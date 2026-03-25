import { useState } from 'react';

/* ── Template-based AI comment analyser ── */
function analyseComments(comments) {
  if (!comments?.length) return null;

  const flatTexts = [];
  function collect(list) {
    list.forEach(c => {
      if (c.text) flatTexts.push(c.text.toLowerCase());
      if (c.replies?.length) collect(c.replies);
    });
  }
  collect(comments);

  const joined = flatTexts.join(' ');
  const total  = flatTexts.length;

  /* Keyword scoring */
  const POS = ['excellent', 'great', 'good', 'helpful', 'clear', 'best', 'amazing', 'wonderful', 'love', 'perfect',
               'understand', 'easy', 'fantastic', 'awesome', 'brilliant', 'enjoyed', 'impressed', 'recommend'];
  const NEG = ['difficult', 'confusing', 'hard', 'bad', 'poor', 'slow', 'boring', 'unclear', 'complicated',
               'struggle', 'lost', 'confused', 'disappointed', 'waste', 'rushed'];
  const SUG = ['suggest', 'improve', 'should', 'could', 'maybe', 'hope', 'wish', 'better', 'more examples'];

  let pos = 0, neg = 0, sug = 0;
  POS.forEach(w => { if (joined.includes(w)) pos++; });
  NEG.forEach(w => { if (joined.includes(w)) neg++; });
  SUG.forEach(w => { if (joined.includes(w)) sug++; });

  const total_signals = pos + neg + sug || 1;
  const posPct = Math.round((pos / total_signals) * 100);
  const negPct = Math.round((neg / total_signals) * 100);
  const sugPct = Math.max(0, 100 - posPct - negPct);

  /* Sentiment label */
  let label, icon, color;
  if (posPct >= 60) { label = 'Very Positive'; icon = '🌟'; color = 'text-ok'; }
  else if (posPct >= 40) { label = 'Mostly Positive'; icon = '👍'; color = 'text-ok'; }
  else if (neg >= pos) { label = 'Needs Improvement'; icon = '⚠️'; color = 'text-err'; }
  else { label = 'Mixed Feedback'; icon = '🤔'; color = 'text-amber-600'; }

  /* Detect key themes */
  const themes = [];
  if (joined.match(/explain|clear|understand/)) themes.push('Explanation Quality');
  if (joined.match(/pace|speed|slow|fast/)) themes.push('Teaching Pace');
  if (joined.match(/content|material|topic|syllabus/)) themes.push('Content Depth');
  if (joined.match(/example|practice|problem|exercise/)) themes.push('Practical Examples');
  if (joined.match(/time|duration|long|short/)) themes.push('Session Duration');
  if (joined.match(/helpful|useful|informative/)) themes.push('Helpfulness');
  if (joined.match(/interact|engage|question|doubt/)) themes.push('Student Interaction');
  if (joined.match(/note|slide|pdf|material/)) themes.push('Study Materials');
  if (themes.length === 0) themes.push('General Experience', 'Teaching Quality');

  /* Summary paragraph */
  const summary = posPct >= 40
    ? `Students are responding positively to this class. The majority of comments reflect satisfaction with the teaching experience and content delivery.${sug > 0 ? ' A few students also offered constructive suggestions for further improvement.' : ''} Overall this class is well-regarded within the student community, which speaks to the conductor's effectiveness.`
    : `Student feedback for this class shows mixed or critical sentiments. Some students appreciate the session content, while others have highlighted areas that need attention.${sug > 0 ? ' Several constructive suggestions were noted and may be worth reviewing.' : ''} The conductor may benefit from addressing the specific concerns raised in the discussion below.`;

  return { total, posPct, negPct, sugPct, label, icon, color, themes, summary };
}

export default function AISummary({ classId }) {
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(false);
  const [generated, setGenerated] = useState(false);
  const [progress, setProgress]   = useState(0);

  function generate() {
    setLoading(true);
    setProgress(0);

    /* Simulate progressive loading */
    const ticks = [20, 45, 70, 90, 100];
    ticks.forEach((val, i) => {
      setTimeout(() => setProgress(val), (i + 1) * 320);
    });

    setTimeout(() => {
      try {
        const raw  = localStorage.getItem(`kuppi_comments_${classId}`);
        const data = raw ? JSON.parse(raw) : [];
        setResult(analyseComments(data));
      } catch {
        setResult(null);
      }
      setLoading(false);
      setGenerated(true);
    }, 1900);
  }

  function reset() { setGenerated(false); setResult(null); setProgress(0); }

  return (
    <div className="bg-white border border-slate-100 rounded-2xl p-6 sm:p-7 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-2.5 mb-1">
        <h2 className="font-bold text-ink text-lg">🤖 AI Comment Analysis</h2>
        <span className="bg-gradient-to-r from-violet-500 to-purple-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full leading-none">
          AI Powered
        </span>
      </div>
      <p className="text-dim text-xs mb-6">
        Our AI analyses all student comments and generates a sentiment summary to give conductors and students a quick overview of class feedback.
      </p>

      {/* Pre-generate state */}
      {!generated && !loading && (
        <div className="flex flex-col items-center text-center py-10">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 flex items-center justify-center text-4xl mb-5 shadow-sm">
            🧠
          </div>
          <p className="text-sm font-semibold text-ink mb-1">Ready to analyse student feedback</p>
          <p className="text-xs text-dim mb-7 max-w-xs">
            Click below to get an AI-generated summary of all discussion comments for this class.
          </p>
          <button
            onClick={generate}
            className="px-8 py-3 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold rounded-xl text-sm transition-all shadow-md hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] hover:-translate-y-0.5"
          >
            ✨ Generate AI Summary
          </button>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="py-10">
          <div className="flex flex-col items-center gap-4 mb-6">
            <div className="w-12 h-12 border-[3px] border-violet-200 border-t-violet-500 rounded-full animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-ink">Analysing comments…</p>
              <p className="text-xs text-dim mt-0.5">Reading sentiment patterns and key themes</p>
            </div>
          </div>
          <div className="max-w-xs mx-auto">
            <div className="flex justify-between text-xs text-dim mb-1.5">
              <span>Analysis progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-400 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 space-y-1">
              {[
                { done: progress >= 20, label: 'Loading comment data' },
                { done: progress >= 45, label: 'Tokenising text' },
                { done: progress >= 70, label: 'Scoring sentiment signals' },
                { done: progress >= 90, label: 'Identifying key themes' },
                { done: progress >= 100, label: 'Composing summary' },
              ].map(({ done, label }) => (
                <div key={label} className="flex items-center gap-2 text-xs">
                  <span className={done ? 'text-ok' : 'text-slate-300'}>{done ? '✓' : '○'}</span>
                  <span className={done ? 'text-sub' : 'text-slate-300'}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* No comments result */}
      {generated && !loading && !result && (
        <div className="flex flex-col items-center text-center py-10 text-dim">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-sm font-semibold text-ink">No comments to analyse yet.</p>
          <p className="text-xs mt-1">Once students post comments, the AI can generate a summary.</p>
          <button onClick={reset} className="mt-4 text-xs text-primary hover:underline font-medium">
            ↺ Try again
          </button>
        </div>
      )}

      {/* Results */}
      {generated && !loading && result && (
        <div className="space-y-5">
          {/* Sentiment banner */}
          <div className={`flex items-center gap-4 p-5 rounded-2xl border ${
            result.posPct >= result.negPct
              ? 'bg-green-50 border-green-200'
              : result.negPct > 50
              ? 'bg-red-50 border-red-200'
              : 'bg-amber-50 border-amber-200'
          }`}>
            <span className="text-4xl">{result.icon}</span>
            <div>
              <p className={`font-extrabold text-lg leading-tight ${result.color}`}>{result.label}</p>
              <p className="text-xs text-dim mt-0.5">
                Based on {result.total} comment{result.total !== 1 ? 's' : ''} analysed
              </p>
            </div>
          </div>

          {/* Sentiment bars */}
          <div>
            <p className="text-xs font-bold text-ink uppercase tracking-widest mb-3">Sentiment Breakdown</p>
            <div className="space-y-3">
              {[
                { label: 'Positive',     pct: result.posPct, barColor: 'bg-ok',       textColor: 'text-ok' },
                { label: 'Suggestions',  pct: result.sugPct, barColor: 'bg-amber-400', textColor: 'text-amber-600' },
                { label: 'Critical',     pct: result.negPct, barColor: 'bg-err',       textColor: 'text-err' },
              ].map(({ label, pct, barColor, textColor }) => (
                <div key={label}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-sub">{label}</span>
                    <span className={`font-bold ${textColor}`}>{pct}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${barColor} rounded-full transition-all duration-1000`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Key themes */}
          <div>
            <p className="text-xs font-bold text-ink uppercase tracking-widest mb-2.5">Key Discussion Themes</p>
            <div className="flex flex-wrap gap-2">
              {result.themes.map(t => (
                <span
                  key={t}
                  className="bg-violet-50 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-violet-200"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Summary paragraph */}
          <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-2xl p-5">
            <p className="text-xs font-bold text-violet-700 uppercase tracking-widest mb-2.5">📋 AI Summary</p>
            <p className="text-sm text-sub leading-relaxed">{result.summary}</p>
          </div>

          {/* Disclaimer */}
          <p className="text-[11px] text-dim text-center">
            This summary is AI-generated based on keyword analysis of student comments. Results are indicative only.
          </p>

          <div className="text-center">
            <button
              onClick={reset}
              className="text-xs text-dim hover:text-primary transition-colors font-medium"
            >
              ↺ Regenerate analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
