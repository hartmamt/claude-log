import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Simple in-memory rate limiter: max 3 requests per email per 15 minutes
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 15 * 60 * 1000;
const RATE_LIMIT_MAX = 3;

function isRateLimited(key: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(key);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabase();
    const resend = getResend();
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    const { email } = await request.json();
    const normalizedEmail = typeof email === "string" ? email.toLowerCase().trim() : "";

    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      return Response.json({ error: "Valid email required" }, { status: 400 });
    }

    if (isRateLimited(normalizedEmail)) {
      // Return success to avoid leaking rate limit info
      return Response.json({ ok: true });
    }

    // Check if already confirmed — don't reset them to pending
    const { data: existing } = await supabase
      .from("subscribers")
      .select("id, token, status")
      .eq("email", normalizedEmail)
      .single();

    if (existing?.status === "confirmed") {
      // Already confirmed — silently succeed
      return Response.json({ ok: true });
    }

    // Upsert for new or unsubscribed/pending users
    const { data: subscriber, error: dbError } = await supabase
      .from("subscribers")
      .upsert(
        {
          email: normalizedEmail,
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
          email: normalizedEmail,
        });
      } catch {
        // Contact may already exist
      }
    }

    await resend.emails.send({
      from: "insights.codes <hello@insights.codes>",
      to: normalizedEmail,
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
    return Response.json({ error: "Something went wrong" }, { status: 500 });
  }
}
