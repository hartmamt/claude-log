import { getSupabase } from "./_supabase";
import { getResend } from "./_resend";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const resend = getResend();

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return Response.redirect(`${SITE_URL}/subscribe?error=invalid`, 302);
    }

    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .select("id, email, status, token")
      .eq("token", token)
      .single();

    if (error || !subscriber) {
      return Response.redirect(`${SITE_URL}/subscribe?error=invalid`, 302);
    }

    if (subscriber.status === "confirmed") {
      return Response.redirect(`${SITE_URL}/subscribe?confirmed=true`, 302);
    }

    await supabase
      .from("subscribers")
      .update({
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    await resend.emails.send({
      from: "insights.codes <hello@insights.codes>",
      to: subscriber.email,
      subject: "Welcome to insights.codes",
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #e5e5e5; font-size: 20px;">You're in!</h2>
          <p style="color: #a3a3a3; line-height: 1.6;">
            Thanks for subscribing to insights.codes. You'll get an email when new posts go live.
          </p>
          <p style="color: #a3a3a3; line-height: 1.6;">
            All content is free, always. If you'd like to support the blog, you can
            <a href="${SITE_URL}/subscribe" style="color: #10b981;">become a supporter</a>.
          </p>
          <p style="color: #737373; font-size: 13px; margin-top: 30px;">
            <a href="${SITE_URL}/api/unsubscribe?token=${subscriber.token}" style="color: #737373;">Unsubscribe</a>
          </p>
        </div>
      `,
    });

    return Response.redirect(`${SITE_URL}/subscribe?confirmed=true`, 302);
  } catch (err) {
    console.error("Confirm error:", err);
    return Response.redirect(`${SITE_URL}/subscribe?error=server`, 302);
  }
}
