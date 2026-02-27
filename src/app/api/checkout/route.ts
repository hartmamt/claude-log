import { getStripe } from "@/lib/stripe";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const { email, amount } = await request.json();

    if (!email || !amount) {
      return Response.json({ error: "Email and amount required" }, { status: 400 });
    }

    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 1 || amountNum > 1000) {
      return Response.json({ error: "Amount must be between $1 and $1000" }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: email,
      metadata: { subscriber_email: email },
      line_items: [
        {
          price_data: {
            currency: "usd",
            unit_amount: Math.round(amountNum * 100),
            recurring: { interval: "month" },
            product_data: {
              name: "insights.codes supporter",
              description: `$${amountNum}/mo support for insights.codes`,
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${SITE_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/subscribe`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Checkout error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
