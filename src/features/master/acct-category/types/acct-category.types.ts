/**
 * Account Category — Laravel AcctCategoryList / Add / Edit.
 */

export type AcctCategoryDto = {
  categ_id: number;
  categ_code: string;
  categ_name: string;
  categy_type?: string | null;
  head_count?: number | null;
};

export type AcctCategory = {
  categId: number;
  categCode: string;
  categName: string;
  categoryType: string | null;
  headCount: number;
};

export type AcctCategoryListQuery = {
  page?: number;
  perPage?: number;
  categId?: number;
  keyword?: string;
  categoryType?: string;
};

export type PaginationMetaDto = {
  total: number;
  page: number;
  per_page: number;
  last_page: number;
  has_more: boolean;
};

export type PaginationMeta = {
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
  hasMore: boolean;
};

export type AcctCategoryListResult = {
  items: AcctCategory[];
  meta: PaginationMeta | null;
};

export type AcctCategoryCreateInput = {
  categName: string;
  categCode?: string | null;
  categoryType?: string | null;
};

export type AcctCategoryCreateDto = {
  categ_name: string;
  categ_code?: string | null;
  categy_type?: string | null;
};

export type AcctCategoryUpdateInput = {
  categId: number;
  categName: string;
  categCode?: string | null;
  categoryType?: string | null;
};

export type AcctCategoryUpdateDto = {
  categ_id: number;
  categ_name: string;
  categ_code?: string | null;
  categy_type?: string | null;
};

/** Common GL category type codes (2 chars). */
export const ACCT_CATEGORY_TYPE_OPTIONS = [
  "AS",
  "LI",
  "EQ",
  "IN",
  "EX",
] as const;

export type AcctCategoryTypeCode = (typeof ACCT_CATEGORY_TYPE_OPTIONS)[number];

export const ACCT_CATEGORY_DEFAULT_PER_PAGE = 50;
export const ACCT_CATEGORY_MAX_PER_PAGE = 200;
