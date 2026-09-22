import type {
  MenuTreeChild,
  MenuTreeChildDto,
  MenuTreeNode,
  MenuTreeNodeDto,
} from "@/features/navigation/types/menu";
import { resolveMenuRoute } from "@/features/navigation/utils/menu-route-fallbacks";

function mapChild(dto: MenuTreeChildDto): MenuTreeChild {
  return {
    id: dto.menu_sl,
    menuId: dto.menu_id,
    submenuId: dto.submenu_id,
    name: dto.submenu_name,
    icon: dto.icon,
    route: resolveMenuRoute({
      route: dto.route,
      menuId: dto.menu_id,
      submenuId: dto.submenu_id,
      name: dto.submenu_name,
    }),
    status: dto.status,
  };
}

export function mapMenuTreeNode(dto: MenuTreeNodeDto): MenuTreeNode {
  return {
    id: dto.menu_sl,
    menuId: dto.menu_id,
    name: dto.menu_name,
    icon: dto.icon,
    route: resolveMenuRoute({
      route: dto.route,
      menuId: dto.menu_id,
      name: dto.menu_name,
    }),
    status: dto.status,
    children: (dto.children ?? []).map(mapChild),
  };
}
