import { getStripe } from "@/lib/stripe";
import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const supabase = getSupabase();
    const resend = getResend();
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
      // Always return success to avoid leaking whether an email has a subscription
      return Response.json({ ok: true });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscriber.stripe_customer_id,
      return_url: `${SITE_URL}/subscribe`,
    });

    // Email the portal link instead of returning it directly
    await resend.emails.send({
      from: "insights.codes <hello@insights.codes>",
      to: email.toLowerCase().trim(),
      subject: "Manage your insights.codes subscription",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #e5e5e5; font-size: 20px;">Manage your subscription</h2>
          <p style="color: #a3a3a3; line-height: 1.6;">
            Click the link below to manage or cancel your support subscription. This link expires in 24 hours.
          </p>
          <a href="${session.url}"
             style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Manage subscription
          </a>
          <p style="color: #737373; font-size: 13px;">
            If you didn't request this, just ignore this email.
          </p>
        </div>
      `,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Portal error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
