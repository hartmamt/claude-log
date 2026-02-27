import { stripe } from "./_stripe";
import { supabase } from "./_supabase";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ error: "Email required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { data: subscriber } = await supabase
      .from("subscribers")
      .select("stripe_customer_id")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (!subscriber?.stripe_customer_id) {
      return new Response(
        JSON.stringify({ error: "No active support subscription found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscriber.stripe_customer_id,
      return_url: `${SITE_URL}/subscribe`,
    });

    return new Response(
      JSON.stringify({ url: session.url }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Portal error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
