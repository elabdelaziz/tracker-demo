'use client'

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { toast } from 'sonner'

interface RateLimitContextType {
  isRateLimited: boolean
  limitResetTime: number | null
  reportRateLimit: () => void
  checkRateLimit: () => boolean
}

const RateLimitContext = createContext<RateLimitContextType | undefined>(
  undefined
)

const RateLimitToastContent = ({ resetTime }: { resetTime: number }) => {
  const [seconds, setSeconds] = useState(
    Math.max(0, Math.ceil((resetTime - Date.now()) / 1000))
  )

  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.ceil((resetTime - Date.now()) / 1000))
      setSeconds(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [resetTime])

  return (
    <div className="font-medium">
      You have made too many requests. Please wait {seconds}s.
    </div>
  )
}

export function RateLimitProvider({ children }: { children: React.ReactNode }) {
  const [isRateLimited, setIsRateLimited] = useState(false)
  const [limitResetTime, setLimitResetTime] = useState<number | null>(null)

  useEffect(() => {
    // Check localStorage on mount
    const savedResetTime = localStorage.getItem('rateLimitResetTime')
    if (savedResetTime) {
      const resetTime = parseInt(savedResetTime, 10)
      if (resetTime > Date.now()) {
        setIsRateLimited(true)
        setLimitResetTime(resetTime)

        toast.error('Rate limit exceeded', {
          id: 'rate-limit-toast',
          description: <RateLimitToastContent resetTime={resetTime} />,
          duration: Infinity,
          closeButton: true,
          action: {
            label: 'Dismiss',
            onClick: () => toast.dismiss('rate-limit-toast'),
          },
        })
      } else {
        localStorage.removeItem('rateLimitResetTime')
      }
    }
  }, [])

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isRateLimited && limitResetTime) {
      const remaining = Math.max(0, limitResetTime - Date.now())

      timeout = setTimeout(() => {
        setIsRateLimited(false)
        setLimitResetTime(null)
        localStorage.removeItem('rateLimitResetTime')
        toast.dismiss('rate-limit-toast')
        toast.info('Rate limit cooldown over. You can continue.')
      }, remaining)
    }

    return () => clearTimeout(timeout)
  }, [isRateLimited, limitResetTime])

  const reportRateLimit = useCallback(() => {
    if (!isRateLimited) {
      setIsRateLimited(true)
      const resetTime = Date.now() + 60 * 1000
      setLimitResetTime(resetTime)
      localStorage.setItem('rateLimitResetTime', resetTime.toString())

      toast.error('Rate limit exceeded', {
        id: 'rate-limit-toast',
        description: <RateLimitToastContent resetTime={resetTime} />,
        duration: Infinity,
        closeButton: true,
      })
    }
  }, [isRateLimited])

  const checkRateLimit = useCallback(() => {
    if (isRateLimited && limitResetTime) {
      toast.error('Action Blocked', {
        id: 'rate-limit-toast',
        description: <RateLimitToastContent resetTime={limitResetTime} />,
        duration: Infinity,
        closeButton: true,
      })
      return true // IS limited
    }
    return false // NOT limited
  }, [isRateLimited, limitResetTime])

  return (
    <RateLimitContext.Provider
      value={{ isRateLimited, limitResetTime, reportRateLimit, checkRateLimit }}
    >
      {children}
    </RateLimitContext.Provider>
  )
}

export function useRateLimit() {
  const context = useContext(RateLimitContext)
  if (context === undefined) {
    throw new Error('useRateLimit must be used within a RateLimitProvider')
  }
  return context
}
