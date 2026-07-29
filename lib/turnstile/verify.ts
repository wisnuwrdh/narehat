export async function verifyTurnstile(token: string, remoteip?: string) {
  const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.TURNSTILE_SECRET!,
      response: token,
      ...(remoteip ? { remoteip } : {}),
    }),
  })
  const data = (await r.json()) as { success: boolean; "error-codes"?: string[] }
  return data
}
