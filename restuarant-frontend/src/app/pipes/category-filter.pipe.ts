import { Pipe, PipeTransform } from '@angular/core';
import { MenuItem } from '../models/menu-item.model';

@Pipe({
  name: 'categoryFilter',
  standalone: true
})
export class CategoryFilterPipe implements PipeTransform {
  transform(items: MenuItem[] | null, category: string): MenuItem[] {
    if (!items || !category || category === 'All') {
      return items || [];
    }
    return items.filter(item => item.category === category);
  }
}
