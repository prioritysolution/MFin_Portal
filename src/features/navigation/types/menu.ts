/**
 * MenuTree DTO shapes — GET /api/MenuTree (documented fields only).
 */

export type MenuTreeChildDto = {
  menu_sl: number;
  menu_id: number;
  submenu_id: number;
  submenu_name: string;
  icon: string | null;
  route: string | null;
  status: number;
};

export type MenuTreeNodeDto = {
  menu_sl: number;
  menu_id: number;
  menu_name: string;
  icon: string | null;
  route: string | null;
  status: number;
  children: MenuTreeChildDto[];
};

export type MenuTreeChild = {
  id: number;
  menuId: number;
  submenuId: number;
  name: string;
  icon: string | null;
  route: string | null;
  status: number;
};

export type MenuTreeNode = {
  id: number;
  menuId: number;
  name: string;
  icon: string | null;
  route: string | null;
  status: number;
  children: MenuTreeChild[];
};
