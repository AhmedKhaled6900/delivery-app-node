import { parsePhoneNumberFromString, type CountryCode } from 'libphonenumber-js';
import { ApiError } from './ApiError';

export function normalizePhone(phone: string, countryCode?: string): string {
  const region = (countryCode?.toUpperCase() || undefined) as CountryCode | undefined;
  const parsed = parsePhoneNumberFromString(phone, region);

  if (!parsed?.isValid()) {
    throw new ApiError(400, 'Invalid phone number for the selected country');
  }

  return parsed.format('E.164');
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}
