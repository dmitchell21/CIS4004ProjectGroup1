import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

const STATUS_OPTIONS = [
  'watching',
  'completed',
  'plan to watch',
  'dropped',
  'reading',
  'plan to read',
]

const STATUS_COLORS = {
  'watching':       'bg-success',
  'completed':      'bg-primary',
  'plan to watch':  'bg-secondary',
  'dropped':        'bg-danger',
  'reading':        'bg-info text-dark',
  'plan to read':   'bg-warning text-dark',
}

export default function MyListPage() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  // editId = the _id of the entry currently being edited (null = none)
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({})

  useEffect(() => {
    api.get('/list')
      .then(res => setEntries(res.data))
      .catch(() => setError('Could not load your list.'))
      .finally(() => setLoading(false))
  }, [])

  // Open the inline edit form for an entry
  function startEdit(entry) {
    setEditId(entry._id)
    setEditForm({
      status:   entry.status,
      progress: entry.progress ?? 0,
      rating:   entry.rating ?? '',
      notes:    entry.notes ?? '',
    })
  }

  function cancelEdit() {
    setEditId(null)
    setEditForm({})
  }

  async function saveEdit(entryId) {
    try {
      const payload = {
        status:   editForm.status,
        progress: Number(editForm.progress),
        notes:    editForm.notes,
        // Only send rating if the user actually filled it in
        ...(editForm.rating !== '' && { rating: Number(editForm.rating) }),
      }
      const res = await api.put(`/list/${entryId}`, payload)
      // Replace the updated entry in state
      setEntries(prev => prev.map(e => e._id === entryId ? { ...e, ...res.data } : e))
      setEditId(null)
    } catch (err) {
      alert(err.response?.data?.message || 'Could not save changes.')
    }
  }

  async function handleDelete(entryId) {
    if (!window.confirm('Remove this title from your list?')) return
    try {
      await api.delete(`/list/${entryId}`)
      setEntries(prev => prev.filter(e => e._id !== entryId))
    } catch {
      alert('Could not remove entry.')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    )
  }

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">My List</h2>
        <span className="text-muted">{entries.length} titles</span>
      </div>

      {entries.length === 0 ? (
        <div className="text-center py-5">
          <p className="text-muted fs-5">Your list is empty.</p>
          <Link to="/catalog" className="btn btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-dark">
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Your Rating</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => {
                const anime = entry.animeId  // populated by backend
                const isEditing = editId === entry._id

                return (
                  <tr key={entry._id}>
                    {/* Title */}
                    <td>
                      {anime ? (
                        <div className="d-flex align-items-center gap-2">
                          {anime.imageUrl && (
                            <img
                              src={anime.imageUrl}
                              alt={anime.title}
                              style={{ width: 36, height: 50, objectFit: 'cover', borderRadius: 4 }}
                              onError={e => { e.target.style.display = 'none' }}
                            />
                          )}
                          <Link to={`/anime/${anime._id}`} className="text-decoration-none fw-semibold">
                            {anime.title}
                          </Link>
                        </div>
                      ) : (
                        <span className="text-muted">Unknown title</span>
                      )}
                    </td>

                    {/* Status */}
                    <td>
                      {isEditing ? (
                        <select
                          className="form-select form-select-sm"
                          value={editForm.status}
                          onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                        >
                          {STATUS_OPTIONS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      ) : (
                        <span className={`badge ${STATUS_COLORS[entry.status] || 'bg-secondary'}`}>
                          {entry.status}
                        </span>
                      )}
                    </td>

                    {/* Progress (episodes watched) */}
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ width: 70 }}
                          min={0}
                          max={anime?.episodes || 9999}
                          value={editForm.progress}
                          onChange={e => setEditForm({ ...editForm, progress: e.target.value })}
                        />
                      ) : (
                        <span>
                          {entry.progress}
                          {anime?.episodes > 0 && ` / ${anime.episodes}`}
                        </span>
                      )}
                    </td>

                    {/* Rating */}
                    <td>
                      {isEditing ? (
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          style={{ width: 70 }}
                          min={1} max={10}
                          placeholder="1–10"
                          value={editForm.rating}
                          onChange={e => setEditForm({ ...editForm, rating: e.target.value })}
                        />
                      ) : (
                        entry.rating
                          ? <span className="badge bg-warning text-dark">⭐ {entry.rating}</span>
                          : <span className="text-muted">—</span>
                      )}
                    </td>

                    {/* Notes */}
                    <td style={{ maxWidth: 200 }}>
                      {isEditing ? (
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          value={editForm.notes}
                          onChange={e => setEditForm({ ...editForm, notes: e.target.value })}
                          placeholder="Optional notes"
                        />
                      ) : (
                        <span className="text-muted" style={{ fontSize: '0.85rem' }}>
                          {entry.notes || '—'}
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td>
                      {isEditing ? (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-success btn-sm"
                            onClick={() => saveEdit(entry._id)}
                          >
                            Save
                          </button>
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="d-flex gap-1">
                          <button
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => startEdit(entry)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => handleDelete(entry._id)}
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
