import { stripe } from "./_stripe";
import { supabase } from "./_supabase";
import type Stripe from "stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return new Response("Missing signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const email = session.metadata?.subscriber_email || session.customer_email;
      if (email) {
        await supabase
          .from("subscribers")
          .update({
            stripe_customer_id: session.customer as string,
            stripe_subscription_id: session.subscription as string,
            support_amount_cents: session.amount_total,
          })
          .eq("email", email.toLowerCase().trim());
      }
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from("subscribers")
        .update({
          stripe_subscription_id: null,
          support_amount_cents: null,
        })
        .eq("stripe_customer_id", subscription.customer as string);
      break;
    }

    case "invoice.payment_failed": {
      // Log for now — could send notification email later
      const invoice = event.data.object as Stripe.Invoice;
      console.warn("Payment failed for customer:", invoice.customer);
      break;
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
