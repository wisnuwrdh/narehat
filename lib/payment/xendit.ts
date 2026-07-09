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
  plan: "premium_monthly" | "premium_yearly" | "pro_monthly" | "pro_yearly"
): Promise<{ invoice_url: string }> {
  const apiKey = process.env.XENDIT_API_KEY!;
  const amounts: Record<string, number> = {
    premium_monthly: 19000,
    premium_yearly: 149000,
    pro_monthly: 49000,
    pro_yearly: 399000,
  };
  const descriptions: Record<string, string> = {
    premium_monthly: "Narehat Premium — Bulanan",
    premium_yearly: "Narehat Premium — Tahunan",
    pro_monthly: "Narehat Pro — Bulanan",
    pro_yearly: "Narehat Pro — Tahunan",
  };
  const amount = amounts[plan] || 19000;
  const description = descriptions[plan] || "Narehat Subscription";

  const response = await fetch("https://api.xendit.co/v2/invoices", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(apiKey + ":").toString("base64")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      external_id: `${userId}-${plan}-${Date.now()}`,
      amount,
      currency: "IDR",
      description,
      success_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
      failure_redirect_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    }),
  });

  const data = await response.json();
  return { invoice_url: data.invoice_url };
}
