import React, { useState } from 'react';

// Mock Data for Prototype
const DIALECT_DATA = {
  name: 'Toishanese',
  nativeName: 'Hoisan-wa',
  history: {
    summary:
      'Spoken by the early Chinese immigrants who built the Transcontinental Railroad. Once the dominant Chinese dialect in North America, now fading.',
    link: 'https://www.history.com/articles/transcontinental-railroad-chinese-immigrants',
    linkText: 'Read: The Railroad Workers',
  },
  phrases: [
    { text: 'Ngei hai Toisan-ngin', translation: 'I am Toishanese', audio: '#' },
    { text: 'Ni gi mu a?', translation: 'Have you eaten yet?', audio: '#' },
  ],
  status: 'Pilot',
  votes: 1240,
};

export default function DialectContext() {
  const [activeTab, setActiveTab] = useState<'history' | 'phrases' | 'disclaimer'>('history');
  const [hasVoted, setHasVoted] = useState(false);

  return (
    <div className="glass-panel mx-auto mt-6 w-full max-w-sm overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-white/10">
        <button
          onClick={() => setActiveTab('history')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase ${activeTab === 'history' ? 'text-primary border-primary border-b-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab('phrases')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase ${activeTab === 'phrases' ? 'text-primary border-primary border-b-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Sound Check
        </button>
        <button
          onClick={() => setActiveTab('disclaimer')}
          className={`flex-1 py-3 text-xs font-semibold tracking-wider uppercase ${activeTab === 'disclaimer' ? 'text-primary border-primary border-b-2' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Guide
        </button>
      </div>

      {/* Content */}
      <div className="min-h-[200px] p-6">
        {activeTab === 'history' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-foreground mb-2 text-lg font-bold">
              {DIALECT_DATA.name} ({DIALECT_DATA.nativeName})
            </h3>
            <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
              {DIALECT_DATA.history.summary}
            </p>
            <a
              href={DIALECT_DATA.history.link}
              target="_blank"
              rel="noreferrer"
              className="text-primary inline-flex items-center text-xs font-bold transition-colors hover:opacity-80"
            >
              {DIALECT_DATA.history.linkText} →
            </a>
          </div>
        )}

        {activeTab === 'phrases' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3 duration-300">
            {DIALECT_DATA.phrases.map((phrase, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-3"
              >
                <div>
                  <p className="text-foreground text-sm font-medium">{phrase.text}</p>
                  <p className="text-muted-foreground text-xs">{phrase.translation}</p>
                </div>
                <button className="text-muted-foreground hover:text-primary flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/10 transition-colors">
                  ▶
                </button>
              </div>
            ))}
            <p className="text-muted-foreground mt-2 text-center text-[10px]">
              Audio samples provided by community elders.
            </p>
          </div>
        )}

        {activeTab === 'disclaimer' && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="mb-4 rounded-lg border border-amber-500/20 bg-amber-500/10 p-3">
              <h4 className="mb-1 text-xs font-bold text-amber-400 uppercase">
                Not a Language Coach
              </h4>
              <p className="text-xs leading-relaxed text-amber-300/80">
                Aether is a <strong>preservation archive</strong>, not a learning app. We capture
                the dialect to teach AI, not humans. To learn {DIALECT_DATA.name}, please hire a
                human master.
              </p>
            </div>
            <p className="text-muted-foreground text-center text-xs">
              We focus on data sovereignty and heritage preservation.
            </p>
          </div>
        )}
      </div>

      {/* Footer / Vote */}
      <div className="flex items-center justify-between border-t border-white/10 bg-white/5 p-4">
        <div className="text-xs">
          <span className="text-muted-foreground block font-bold tracking-wider uppercase">
            Community Rank
          </span>
          <span className="text-foreground font-mono font-medium">
            #{DIALECT_DATA.votes.toLocaleString()} Votes
          </span>
        </div>
        <button
          onClick={() => setHasVoted(true)}
          disabled={hasVoted}
          className={`rounded-full px-4 py-2 text-xs font-bold transition-all ${
            hasVoted
              ? 'cursor-default bg-green-500/20 text-green-400'
              : 'bg-primary shadow-primary/30 text-white shadow-lg hover:opacity-90'
          }`}
        >
          {hasVoted ? 'Voted ✓' : 'Support Dialect'}
        </button>
      </div>
    </div>
  );
}
