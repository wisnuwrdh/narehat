import crypto from "crypto";

const API_URL =
  process.env.SUMOPOD_PAYMENT_API_URL ||
  "https://api-pay-sandbox.sumopod.com/api/v1/payments";

const API_KEY = process.env.SUMOPOD_PAYMENT_API_KEY;

export interface SumoPodPayment {
  payment_id: string;
  order_id: string;
  amount: number;
  fee: number;
  net_amount: number;
  payment_link_url: string;
  status: string;
  expires_at: string;
}

const amounts: Record<string, number> = {
  premium_monthly: 29000,
  premium_yearly: 199000,
  pro_monthly: 49000,
  pro_yearly: 399000,
};

const validPlans = Object.keys(amounts);

export type PlanType = keyof typeof amounts;

export function verifyWebhookToken(token: string): boolean {
  const expected = process.env.SUMOPOD_PAYMENT_WEBHOOK_TOKEN;
  if (!expected || !token) return false;
  return token === expected;
}

export function verifyWebhookSignature(
  rawBody: string,
  svixId: string,
  svixTimestamp: string,
  svixSignature: string
): boolean {
  const secret = process.env.SUMOPOD_PAYMENT_WEBHOOK_SECRET;
  if (!secret) return false;

  try {
    const secretBytes = Buffer.from(secret.replace("whsec_", ""), "base64");
    const signedContent = `${svixId}.${svixTimestamp}.${rawBody}`;

    const expectedSignature = crypto
      .createHmac("sha256", secretBytes)
      .update(signedContent)
      .digest("base64");

    const signatures = svixSignature
      .split(" ")
      .map((s) => s.split(",")[1]);

    return signatures.includes(expectedSignature);
  } catch {
    return false;
  }
}

export async function createPayment(
  userId: string,
  plan: PlanType,
  baseUrl?: string
): Promise<{ payment_url: string; order_id: string }> {
  if (!API_KEY) {
    throw new Error("SUMOPOD_PAYMENT_API_KEY not set");
  }

  const amount = amounts[plan];
  if (!amount) {
    throw new Error(`Invalid plan: ${plan}`);
  }

  const origin = baseUrl || process.env.NEXT_PUBLIC_APP_URL || "";
  const orderId = `${userId}-${plan}-${Date.now()}`;

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": API_KEY,
    },
    body: JSON.stringify({
      order_id: orderId,
      amount,
      currency: "IDR",
      success_return_url: `${origin}/dashboard`,
      cancel_return_url: `${origin}/subscription`,
      payment_method_type_code: "QRIS",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`SumoPod API error: ${response.status} ${errorText}`);
  }

  const data = (await response.json()) as SumoPodPayment;
  return { payment_url: data.payment_link_url, order_id: orderId };
}

export function isValidPlan(plan: string): plan is PlanType {
  return validPlans.includes(plan);
}
