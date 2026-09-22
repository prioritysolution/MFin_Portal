import { z } from "zod";

/** Documented login request body from apilist.txt */
export const loginRequestSchema = z.object({
  login: z.string().trim().min(1),
  password: z.string().min(1),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

export type AuthRoleDto = {
  role_id: number;
  role_name: string;
  is_admin?: boolean;
};

/** Laravel login `data.user` DTO (snake_case; optional fields vary by API version). */
export type AuthUserDto = {
  user_id: number;
  org_id: number;
  branch_id: number;
  user_name: string;
  short_name?: string | null;
  user_code?: string | null;
  user_mob?: string | null;
  user_email?: string | null;
  is_active: boolean;
  login_status?: string | null;
  org_disp_nm: string;
  legal_name: string;
  org_schema: string;
  branch_code: string;
  branch_name: string;
  is_head: boolean;
  /** Primary role — required for MenuTree `role_id` query. */
  role_id?: number | null;
  role_name?: string | null;
  is_admin?: boolean | null;
  roles?: AuthRoleDto[] | null;
};

/** Laravel login `data` DTO — supports snake_case docs and camelCase live API. */
export type LoginDataDto = {
  token: string;
  token_type?: "Bearer" | string;
  tokenType?: string;
  expires_in?: number;
  expiresIn?: number;
  org_schema?: string;
  orgSchema?: string;
  user: AuthUserDto;
};

export type AuthRole = {
  roleId: number;
  roleName: string;
  isAdmin: boolean;
};

/** Frontend domain user model. */
export type AuthUser = {
  userId: number;
  orgId: number;
  branchId: number;
  userName: string;
  shortName: string;
  userCode: string;
  userMob: string;
  userEmail: string;
  isActive: boolean;
  loginStatus: string;
  orgDisplayName: string;
  legalName: string;
  orgSchema: string;
  branchCode: string;
  branchName: string;
  isHead: boolean;
  roleId: number | null;
  roleName: string | null;
  isAdmin: boolean;
  roles: AuthRole[];
};

export type AuthSession = {
  token: string;
  tokenType: string;
  expiresAt: number;
  orgSchema: string;
  user: AuthUser;
};
