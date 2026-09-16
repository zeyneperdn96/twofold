import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-4xl font-light text-text-muted">404</p>
        <p className="text-sm text-text-body mt-2">Page not found.</p>
        <Link
          to="/"
          className="text-sm text-accent mt-4 inline-block"
        >
          Back to trips
        </Link>
      </div>
    </div>
  )
}
