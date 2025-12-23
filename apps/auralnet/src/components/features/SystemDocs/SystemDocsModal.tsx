import React from 'react';
import { useStore } from '@nanostores/react';
import { isDocsModalOpen, activeDocId, closeDocsModal, openDoc } from '../../../stores/docsStore';
import { systemDocs } from './data/systemDocs';
import { docsNav } from './data/docsNavigation';
import GlassModal from '../../ui/glass/GlassModal';

const SystemDocsModal: React.FC = () => {
  const isOpen = useStore(isDocsModalOpen);
  const docId = useStore(activeDocId);

  const doc = docId ? systemDocs[docId] : null;

  // Even if no doc is selected, we might want to show the modal (e.g. default to first doc or empty state)
  // But typically docId is set when opening.
  // If !doc, we probably shouldn't render, but let's handle it gracefully.
  if (!isOpen) return null;

  return (
    <GlassModal
      isOpen={isOpen}
      onClose={closeDocsModal}
      title={doc?.title || 'System Documentation'}
      noContentPadding={true}
    >
      <div className="flex h-full">
        {/* Sidebar Navigation */}
        <div
          className={`custom-scrollbar flex-shrink-0 overflow-y-auto border-r border-white/5 bg-black/20 md:block md:w-64 ${doc ? 'hidden' : 'w-full'}`}
        >
          <div className="space-y-8 p-6">
            {docsNav.map((section) => (
              <div key={section.title}>
                <h3 className="text-accent mb-3 font-mono text-xs font-bold tracking-widest uppercase">
                  {section.title}
                </h3>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      {item.docId ? (
                        <button
                          onClick={() => openDoc(item.docId!)}
                          className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-all ${
                            docId === item.docId
                              ? 'bg-accent/10 text-accent border-accent/20 border font-bold'
                              : 'text-text-muted hover:text-text-light hover:bg-white/5'
                          }`}
                        >
                          {item.label}
                        </button>
                      ) : (
                        <a
                          href={item.href}
                          className="text-text-muted hover:text-text-light block w-full rounded-lg px-3 py-2 text-left text-sm transition-all hover:bg-white/5"
                        >
                          {item.label} ↗
                        </a>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div
          className={`custom-scrollbar flex-1 overflow-y-auto px-8 py-8 md:block ${doc ? 'block' : 'hidden'}`}
        >
          {doc ? (
            <div className="prose prose-invert prose-lg max-w-none">
              {/* Mobile Back Button */}
              <button
                onClick={() => activeDocId.set(null)}
                className="text-accent hover:text-accent/80 mb-6 flex items-center gap-2 text-sm transition-colors md:hidden"
              >
                ← Back to Menu
              </button>

              {doc.intro && (
                <p className="text-text-muted mb-8 border-b border-white/10 pb-6 text-xl leading-relaxed font-light">
                  {doc.intro}
                </p>
              )}

              <div className="space-y-10">
                {doc.sections.map((section, index) => (
                  <div key={index} className="space-y-4">
                    {section.title && (
                      <h3 className="text-text-light font-mono text-2xl font-bold">
                        {section.title}
                      </h3>
                    )}
                    <div
                      className="text-text-muted leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: section.content }}
                    />
                  </div>
                ))}
              </div>

              {doc.lastUpdated && (
                <div className="text-text-muted/50 mt-12 border-t border-white/5 pt-12 text-right font-mono text-xs">
                  Last Updated: {doc.lastUpdated}
                </div>
              )}
            </div>
          ) : (
            <div className="text-text-muted flex h-full items-center justify-center">
              <p>Select a document to view</p>
            </div>
          )}
        </div>
      </div>
    </GlassModal>
  );
};

export default SystemDocsModal;
