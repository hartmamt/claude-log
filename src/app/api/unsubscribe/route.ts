import { getSupabase } from "@/lib/supabase";
import { getResend } from "@/lib/resend";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
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
      // Best effort — Resend contact may not exist
    }
  }

  redirect(`/subscribe?unsubscribed=true`);
}
