import { z } from "zod";

export const applOptionDtoSchema = z.object({
  option_id: z.number(),
  opt_grp_id: z.number(),
  opt_group: z.string().default(""),
  opt_code: z.number(),
  opt_description: z.string().default(""),
  srl_no: z.number().nullable().optional(),
  is_active: z.boolean().nullable().optional(),
});
