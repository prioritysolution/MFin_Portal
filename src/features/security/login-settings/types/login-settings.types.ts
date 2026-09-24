/**
 * Admin login-security draft.
 * Shape is local until the Laravel login-policy API is available.
 */

export type LoginSecurityDraft = {
  maxAttempts: number;
  lockMinutes: number;
  dailyResetTime: string;
  minLength: number;
  maxLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSpecial: boolean;
  uniquePasswordCount: number;
  expirationEnabled: boolean;
  expirationDays: number;
};

export const LOGIN_SECURITY_DEFAULTS: LoginSecurityDraft = {
  maxAttempts: 5,
  lockMinutes: 15,
  dailyResetTime: "00:00",
  minLength: 8,
  maxLength: 32,
  requireUppercase: true,
  requireLowercase: true,
  requireDigit: true,
  requireSpecial: true,
  uniquePasswordCount: 5,
  expirationEnabled: true,
  expirationDays: 90,
};
