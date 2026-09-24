import { z } from "zod";

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const loginSecurityDraftSchema = z
  .object({
    maxAttempts: z.number().int().min(1).max(20),
    lockMinutes: z.number().int().min(1).max(1440),
    dailyResetTime: z.string().regex(timePattern),
    minLength: z.number().int().min(6).max(64),
    maxLength: z.number().int().min(6).max(128),
    requireUppercase: z.boolean(),
    requireLowercase: z.boolean(),
    requireDigit: z.boolean(),
    requireSpecial: z.boolean(),
    uniquePasswordCount: z.number().int().min(0).max(24),
    expirationEnabled: z.boolean(),
    expirationDays: z.number().int().min(1).max(365),
  })
  .refine((value) => value.maxLength >= value.minLength, {
    path: ["maxLength"],
  });

export type LoginSecurityDraftParsed = z.infer<typeof loginSecurityDraftSchema>;
