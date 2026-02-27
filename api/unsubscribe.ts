import { supabase } from "./_supabase";
import { resend } from "./_resend";

const SITE_URL = process.env.SITE_URL || "https://insights.codes";
const RESEND_AUDIENCE_ID = process.env.RESEND_AUDIENCE_ID!;

export async function GET(request: Request) {
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

  // Update status
  await supabase
    .from("subscribers")
    .update({
      status: "unsubscribed",
      unsubscribed_at: new Date().toISOString(),
    })
    .eq("id", subscriber.id);

  // Update Resend contact
  try {
    await resend.contacts.update({
      audienceId: RESEND_AUDIENCE_ID,
      id: subscriber.email,
      unsubscribed: true,
    });
  } catch {
    // Best effort
  }

  return Response.redirect(`${SITE_URL}/subscribe?unsubscribed=true`, 302);
}
