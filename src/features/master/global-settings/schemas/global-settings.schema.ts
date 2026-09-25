import { z } from "zod";

export const globalSettingsUpdateInputSchema = z
  .object({
    timezone: z.string().min(1, "Timezone is required"),
    dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
    currencyCode: z.string().min(1, "Currency is required"),
    decimalPlaces: z
      .number()
      .int()
      .min(0, "Decimal places must be at least 0")
      .max(4, "Decimal places must be at most 4"),
    defaultLocale: z.enum(["en", "bn", "hi", "or"]),
    dayCountBasis: z.enum(["365", "360"]),
    roundingMode: z.enum(["nearest", "up", "down"]),
    allowBackdatedTxn: z.boolean(),
    maxBackdateDays: z
      .number()
      .int()
      .min(0, "Max backdate days must be at least 0")
      .max(365, "Max backdate days must be at most 365"),
    multiBranchAccess: z.boolean(),
    requireMakerCheckerMasters: z.boolean(),
    forceEodBeforeNextDay: z.boolean(),
    auditRetentionDays: z
      .number()
      .int()
      .min(30, "Audit retention must be at least 30 days")
      .max(3650, "Audit retention must be at most 3650 days"),
  })
  .superRefine((value, ctx) => {
    if (!value.allowBackdatedTxn && value.maxBackdateDays > 0) {
      ctx.addIssue({
        code: "custom",
        path: ["maxBackdateDays"],
        message: "Set max backdate days to 0 when backdating is disabled",
      });
    }
    if (value.allowBackdatedTxn && value.maxBackdateDays < 1) {
      ctx.addIssue({
        code: "custom",
        path: ["maxBackdateDays"],
        message: "Enter at least 1 day when backdating is enabled",
      });
    }
  });

export type GlobalSettingsUpdateInputParsed = z.infer<
  typeof globalSettingsUpdateInputSchema
>;
