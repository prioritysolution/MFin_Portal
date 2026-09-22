import { z } from "zod";

const nullableString = z.union([z.string(), z.null()]).optional().transform((v) => v ?? null);

const nullableRoute = z
  .union([z.string(), z.null()])
  .optional()
  .transform((v) => v ?? null);

export const menuTreeChildDtoSchema = z.object({
  menu_sl: z.coerce.number(),
  menu_id: z.coerce.number(),
  submenu_id: z.coerce.number(),
  submenu_name: z.string(),
  icon: nullableString,
  route: nullableRoute,
  status: z.coerce.number(),
});

export const menuTreeNodeDtoSchema = z.object({
  menu_sl: z.coerce.number(),
  menu_id: z.coerce.number(),
  menu_name: z.string(),
  icon: nullableString,
  route: nullableRoute,
  status: z.coerce.number(),
  children: z
    .union([z.array(z.unknown()), z.null()])
    .optional()
    .transform((v) => v ?? []),
});
