import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const resend = getResend();
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    const { email } = await request.json();

    if (!email || !isValidEmail(email)) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

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
      return Response.json({ error: "Something went wrong" }, { status: 500 });
    }

    if (audienceId) {
      try {
        await resend.contacts.create({
          audienceId,
          email: email.toLowerCase().trim(),
        });
      } catch {
        // Contact may already exist
      }
    }

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

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Subscribe error:", err);
    return Response.json(
      { error: err instanceof Error ? err.message : "Something went wrong" },
      { status: 500 }
    );
  }
}
