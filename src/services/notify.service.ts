import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { env } from '../config/env';
import type { OtpChannel } from '../types';

function otpMessage(code: string, purpose: string): string {
  return `Your verification code is ${code}. Valid for ${env.otp.expiresMinutes} minutes. (${purpose})`;
}

export async function sendOtp(
  channel: OtpChannel,
  target: string,
  code: string,
  purpose: string
): Promise<void> {
  const message = otpMessage(code, purpose);

  if (channel === 'email') {
    await sendEmail(target, 'Verification code', `<p>${message}</p>`);
    return;
  }

  await sendSms(target, message);
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!env.smtp.host || !env.smtp.user || !env.smtp.pass) {
    console.log(`[DEV OTP EMAIL] ${to} → ${html}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  await transporter.sendMail({
    from: env.smtp.from,
    to,
    subject,
    html,
  });
}

async function sendSms(to: string, body: string): Promise<void> {
  if (!env.twilio.accountSid || !env.twilio.authToken || !env.twilio.from) {
    console.log(`[DEV OTP SMS] ${to} → ${body}`);
    return;
  }

  const client = twilio(env.twilio.accountSid, env.twilio.authToken);
  await client.messages.create({
    from: env.twilio.from,
    to,
    body,
  });
}
