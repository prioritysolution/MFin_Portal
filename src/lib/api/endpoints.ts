/**
 * Documented Laravel API paths from apilist.txt.
 * Do not invent endpoints here.
 *
 * `bff` = same-origin Next.js route handlers the browser may call.
 * Laravel paths are only used server-side via the API client + Bearer token.
 */
export const endpoints = {
  auth: {
    login: "/api/auth/login",
    logout: "/api/auth/logout",
  },
  /** Same-origin BFF routes (browser → Next → Laravel). */
  bff: {
    menu: "/api/menu",
    auditLog: "/api/security/audit-log",
    smsSettings: "/api/master/sms-settings",
    whatsAppSettings: "/api/master/whatsapp-settings",
    finYear: "/api/master/fin-year",
    holiday: "/api/master/holiday",
    center: "/api/master/center",
    operationalDays: "/api/master/operational-days",
    roleMenu: "/api/master/role-menu",
    securityPolicy: "/api/security/login-settings",
    acctCategory: "/api/master/acct-category",
    acctHead: "/api/master/acct-head",
    acctLedger: "/api/master/acct-ledger",
    acctSubledger: "/api/master/acct-subledger",
    acctSubledgerBranch: "/api/master/acct-subledger-branch",
    makerChecker: "/api/master/maker-checker",
  },
  menuTree: "/api/MenuTree",
  stateList: "/api/StateList",
  role: {
    list: "/api/RoleList",
    add: "/api/RoleAdd",
    edit: "/api/RoleEdit",
  },
  roleMenu: {
    get: "/api/RoleMenuGet",
    assign: "/api/RoleMenuAssign",
  },
  acctCategory: {
    list: "/api/AcctCategoryList",
    add: "/api/AcctCategoryAdd",
    edit: "/api/AcctCategoryEdit",
  },
  acctHead: {
    list: "/api/AcctHeadList",
    add: "/api/AcctHeadAdd",
    edit: "/api/AcctHeadEdit",
  },
  acctLedger: {
    list: "/api/AcctLedgerList",
    add: "/api/AcctLedgerAdd",
    edit: "/api/AcctLedgerEdit",
  },
  acctSubledger: {
    list: "/api/AcctSubledgerList",
    add: "/api/AcctSubledgerAdd",
    edit: "/api/AcctSubledgerEdit",
  },
  acctSubledgerBranch: {
    list: "/api/AcctSubledgerBranchList",
    add: "/api/AcctSubledgerBranchAdd",
    edit: "/api/AcctSubledgerBranchEdit",
  },
  org: {
    get: "/api/OrgGet",
    update: "/api/OrgUpdate",
  },
  codeSeries: {
    list: "/api/CodeSeriesList",
    update: "/api/CodeSeriesUpdate",
  },
  workingHours: {
    get: "/api/WorkingHoursGet",
    update: "/api/WorkingHoursUpdate",
  },
  smsSettings: {
    get: "/api/SmsSettingsGet",
    update: "/api/SmsSettingsUpdate",
  },
  whatsAppSettings: {
    get: "/api/WhatsAppSettingsGet",
    update: "/api/WhatsAppSettingsUpdate",
  },
  rbiLendingPolicy: {
    get: "/api/RbiLendingPolicyGet",
    update: "/api/RbiLendingPolicyUpdate",
  },
  branch: {
    list: "/api/BranchList",
    add: "/api/BranchAdd",
    edit: "/api/BranchEdit",
  },
  staff: {
    list: "/api/StaffList",
    add: "/api/StaffAdd",
    edit: "/api/StaffEdit",
    designationList: "/api/DesignationList",
    moduleAccessList: "/api/ModuleAccessList",
  },
  auditLog: {
    list: "/api/AuditLogList",
  },
  securityPolicy: {
    get: "/api/SecurityPolicyGet",
    update: "/api/SecurityPolicyUpdate",
  },
  finYear: {
    list: "/api/FinYearGet",
    update: "/api/FinYearUpdate",
  },
  holiday: {
    list: "/api/HolidayGet",
    update: "/api/HolidayUpdate",
  },
  center: {
    list: "/api/CenterList",
    add: "/api/CenterAdd",
    edit: "/api/CenterEdit",
  },
  operationalDays: {
    list: "/api/OperationalDaysList",
    add: "/api/OperationalDaysAdd",
    edit: "/api/OperationalDaysEdit",
  },
  makerChecker: {
    list: "/api/MakerCheckerList",
    add: "/api/MakerCheckerAdd",
    edit: "/api/MakerCheckerEdit",
  },
} as const;

/** Normalize a path to always start with `/`. */
export function toApiPath(path: string): string {
  if (!path) {
    throw new Error("API path must be a non-empty string");
  }
  return path.startsWith("/") ? path : `/${path}`;
}

/**
 * Join base URL and path without duplicating slashes.
 * Does not append query strings — use the API client `searchParams` option.
 */
export function joinApiUrl(baseUrl: string, path: string): string {
  const normalizedBase = baseUrl.replace(/\/+$/, "");
  const normalizedPath = toApiPath(path);
  return `${normalizedBase}${normalizedPath}`;
}
