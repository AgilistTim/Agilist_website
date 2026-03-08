import { useState, useEffect, createContext, useContext } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Lock, Loader2, AlertCircle } from 'lucide-react'

const AuthContext = createContext(null)

export function useAdminAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuth')
  return ctx
}

const TOKEN_KEY = 'admin_jwt'

function getStoredToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

function storeToken(token) {
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    // sessionStorage unavailable (rare Safari private mode edge case)
  }
}

function clearToken() {
  try {
    sessionStorage.removeItem(TOKEN_KEY)
  } catch {
    // ignore
  }
}

export function AdminAuth({ apiBaseUrl, children }) {
  const [token, setToken] = useState(null)
  const [verifying, setVerifying] = useState(true)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)

  // On mount, check if stored token is still valid
  useEffect(() => {
    const stored = getStoredToken()
    if (!stored) {
      setVerifying(false)
      return
    }

    fetch(`${apiBaseUrl}/api/admin/verify`, {
      headers: { Authorization: `Bearer ${stored}` }
    })
      .then((res) => {
        if (res.ok) {
          setToken(stored)
        } else {
          clearToken()
        }
      })
      .catch(() => clearToken())
      .finally(() => setVerifying(false))
  }, [apiBaseUrl])

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoggingIn(true)

    try {
      const res = await fetch(`${apiBaseUrl}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Login failed.')
        return
      }

      storeToken(data.token)
      setToken(data.token)
      setPassword('')
    } catch (err) {
      setError('Network error. Is the server running?')
    } finally {
      setLoggingIn(false)
    }
  }

  const handleLogout = () => {
    clearToken()
    setToken(null)
  }

  // Helper: make authenticated fetch requests
  const authFetch = async (url, options = {}) => {
    const res = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`
      }
    })

    // If token expired mid-session, force re-login
    if (res.status === 401) {
      clearToken()
      setToken(null)
      throw new Error('Session expired. Please log in again.')
    }

    return res
  }

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F]">
        <Loader2 className="h-8 w-8 animate-spin text-[#7C3AED]" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D0D0F] px-4">
        <Card className="w-full max-w-md bg-[#16161A] border-[#2A2A35]">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Admin Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="admin-password" className="block text-sm text-[#A1A1AA] mb-2">
                  Password
                </label>
                <input
                  id="admin-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D0D0F] border border-[#2A2A35] rounded text-white focus:border-[#7C3AED] focus:outline-none"
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  disabled={loggingIn}
                />
              </div>
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}
              <Button
                type="submit"
                disabled={loggingIn || !password}
                className="w-full bg-[#7C3AED] text-white hover:bg-[#6D28D9] disabled:opacity-50"
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Authenticated — render children with auth context
  return (
    <AuthContext.Provider value={{ token, authFetch, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  )
}
