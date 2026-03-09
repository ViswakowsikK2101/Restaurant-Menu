import { MenuItem } from './menu-item.model';

export interface CartItem extends MenuItem {
  quantity: number;
}
