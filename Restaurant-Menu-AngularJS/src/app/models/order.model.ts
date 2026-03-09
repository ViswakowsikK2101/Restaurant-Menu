import { MenuItem } from './menu-item.model';
import { Customer } from './customer.model';

export interface Order {
  id?: number;
  customer: Customer;
  items: MenuItem[];
  total: number;
  date: Date;
}
