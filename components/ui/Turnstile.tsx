"use client"

import Script from "next/script"
import { useEffect, useState } from "react"

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
  const [widgetId, setWidgetId] = useState<string | null>(null)

  useEffect(() => {
    const id = window.turnstile?.render("#cf-turnstile-container", {
      sitekey: siteKey,
      callback: (token: string) => onToken(token),
      "expired-callback": () => onToken(""),
    })
    if (id) setWidgetId(id)
    return () => {
      if (widgetId) window.turnstile?.reset(widgetId)
    }
  }, [siteKey])

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        async
        defer
      />
      <div id="cf-turnstile-container" className="flex justify-center" />
    </>
  )
}
