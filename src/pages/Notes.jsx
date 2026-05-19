import { useState } from 'react';
import { useNotes } from '../hooks/useNotes.js';
import './Notes.css';

const CATEGORIES = ['Work', 'Personal', 'Learning', 'Other'];
const blankForm = { title: '', category: 'Work', content: '' };

export default function Notes() {
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const [editing, setEditing] = useState(null); // note id or 'new' or null
  const [form, setForm] = useState(blankForm);
  const [viewing, setViewing] = useState(null); // for read-only modal

  const openNew = () => {
    setForm(blankForm);
    setEditing('new');
  };

  const openEdit = (note) => {
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

  const submit = (e) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    if (editing === 'new') {
      addNote(form);
    } else {
      updateNote(editing, form);
    }
    closeForm();
  };

  return (
    <div className="notes-page">
      <div className="page-header">
        <div>
          <h1>Notes</h1>
          <p className="subtitle">Capture thoughts before they fade.</p>
        </div>
        <button className="btn btn-primary" onClick={openNew}>
          + New Note
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="card empty">No notes yet. Start writing! 📝</div>
      ) : (
        <div className="notes-grid">
          {notes.map((n) => (
            <article
              key={n.id}
              className="note-card card"
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
                  className="btn btn-danger note-delete"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteNote(n.id);
                  }}
                >
                  Delete
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
    </div>
  );
}

function formatDate(iso) {
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
