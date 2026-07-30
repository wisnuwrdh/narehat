"use client"

import { useState } from "react"
import { useUser } from "@/contexts/UserContext"

export function VerifyEmailBanner() {
  const { user } = useUser()
  const [dismissed, setDismissed] = useState(false)

  if (user.email_verified || dismissed) return null

  return (
    <div className="mx-4 mt-3 mb-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
      <span className="material-symbols-outlined text-amber-600 text-lg mt-0.5">mark_email_unread</span>
      <p className="text-xs text-amber-800 leading-relaxed flex-1">
        Verifikasi email kamu. Klik link yang sudah dikirim ke <strong>{user.email}</strong>.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="text-amber-400 hover:text-amber-600 transition-colors"
      >
        <span className="material-symbols-outlined text-lg">close</span>
      </button>
    </div>
  )
}
