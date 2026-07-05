import crypto from "crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secret = process.env.XENDIT_WEBHOOK_SECRET!;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature)
  );
}

export interface XenditInvoice {
  id: string;
  external_id: string;
  user_id: string;
  amount: number;
  status: string;
  payment_method: string;
  created: string;
}

export async function createInvoice(
  userId: string,
  plan: "premium_monthly" | "premium_yearly"
): Promise<{ invoice_url: string }> {
  const apiKey = process.env.XENDIT_API_KEY!;
  const amount = plan === "premium_monthly" ? 19000 : 149000;

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: `${userId}-${Date.now()}`,
      amount,
      currency: "IDR",
      description: plan === "premium_monthly" ? "Narehat Premium — Bulanan" : "Narehat Premium — Tahunan",
      success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    }),
  });

  const data = await response.json();
  return { invoice_url: data.invoice_url };
}
