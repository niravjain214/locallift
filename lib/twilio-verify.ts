import twilio from "twilio";

export function getTwilioVerify():
  | { client: ReturnType<typeof twilio>; verifySid: string }
  | null {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const verifySid = process.env.TWILIO_VERIFY_SERVICE_SID;
  if (!sid || !token || !verifySid) return null;
  return { client: twilio(sid, token), verifySid };
}

export async function sendVerificationSms(toE164: string): Promise<void> {
  const t = getTwilioVerify();
  if (!t) throw new Error("Twilio Verify is not configured");
  await t.client.verify.v2.services(t.verifySid).verifications.create({
    to: toE164,
    channel: "sms",
  });
}

export async function checkVerificationCode(
  toE164: string,
  code: string
): Promise<boolean> {
  const t = getTwilioVerify();
  if (!t) throw new Error("Twilio Verify is not configured");
  const check = await t.client.verify.v2
    .services(t.verifySid)
    .verificationChecks.create({ to: toE164, code: code.trim() });
  return check.status === "approved";
}
