import React, { useState, useEffect } from 'react';
import { Copy, Check, Trash2, Pin } from 'lucide-react';

export const NotesView: React.FC = () => {
  const [note, setNote] = useState<string>(() => {
    return localStorage.getItem('aura_island_quick_note') || 'Review quarterly telemetry benchmarks · 4:00 PM';
  });
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    localStorage.setItem('aura_island_quick_note', note);
  }, [note]);

  const handleCopy = () => {
    navigator.clipboard.writeText(note);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setNote('');
  };

  const quickSnippets = [
    'Meeting link ready',
    'Follow up on deployment',
    'Review audio analyzer logs'
  ];

  return (
    <div className="w-full flex flex-col gap-3 text-slate-100">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Pin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Quick Scratchpad & Clipboard</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 text-xs rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            onClick={handleClear}
            className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-white/5 transition-colors"
            title="Clear"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Jot down quick thoughts, hex codes, or clipboard snippets..."
          rows={3}
          className="w-full bg-black/25 text-sm text-slate-100 rounded-xl p-3 border border-white/10 focus:outline-none focus:border-cyan-400/50 resize-none font-sans placeholder:text-slate-500 leading-relaxed"
        />
        <div className="absolute bottom-2.5 right-3 text-[10px] font-mono text-slate-500 tabular-nums">
          {note.length} chars
        </div>
      </div>

      {/* Quick Snippet Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pt-0.5">
        <span className="text-[10px] text-slate-400 shrink-0">Quick add:</span>
        {quickSnippets.map((snip, i) => (
          <button
            key={i}
            onClick={() => setNote(prev => prev ? `${prev} · ${snip}` : snip)}
            className="text-[11px] px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition-colors border border-white/5 whitespace-nowrap shrink-0"
          >
            + {snip}
          </button>
        ))}
      </div>
    </div>
  );
};
