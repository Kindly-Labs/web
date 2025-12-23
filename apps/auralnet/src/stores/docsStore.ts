import { atom } from 'nanostores';

export const isDocsModalOpen = atom(false);
export const activeDocId = atom<string | null>(null);

export function openDoc(docId: string) {
  activeDocId.set(docId);
  isDocsModalOpen.set(true);
}

export function closeDocsModal() {
  isDocsModalOpen.set(false);
  // We don't clear activeDocId immediately to prevent content jumping during close animation
  setTimeout(() => activeDocId.set(null), 300);
}
