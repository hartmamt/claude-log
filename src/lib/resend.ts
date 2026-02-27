import { Resend } from "resend";

let _resend: Resend | null = null;

export function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("Missing RESEND_API_KEY");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}
