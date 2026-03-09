export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  isPopular?: boolean;
  isNew?: boolean;
  isSpicy?: boolean;
  isChefPick?: boolean;
}
