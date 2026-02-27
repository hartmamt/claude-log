import { supabase } from "./_supabase";
import { resend } from "./_resend";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID!;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return new Response(JSON.stringify({ error: "Valid email required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Upsert subscriber (if they unsubscribed before, re-create as pending)
    const { data: subscriber, error: dbError } = await supabase
      .from("subscribers")
      .upsert(
        {
          email: email.toLowerCase().trim(),
          status: "pending",
          confirmed_at: null,
          unsubscribed_at: null,
        },
        { onConflict: "email" }
      )
      .select("id, token")
      .single();

    if (dbError) {
      console.error("DB error:", dbError);
      return new Response(
        JSON.stringify({ error: "Something went wrong" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Add to Resend audience
    try {
      await resend.contacts.create({
        audienceId: RESEND_AUDIENCE_ID,
        email: email.toLowerCase().trim(),
      });
    } catch {
      // Contact may already exist — that's fine
    }

    // Send confirmation email
    await resend.emails.send({
      from: "insights.codes <hello@insights.codes>",
      to: email.toLowerCase().trim(),
      subject: "Confirm your subscription to insights.codes",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #e5e5e5; font-size: 20px;">Confirm your subscription</h2>
          <p style="color: #a3a3a3; line-height: 1.6;">
            Click the link below to confirm your subscription to insights.codes — notes on building with AI.
          </p>
          <a href="${SITE_URL}/api/confirm?token=${subscriber.token}"
             style="display: inline-block; margin: 20px 0; padding: 12px 24px; background: #10b981; color: #000; text-decoration: none; border-radius: 6px; font-weight: 600;">
            Confirm subscription
          </a>
          <p style="color: #737373; font-size: 13px;">
            If you didn't sign up, just ignore this email.
          </p>
        </div>
      `,
    });

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Subscribe error:", err);
    return new Response(
      JSON.stringify({ error: "Something went wrong" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
