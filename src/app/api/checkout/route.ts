import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { SITE_URL } from "@/lib/constants";

const MIN_AMOUNT = 100; // $1.00
const MAX_AMOUNT = 50000; // $500.00

export async function POST(req: NextRequest) {
  const { amount } = await req.json();

  if (
    !amount ||
    typeof amount !== "number" ||
    !Number.isInteger(amount) ||
    amount < MIN_AMOUNT ||
    amount > MAX_AMOUNT
  ) {
    return NextResponse.json(
      { error: "Amount must be between $1 and $500" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    submit_type: "donate",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: { name: "Support insights.codes" },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/subscribe`,
  });

  return NextResponse.json({ url: session.url });
}
