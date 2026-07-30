"use client"

import Script from "next/script"
import { useEffect, useRef } from "react"

declare global {
  interface Window {
    turnstile?: {
      render: (container: string | HTMLElement, options: Record<string, unknown>) => string
      reset: (widgetId: string) => void
      getResponse: (widgetId: string) => string | undefined
    }
  }
}

export function Turnstile({
  onToken,
  siteKey,
}: {
  onToken: (token: string) => void
  siteKey: string
}) {
  const widgetRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    let mounted = true
    let attempts = 0

    const tryRender = () => {
      if (!mounted || widgetRef.current) return
      const id = window.turnstile?.render("#cf-turnstile-container", {
        sitekey: siteKey,
        callback: (token: string) => onTokenRef.current(token),
        "expired-callback": () => onTokenRef.current(""),
      })
      if (id) widgetRef.current = id
    }

    const interval = setInterval(() => {
      attempts++
      if (widgetRef.current || attempts > 75) clearInterval(interval)
      else tryRender()
    }, 200)

    tryRender()

    return () => {
      mounted = false
      clearInterval(interval)
      if (widgetRef.current) {
        window.turnstile?.reset(widgetRef.current)
        widgetRef.current = null
      }
    }
  }, [siteKey])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />
      <div id="cf-turnstile-container" className="flex justify-center" />
    </>
  )
}
