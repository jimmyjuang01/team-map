import { useState } from 'react'
import { Lock } from 'lucide-react'

export default function LoginScreen({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  const handleSubmit = () => {
    const correct = import.meta.env.VITE_ACCESS_PASSWORD
    if (password === correct) {
      sessionStorage.setItem('team-map-auth', 'true')
      onLogin()
    } else {
      setError(true)
      setShake(true)
      setTimeout(() => {
        setError(false)
        setShake(false)
      }, 2000)
    }
  }

  return (
    <div
      className="min-h-screen bg-neutral-950 flex items-center justify-center p-8"
      style={{ fontFamily: 'Georgia, serif' }}
    >
      <div className={`max-w-sm w-full ${shake ? 'animate-pulse' : ''}`}>

        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-12 h-12 border-2 border-amber-400 rotate-45 mb-6" />
          <h1 className="text-3xl text-amber-50 tracking-wide mb-2">
            Team Map
          </h1>
          <p
            className="text-xs text-neutral-500 tracking-[0.3em] uppercase"
            style={{ fontFamily: 'monospace' }}
          >
            Internal · Restricted Access
          </p>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div className="relative">
            <Lock
              size={14}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-neutral-600"
            />
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="Enter access password"
              className={`w-full bg-transparent border-b pl-6 pr-0 py-3 text-amber-50
                placeholder:text-neutral-600 outline-none transition-colors tracking-widest
                ${error
                  ? 'border-red-500 text-red-400'
                  : 'border-neutral-700 focus:border-amber-400'
                }`}
            />
          </div>

          {error && (
            <p
              className="text-red-400 text-xs tracking-widest text-center"
              style={{ fontFamily: 'monospace' }}
            >
              INCORRECT PASSWORD
            </p>
          )}

          <button
            onClick={handleSubmit}
            className="w-full py-3 bg-amber-400 text-neutral-900 font-medium
              tracking-[0.2em] text-sm uppercase hover:bg-amber-300
              transition-colors active:bg-amber-500"
            style={{ fontFamily: 'monospace' }}
          >
            Enter
          </button>
        </div>

        {/* Footer */}
        <p
          className="text-center text-neutral-700 text-xs mt-8 tracking-wider"
          style={{ fontFamily: 'monospace' }}
        >
          Authorized personnel only
        </p>

      </div>
    </div>
  )
}