import { useCallback } from 'react';
import { useLocalStorage, uid } from './useLocalStorage.ts';
import type { Note } from '../types/index.ts';

const STORAGE_KEY = 'taskra_notes';

interface NewNoteInput {
  title: string;
  category?: string;
  content?: string;
}

export function useNotes() {
  const [notes, setNotes] = useLocalStorage<Note[]>(STORAGE_KEY, []);

  const addNote = useCallback(
    ({ title, category = 'Other', content = '' }: NewNoteInput) => {
      if (!title?.trim()) return;
      const newNote: Note = {
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

  // Partial<Note>: نفس فكرة Partial<Task> في useTasks - "تعديل جزئي"
  // مش لازم يحتوي كل خصائص Note.
  const updateNote = useCallback(
    (id: string, patch: Partial<Note>) => {
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
    (id: string) => {
      setNotes((prev) => prev.filter((n) => n.id !== id));
    },
    [setNotes]
  );

  return { notes, addNote, updateNote, deleteNote };
}
