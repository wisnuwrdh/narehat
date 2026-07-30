const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAAAXNSR0IArs4c6QAAAARzQklUCAgICHwIZIgAAAIwSURBVGiBYzRVPfufYQgDpoF2AKVg1AMDDUY9MNBg1AMDDUY9MNCABRxNEfGiDEXVsljl1q98zdBe+5gsx5y6ZcTw4/tfBjv9i0TrYSS1KXHqlhFR6szUzpFiLIq5//8zMJirE6efpCR05IoBWQ4iFTAyEq+WpCTExobw7/UrXxnig26iyAdHijCUN8rB+aduGREdE//+/mdgYoa43Er7PNFuIjoJ1bTJMfiFiMD5uBymqMLBsHKbFpy/feNbhvrSh0Q7iFRAdBIixvEMDAwM9+/8YPjx/S+c7+kvTKbTiAM0KUbRSxFi8sOpW0ZwzM5BfCagWT2AHkuUZGp8gKYVGT08QfOaGN0TO4/rUtV8ujQl7tz6DmcLCrMyCAoxU81sqnuAkxPTyCif6yj8nSf0qWYfVT1w6pYRw8GL2GtrWuUHqnkA2UG4HIfsCUejC1Sxl2oeIDaEzdTOMZipnWP4+uUfVeylahKiV9mPDKieidOjURt4UxeqUNsKFEB1D5w//ZXh509E8jC15KO2FSiAJvWArS5qBqVlUhqUbaH/JPQRB2Vb6NdP4n1A97YQtZMTXdpCmbG3UPjInmBiosxTZA2rkArOnvzC8PXLXwZuHkQjjpjamhhAt4EtR6OLDNevfMWrhlTHMzDQeWQuPugmg5naOYZ//1Az6dEDH8lyPAMDnZIQOrDQIH7YhBAgOgbIDSFaA5KHFgcbGPKj06MeGGgw6oGBBqMeGGgw6oGBBgDjracvChtvIwAAAABJRU5ErkJggg=="

export function resetPasswordEmail(link: string): { html: string; text: string } {
  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:0;background:#f8fafc">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
<table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;box-shadow:0 1px 3px rgba(0,0,0,.08)">
<tr><td style="padding:40px 32px 32px;text-align:center">
<img src="${LOGO_BASE64}" alt="Narehat" width="48" height="48" style="border-radius:12px;margin-bottom:16px"/>
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
