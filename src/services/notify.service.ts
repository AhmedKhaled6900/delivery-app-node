import nodemailer from 'nodemailer';
import twilio from 'twilio';
import { env } from '../config/env';
import type { OtpChannel } from '../types';
import { ApiError } from '../utils/ApiError';

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
    if (env.nodeEnv === 'production') {
      throw new ApiError(500, 'Email OTP is not configured (SMTP_* variables are missing)');
    }
    console.log(`[DEV OTP EMAIL] ${to} → ${html}`);
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  try {
    await transporter.sendMail({
      from: env.smtp.from,
      to,
      subject,
      html,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('SMTP sendMail failed:', message);
    throw new ApiError(502, 'Email provider failed to send OTP');
  }
}

async function sendSms(to: string, body: string): Promise<void> {
  if (!env.twilio.accountSid || !env.twilio.authToken || !env.twilio.from) {
    if (env.nodeEnv === 'production') {
      throw new ApiError(500, 'SMS OTP is not configured (TWILIO_* variables are missing)');
    }
    console.log(`[DEV OTP SMS] ${to} → ${body}`);
    return;
  }

  try {
    const client = twilio(env.twilio.accountSid, env.twilio.authToken);
    const msg = await client.messages.create({
      from: env.twilio.from,
      to,
      body,
    });
    console.log(`Twilio SMS queued: sid=${msg.sid} to=${to}`);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Twilio send failed:', message);
    // Common Twilio causes: trial account can't send to unverified numbers, from-number not SMS-capable,
    // destination country not enabled, invalid credentials.
    throw new ApiError(502, 'SMS provider failed to send OTP');
  }
}
