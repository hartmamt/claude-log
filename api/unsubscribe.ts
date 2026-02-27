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

    await supabase
      .from("subscribers")
      .update({
        status: "unsubscribed",
        unsubscribed_at: new Date().toISOString(),
      })
      .eq("id", subscriber.id);

    const audienceId = process.env.RESEND_AUDIENCE_ID;
    if (audienceId) {
      try {
        await resend.contacts.update({
          audienceId,
          id: subscriber.email,
          unsubscribed: true,
        });
      } catch {
        // Best effort
      }
    }

    return Response.redirect(`${SITE_URL}/subscribe?unsubscribed=true`, 302);
  } catch (err) {
    console.error("Unsubscribe error:", err);
    return Response.redirect(`${SITE_URL}/subscribe?error=server`, 302);
  }
}
