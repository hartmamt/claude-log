import { getStripe } from "./_stripe";
import { getSupabase } from "./_supabase";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const supabase = getSupabase();
    const { email } = await request.json();

    if (!email) {
      return Response.json({ error: "Email required" }, { status: 400 });
    }

    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!subscriber?.stripe_customer_id) {
      return Response.json({ error: "No active support subscription found" }, { status: 404 });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscriber.stripe_customer_id,
      return_url: `${SITE_URL}/subscribe`,
    });

    return Response.json({ url: session.url });
  } catch (err) {
    console.error("Portal error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
