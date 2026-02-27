import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const stripe = getStripe();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    if (session.payment_status === "paid" && session.customer_details?.email) {
      const supabase = getSupabase();
      await supabase.from("subscribers").upsert(
        {
          email: session.customer_details.email,
          support_amount_cents: session.amount_total,
          stripe_customer_id:
            typeof session.customer === "string" ? session.customer : null,
        },
        { onConflict: "email" }
      );
    }
  }

  return NextResponse.json({ received: true });
}
