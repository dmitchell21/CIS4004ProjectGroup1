import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../api'

export default function AnimePage() {
  const { id } = useParams()

  const [anime, setAnime] = useState(null)
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Review form state
  const [reviewText, setReviewText] = useState('')
  const [reviewScore, setReviewScore] = useState(7)
  const [submitting, setSubmitting] = useState(false)
  const [reviewError, setReviewError] = useState('')
  const [reviewSuccess, setReviewSuccess] = useState('')

  // Add to list state
  const [addingToList, setAddingToList] = useState(false)
  const [listMsg, setListMsg] = useState('')

  useEffect(() => {
    async function load() {
      try {
        // Fetch anime detail and reviews in parallel
        const [animeRes, reviewsRes] = await Promise.all([
          api.get(`/catalog/${id}`),
          api.get(`/reviews/${id}`)
        ])
        setAnime(animeRes.data)
        setReviews(reviewsRes.data)
      } catch {
        setError('Could not load this title.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  async function handleAddToList() {
    setAddingToList(true)
    setListMsg('')
    try {
      await api.post('/list', { animeId: id, status: 'plan to watch' })
      setListMsg('Added to your list!')
    } catch (err) {
      setListMsg(err.response?.data?.message || 'Could not add to list')
    } finally {
      setAddingToList(false)
    }
  }

  async function handleSubmitReview(e) {
    e.preventDefault()
    setReviewError('')
    setReviewSuccess('')
    if (!reviewText.trim()) {
      setReviewError('Review text cannot be empty.')
      return
    }
    setSubmitting(true)
    try {
      const res = await api.post('/reviews', {
        animeId: id,
        text: reviewText,
        score: reviewScore
      })
      // Append new review to the list immediately
      setReviews(prev => [...prev, res.data])
      setReviewText('')
      setReviewScore(7)
      setReviewSuccess('Review posted!')
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Could not post review')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDeleteReview(reviewId) {
    if (!window.confirm('Delete your review?')) return
    try {
      await api.delete(`/reviews/${reviewId}`)
      setReviews(prev => prev.filter(r => r._id !== reviewId))
    } catch {
      alert('Could not delete review.')
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '60vh' }}>
        <div className="spinner-border text-primary" role="status" />
      </div>
    )
  }

  if (error || !anime) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || 'Title not found.'}</div>
        <Link to="/catalog" className="btn btn-secondary">← Back to Catalog</Link>
      </div>
    )
  }

  // Pull the current user's ID out of the JWT stored in localStorage
  // The JWT payload is the middle part (base64), we decode it to get { id, role }
  const token = localStorage.getItem('token')
  let currentUserId = null
  try {
    currentUserId = JSON.parse(atob(token.split('.')[1])).id
  } catch {}

  const imgSrc = anime.imageUrl ||
    `https://placehold.co/300x420/1a1a2e/white?text=${encodeURIComponent(anime.title)}`

  return (
    <div className="container py-4">

      <Link to="/catalog" className="btn btn-outline-secondary btn-sm mb-4">
        ← Back to Catalog
      </Link>

      {/* Top section: poster + info */}
      <div className="row g-4 mb-5">
        <div className="col-md-3">
          <img
            src={imgSrc}
            alt={anime.title}
            className="img-fluid rounded shadow"
            onError={e => {
              e.target.src = `https://placehold.co/300x420/1a1a2e/white?text=${encodeURIComponent(anime.title)}`
            }}
          />
        </div>

        <div className="col-md-9">
          <h2 className="mb-1">{anime.title}</h2>

          <div className="d-flex flex-wrap gap-2 mb-3">
            {/* Airing status */}
            <span className={`badge ${
              anime.status === 'Currently Airing' ? 'bg-success'
              : anime.status === 'Not Yet Aired' ? 'bg-secondary'
              : 'bg-primary'
            }`}>
              {anime.status}
            </span>

            {/* Release year */}
            {anime.releaseYear && (
              <span className="badge bg-dark">{anime.releaseYear}</span>
            )}

            {/* Average rating */}
            {anime.averageRating > 0 && (
              <span className="badge bg-warning text-dark">⭐ {anime.averageRating} / 10</span>
            )}

            {/* Episodes */}
            {anime.episodes > 0 && (
              <span className="badge bg-info text-dark">{anime.episodes} eps</span>
            )}
          </div>

          {/* Genres */}
          {anime.genres?.length > 0 && (
            <div className="mb-3">
              {anime.genres.map(g => (
                <span key={g._id} className="badge bg-secondary me-1">{g.name}</span>
              ))}
            </div>
          )}

          {/* Synopsis */}
          {anime.synopsis && (
            <p className="text-muted">{anime.synopsis}</p>
          )}

          {/* Add to list */}
          <button
            className="btn btn-primary"
            onClick={handleAddToList}
            disabled={addingToList}
          >
            {addingToList ? 'Adding…' : '+ Add to My List'}
          </button>
          {listMsg && (
            <span className={`ms-3 small ${listMsg.includes('already') ? 'text-danger' : 'text-success'}`}>
              {listMsg}
            </span>
          )}
        </div>
      </div>

      {/* Reviews section */}
      <h4 className="mb-3">Reviews ({reviews.length})</h4>

      {/* Write a review */}
      <div className="card mb-4">
        <div className="card-body">
          <h6 className="card-title">Write a Review</h6>
          {reviewError && <div className="alert alert-danger py-2">{reviewError}</div>}
          {reviewSuccess && <div className="alert alert-success py-2">{reviewSuccess}</div>}
          <form onSubmit={handleSubmitReview}>
            <div className="mb-2">
              <label className="form-label">Score (1–10)</label>
              <div className="d-flex align-items-center gap-2">
                <input
                  type="range"
                  className="form-range"
                  min={1} max={10} step={1}
                  value={reviewScore}
                  onChange={e => setReviewScore(Number(e.target.value))}
                />
                <span className="badge bg-warning text-dark fs-6" style={{ minWidth: 36 }}>
                  {reviewScore}
                </span>
              </div>
            </div>
            <div className="mb-2">
              <label className="form-label">Your Review</label>
              <textarea
                className="form-control"
                rows={3}
                maxLength={2000}
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Share your thoughts…"
              />
              <div className="text-muted text-end" style={{ fontSize: '0.8rem' }}>
                {reviewText.length}/2000
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              {submitting ? 'Posting…' : 'Post Review'}
            </button>
          </form>
        </div>
      </div>

      {/* Existing reviews */}
      {reviews.length === 0 ? (
        <p className="text-muted">No reviews yet. Be the first!</p>
      ) : (
        <div className="d-flex flex-column gap-3">
          {reviews.map(review => (
            <div key={review._id} className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <strong>{review.userId?.username || 'User'}</strong>
                    <span className="badge bg-warning text-dark ms-2">⭐ {review.score}/10</span>
                    <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {/* Only show delete button for the user's own review */}
                  {review.userId?._id === currentUserId && (
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => handleDeleteReview(review._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
                <p className="mt-2 mb-0">{review.text}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
