import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api'

export default function CatalogPage() {
  const [animeList, setAnimeList] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [addingId, setAddingId] = useState(null)   // tracks which card's button is busy
  const [toast, setToast] = useState('')            // success/error flash message

  // Fetch all anime when page loads
  useEffect(() => {
    api.get('/catalog')
      .then(res => setAnimeList(res.data))
      .catch(() => setError('Could not load catalog. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [])

  // Filter by search term (client-side, instant)
  const filtered = animeList.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase())
  )

  // Add an anime to the user's list with default status "plan to watch"
  async function handleAddToList(animeId) {
    setAddingId(animeId)
    try {
      await api.post('/list', { animeId, status: 'plan to watch' })
      showToast('Added to your list!')
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not add to list'
      showToast(msg, true)
    } finally {
      setAddingId(null)
    }
  }

  function showToast(msg, isError = false) {
    setToast({ msg, isError })
    setTimeout(() => setToast(''), 3000)
  }

  // Fallback image if the anime has no imageUrl
  function imgSrc(anime) {
    return anime.imageUrl || `https://placehold.co/300x420/1a1a2e/white?text=${encodeURIComponent(anime.title)}`
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

      {/* Toast notification */}
      {toast && (
        <div
          className={`alert ${toast.isError ? 'alert-danger' : 'alert-success'} position-fixed top-0 end-0 m-3`}
          style={{ zIndex: 9999, minWidth: 250 }}
        >
          {toast.msg}
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">Anime Catalog</h2>
        <span className="text-muted">{filtered.length} titles</span>
      </div>

      {/* Search bar */}
      <div className="mb-4">
        <input
          type="text"
          className="form-control form-control-lg"
          placeholder="Search by title…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted">No titles match your search.</p>
      ) : (
        <div className="row row-cols-2 row-cols-sm-3 row-cols-md-4 row-cols-lg-5 g-3">
          {filtered.map(anime => (
            <div className="col" key={anime._id}>
              <div className="card h-100 shadow-sm">

                {/* Poster image — click to go to detail page */}
                <Link to={`/anime/${anime._id}`}>
                  <img
                    src={imgSrc(anime)}
                    alt={anime.title}
                    className="card-img-top"
                    style={{ height: 200, objectFit: 'cover' }}
                    onError={e => {
                      e.target.src = `https://placehold.co/300x420/1a1a2e/white?text=${encodeURIComponent(anime.title)}`
                    }}
                  />
                </Link>

                <div className="card-body d-flex flex-column p-2">
                  <Link
                    to={`/anime/${anime._id}`}
                    className="text-decoration-none text-dark"
                  >
                    <h6 className="card-title mb-1" style={{ fontSize: '0.85rem' }}>
                      {anime.title}
                    </h6>
                  </Link>

                  {/* Rating badge */}
                  {anime.averageRating > 0 && (
                    <span className="badge bg-warning text-dark mb-1" style={{ width: 'fit-content' }}>
                      ⭐ {anime.averageRating}
                    </span>
                  )}

                  {/* Airing status */}
                  <span
                    className={`badge mb-2 ${
                      anime.status === 'Currently Airing'
                        ? 'bg-success'
                        : anime.status === 'Not Yet Aired'
                        ? 'bg-secondary'
                        : 'bg-primary'
                    }`}
                    style={{ fontSize: '0.7rem', width: 'fit-content' }}
                  >
                    {anime.status}
                  </span>

                  {/* Add to list button */}
                  <button
                    className="btn btn-outline-primary btn-sm mt-auto"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleAddToList(anime._id)}
                    disabled={addingId === anime._id}
                  >
                    {addingId === anime._id ? '…' : '+ Add to List'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
