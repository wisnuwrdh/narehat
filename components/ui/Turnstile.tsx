"use client"

import Script from "next/script"
import { useEffect, useRef, useState } from "react"

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
  const [ready, setReady] = useState(false)
  const widgetRef = useRef<string | null>(null)
  const onTokenRef = useRef(onToken)
  onTokenRef.current = onToken

  useEffect(() => {
    if (!ready || widgetRef.current) return
    const id = window.turnstile?.render("#cf-turnstile-container", {
      sitekey: siteKey,
      callback: (token: string) => onTokenRef.current(token),
      "expired-callback": () => onTokenRef.current(""),
    })
    if (id) widgetRef.current = id
    return () => {
      if (widgetRef.current) {
        window.turnstile?.reset(widgetRef.current)
        widgetRef.current = null
      }
    }
  }, [ready, siteKey])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setReady(true)}
      />
      <div id="cf-turnstile-container" className="flex justify-center" />
    </>
  )
}
