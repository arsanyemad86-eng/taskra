import { useCallback } from 'react';
import { useLocalStorage, uid } from './useLocalStorage.js';

const STORAGE_KEY = 'taskra_notes';

export function useNotes() {
  const [notes, setNotes] = useLocalStorage(STORAGE_KEY, []);

  const addNote = useCallback(
    ({ title, category = 'Other', content = '' }) => {
      if (!title?.trim()) return;
      const newNote = {
        id: uid(),
        title: title.trim(),
        category,
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotes((prev) => [newNote, ...prev]);
    },
    [setNotes]
  );

  const updateNote = useCallback(
    (id, patch) => {
      setNotes((prev) =>
        prev.map((n) =>
          n.id === id
            ? { ...n, ...patch, updatedAt: new Date().toISOString() }
            : n
        )
      );
    },
    [setNotes]
  );

  const deleteNote = useCallback(
    (id) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotes]
  );

  return { notes, addNote, updateNote, deleteNote };
}
