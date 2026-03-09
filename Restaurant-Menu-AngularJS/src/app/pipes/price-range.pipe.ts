import { Pipe, PipeTransform } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';

@Pipe({
  name: 'priceRange',
  standalone: true,
})
export class PriceRangePipe implements PipeTransform {
  transform(items: MenuItem[] | null, range: string): MenuItem[] {
    if (!items || !range || range === 'All') {
      return items || [];
    }

    switch (range) {
      case 'Under 150':
        return items.filter((item) => item.price < 150);
      case '150-250':
        return items.filter((item) => item.price >= 150 && item.price <= 250);
      case 'Above 250':
        return items.filter((item) => item.price > 250);
      default:
        return items;
    }
  }
}
