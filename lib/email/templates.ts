export function resetPasswordEmail(link: string): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
<tr><td style="padding:40px 32px 32px;text-align:center">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiByeD0iNDgiIGZpbGw9IiMzNTI1Q0QiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjIsMCkiPjxwYXRoIGQ9Ik02NCAyMDggVjY0IEM2NCA0NCA4MCAyOCAxMDAgMjggQzExNiAyOCAxMjYgMzQgMTM2IDQ2IEwxODggMTEwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMTYgMTA4IEwxNzYgMTgwIEMxODggMTk0IDIwNCAxOTggMjIwIDE5MCBDMjMwIDE4NCAyMzYgMTcyIDIzNiAxNTggVjY0IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjIzNiIgY3k9IjM2IiByPSIxNCIgZmlsbD0iI0ZGRkZGRiIvPjwvZz48L3N2Zz4=" alt="Narehat" width="48" height="48" style="border-radius:12px;margin-bottom:16px"/>
<h1 style="font-size:20px;color:#1e293b;margin:0 0 8px">Reset Password</h1>
<p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.5">
Kami menerima permintaan reset password untuk akun Narehat kamu. Klik tombol di bawah untuk membuat password baru.
</p>
<a href="${link}" style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600">Buat Password Baru</a>
<p style="font-size:12px;color:#94a3b8;margin:24px 0 0;line-height:1.5">Link ini berlaku selama 1 jam. Jika kamu tidak meminta reset password, abaikan email ini.</p>
</td></tr></table>
<p style="font-size:12px;color:#94a3b8;margin-top:16px">&copy; 2026 Narehat &mdash; Skincare Tracker</p>
</td></tr></table>
</body>
</html>`

  return {
    html,
    text: `Reset Password Narehat\n\nKlik link berikut untuk membuat password baru: ${link}\n\nLink ini berlaku selama 1 jam.`,
  }
}

export function verifyEmailEmail(link: string): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
<tr><td style="padding:40px 32px 32px;text-align:center">
<img src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNTYgMjU2IiB3aWR0aD0iNDgiIGhlaWdodD0iNDgiPjxyZWN0IHdpZHRoPSIyNTYiIGhlaWdodD0iMjU2IiByeD0iNDgiIGZpbGw9IiMzNTI1Q0QiLz48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjIsMCkiPjxwYXRoIGQ9Ik02NCAyMDggVjY0IEM2NCA0NCA4MCAyOCAxMDAgMjggQzExNiAyOCAxMjYgMzQgMTM2IDQ2IEwxODggMTEwIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxwYXRoIGQ9Ik0xMTYgMTA4IEwxNzYgMTgwIEMxODggMTk0IDIwNCAxOTggMjIwIDE5MCBDMjMwIDE4NCAyMzYgMTcyIDIzNiAxNTggVjY0IiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjxjaXJjbGUgY3g9IjIzNiIgY3k9IjM2IiByPSIxNCIgZmlsbD0iI0ZGRkZGRiIvPjwvZz48L3N2Zz4=" alt="Narehat" width="48" height="48" style="border-radius:12px;margin-bottom:16px"/>
<h1 style="font-size:20px;color:#1e293b;margin:0 0 8px">Verifikasi Email</h1>
<p style="font-size:14px;color:#64748b;margin:0 0 24px;line-height:1.5">
Terima kasih sudah mendaftar di Narehat. Klik tombol di bawah untuk memverifikasi alamat email kamu.
</p>
<a href="${link}" style="display:inline-block;background:#22c55e;color:#fff;text-decoration:none;padding:14px 32px;border-radius:12px;font-size:14px;font-weight:600">Verifikasi Email</a>
<p style="font-size:12px;color:#94a3b8;margin:24px 0 0;line-height:1.5">Link ini berlaku selama 24 jam. Jika kamu tidak mendaftar di Narehat, abaikan email ini.</p>
</td></tr></table>
<p style="font-size:12px;color:#94a3b8;margin-top:16px">&copy; 2026 Narehat &mdash; Skincare Tracker</p>
</td></tr></table>
</body>
</html>`

  return {
    html,
    text: `Verifikasi Email Narehat\n\nKlik link berikut untuk memverifikasi email kamu: ${link}\n\nLink ini berlaku selama 24 jam.`,
  }
}
