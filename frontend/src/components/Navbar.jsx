import { Link, useNavigate } from 'react-router-dom'

export default function Navbar() {
  const navigate = useNavigate()
  const role = localStorage.getItem('role')

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('role')
    navigate('/login')
  }

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <Link className="navbar-brand fw-bold" to="/catalog">
        🎌 AniTrack
      </Link>

      <div className="collapse navbar-collapse">
        <ul className="navbar-nav me-auto">
          <li className="nav-item">
            <Link className="nav-link" to="/catalog">Catalog</Link>
          </li>
          <li className="nav-item">
            <Link className="nav-link" to="/mylist">My List</Link>
          </li>
          {role === 'admin' && (
            <li className="nav-item">
              <Link className="nav-link text-warning" to="/admin">Admin</Link>
            </li>
          )}
        </ul>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Log Out
        </button>
      </div>
    </nav>
  )
}
