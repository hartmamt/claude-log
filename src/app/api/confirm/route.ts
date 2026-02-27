import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { redirect } from "next/navigation";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";

export async function GET(request: Request) {
  try {
    const supabase = getSupabase();
    const resend = getResend();

    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      redirect(`/subscribe?error=invalid`);
    }

    const { data: subscriber, error } = await supabase
      .from("subscribers")
      .select("id, email, status, token")
      .eq("token", token)
      .single();

    if (error || !subscriber) {
      redirect(`/subscribe?error=invalid`);
    }

    if (subscriber.status !== "confirmed") {
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
    }

    redirect(`/subscribe?confirmed=true`);
  } catch (err) {
    // redirect() throws a special error in Next.js — let it through
    throw err;
  }
}
