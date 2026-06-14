import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import { useNotes } from '../hooks/useNotes.ts';
import type { Note } from '../types/index.ts';
import './Notes.css';

const CATEGORIES = ['Work', 'Personal', 'Learning', 'Other'];
const FILTERS = [{ key: 'all', label: 'All' }, ...CATEGORIES.map((c) => ({ key: c, label: c }))];

interface NoteFormState {
  title: string;
  category: string;
  content: string;
}

const blankForm: NoteFormState = { title: '', category: 'Work', content: '' };

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  // editing: 'new' (فورم إضافة) | id لمذكرة قائمة (فورم تعديل) | null (مقفول).
  // الكتابة كـ `string | null` كافية لأن 'new' وأي id هما string بالأساس.
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<NoteFormState>(blankForm);
  // viewing: Note | null - المذكرة المعروضة في modal القراءة فقط.
  const [viewing, setViewing] = useState<Note | null>(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = notes;
    if (filter !== 'all') {
      list = list.filter((n) => n.category === filter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.content && n.content.toLowerCase().includes(q))
      );
    }
    return list;
  }, [notes, filter, search]);

  const openNew = () => {
    setForm(blankForm);
    setEditing('new');
  };

  const openEdit = (note: Note) => {
    setForm({
      title: note.title,
      category: note.category,
      content: note.content,
    });
    setEditing(note.id);
    setViewing(null);
  };

  const closeForm = () => {
    setEditing(null);
    setForm(blankForm);
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editing === 'new') {
      addNote(form);
    } else if (editing) {
      // `else if (editing)` بدل `else` بس - عشان TypeScript يتأكد إن
      // editing مش null هنا قبل تمريرها لـ updateNote اللي بتطلب string.
      updateNote(editing, form);
    }
    closeForm();
  };

  useEffect(() => {
    function onNewNote() {
      openNew();
    }
    function onEscape() {
      if (editing) {
        closeForm();
      } else if (viewing) {
        setViewing(null);
      }
    }
    function onSubmitShortcut() {
      if (!editing) return;
      if (!form.title.trim()) return;
      if (editing === 'new') {
        addNote(form);
      } else {
        updateNote(editing, form);
      }
      closeForm();
    }
    window.addEventListener('taskra:new-note', onNewNote);
    window.addEventListener('taskra:escape', onEscape);
    window.addEventListener('taskra:submit', onSubmitShortcut);
    return () => {
      window.removeEventListener('taskra:new-note', onNewNote);
      window.removeEventListener('taskra:escape', onEscape);
      window.removeEventListener('taskra:submit', onSubmitShortcut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing, viewing, form]);

  return (
    <motion.div
      className="notes-page"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="page-header">
        <div>
          <h1>Notes</h1>
          <p className="subtitle">Capture thoughts before they fade.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + New Note
        </button>
      </div>

      {notes.length > 0 && (
        <div className="toolbar">
          <div className="filter-tabs">
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`filter-tab${filter === f.key ? ' active' : ''}`}
                onClick={() => setFilter(f.key)}
              >
                {f.label}
              </button>
            ))}
          </div>
          <input
            className="input search-input"
            placeholder="Search notes…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      )}

      {notes.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">📝</div>
          <h3 className="empty-title">No notes yet</h3>
          <p className="empty-sub">Start writing down your thoughts and ideas.</p>
          <button className="btn btn-primary" onClick={openNew}>
            + New Note
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card empty-state">
          <div className="empty-icon">🔍</div>
          <h3 className="empty-title">No notes match this view</h3>
          <p className="empty-sub">Try a different filter or search term.</p>
          <button
            className="btn btn-primary"
            onClick={() => {
              setFilter('all');
              setSearch('');
            }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="notes-grid">
          {filtered.map((n) => (
            <article
              key={n.id}
              className="note-card card"
              data-category={n.category}
              onClick={() => setViewing(n)}
            >
              <div className="note-head">
                <h3 className="note-title">{n.title}</h3>
                <span className="badge badge-cat">{n.category}</span>
              </div>
              <p className="note-preview">
                {n.content
                  ? n.content.slice(0, 100) +
                    (n.content.length > 100 ? '…' : '')
                  : 'Empty note.'}
              </p>
              <div className="note-footer">
                <span className="note-date">{formatDate(n.createdAt)}</span>
                <button
                  className="note-delete-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(n.id);
                  }}
                  aria-label="Delete note"
                  title="Delete note"
                >
                  ✕
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* View modal */}
      {viewing && !editing && (
        <div className="modal-overlay" onClick={() => setViewing(null)}>
          <div className="modal note-view" onClick={(e) => e.stopPropagation()}>
            <div className="note-view-head">
              <h2 className="modal-title">{viewing.title}</h2>
              <span className="badge badge-cat">{viewing.category}</span>
            </div>
            <p className="note-view-date">{formatDate(viewing.createdAt)}</p>
            <div className="note-view-content">
              {viewing.content || (
                <span className="muted">No content.</span>
              )}
            </div>
            <div className="form-actions">
              <button className="btn" onClick={() => setViewing(null)}>
                Close
              </button>
              <button
                className="btn btn-primary"
                onClick={() => openEdit(viewing)}
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      {editing && (
        <div className="modal-overlay" onClick={closeForm}>
          <form
            className="modal"
            onClick={(e) => e.stopPropagation()}
            onSubmit={submit}
          >
            <h2 className="modal-title">
              {editing === 'new' ? 'New Note' : 'Edit Note'}
            </h2>
            <div className="form-row">
              <label>Title</label>
              <input
                className="input"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
                placeholder="Note title"
                autoFocus
              />
            </div>
            <div className="form-row">
              <label>Category</label>
              <select
                className="select"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <label>Content</label>
              <textarea
                className="textarea"
                rows={8}
                value={form.content}
                onChange={(e) =>
                  setForm((f) => ({ ...f, content: e.target.value }))
                }
                placeholder="Write here…"
              />
            </div>
            <div className="form-actions">
              <button type="button" className="btn" onClick={closeForm}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary">
                {editing === 'new' ? 'Save Note' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </motion.div>
  );
}

function formatDate(iso: string): string {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}
