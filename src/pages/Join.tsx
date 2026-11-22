import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { joinTrip } from '@/lib/actions'
import { useCloudStore } from '@/lib/cloud'
import { useT } from '@/lib/i18n'

/** /join/:code — reached from an invite link. CloudGate has already ensured a session + name. */
export function Join() {
  const { code = '' } = useParams()
  const t = useT()
  const navigate = useNavigate()
  const status = useCloudStore((s) => s.status)
  const [failed, setFailed] = useState(false)
  const started = useRef(false)

  useEffect(() => {
    if (status !== 'ready' || started.current) return
    started.current = true
    void joinTrip(code).then((tripId) => {
      if (tripId) navigate(`/trip/${tripId}`, { replace: true })
      else setFailed(true)
    })
  }, [status, code, navigate])

  const offline = status === 'off'

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 text-center min-h-dvh">
      <span className="text-[44px] tf-anim-bounce">{failed || offline ? '🧭' : '✈️'}</span>
      <p className="text-[14px] text-text-muted mt-3">
        {failed || offline ? t.badCode : t.joining}
      </p>
      {(failed || offline) && (
        <Link
          to="/"
          className="tf-press mt-5 px-5 py-2.5 rounded-[24px] bg-accent text-white text-[13px] font-bold"
        >
          {t.backHome}
        </Link>
      )}
    </div>
  )
}
