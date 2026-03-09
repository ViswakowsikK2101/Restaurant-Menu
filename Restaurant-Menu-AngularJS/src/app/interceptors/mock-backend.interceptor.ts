import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { MenuItem } from '../models/menu-item.model';

interface MockOrder {
  id: number;
  customer: {
    name: string;
    email: string;
    address: string;
  };
  items: Array<{
    id?: number;
    name?: string;
    price?: number;
    quantity?: number;
  }>;
  total: number;
  date: string;
  status: 'placed' | 'cancelled';
  cancelledAt: string | null;
}

const ORDER_STORAGE_KEY = 'urban-plate-mock-orders';
const CANCELLATION_WINDOW_MINUTES = 15;

const hasStorage = () => typeof localStorage !== 'undefined';

const readMockOrders = (): MockOrder[] => {
  if (!hasStorage()) {
    return [];
  }

  try {
    const raw = localStorage.getItem(ORDER_STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as MockOrder[]) : [];
    return Array.isArray(parsed)
      ? parsed.map((order) => ({
          ...order,
          status: order.status || 'placed',
          cancelledAt: order.cancelledAt || null,
        }))
      : [];
  } catch {
    return [];
  }
};

const writeMockOrders = (orders: MockOrder[]): void => {
  if (!hasStorage()) {
    return;
  }

  localStorage.setItem(ORDER_STORAGE_KEY, JSON.stringify(orders));
};

const isWithinCancellationWindow = (orderDateIso: string): boolean => {
  const orderTimestamp = Date.parse(orderDateIso);
  if (Number.isNaN(orderTimestamp)) {
    return false;
  }

  const elapsedMs = Date.now() - orderTimestamp;
  return elapsedMs <= CANCELLATION_WINDOW_MINUTES * 60 * 1000;
};

const MENU_ITEMS: MenuItem[] = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
    rating: 4.6,
    isPopular: true
  },
  {
    id: 2,
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing.',
    price: 149,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60',
    category: 'Starters',
    rating: 4.3
  },
  {
    id: 3,
    name: 'Spaghetti Carbonara',
    description: 'Pasta with eggs, cheese, pancetta, and black pepper.',
    price: 289,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=60',
    category: 'Pasta',
    rating: 4.7,
    isChefPick: true
  },
  {
    id: 4,
    name: 'Tiramisu',
    description: 'Coffee-flavoured Italian dessert.',
    price: 169,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=60',
    category: 'Desserts',
    rating: 4.5
  },
  {
    id: 5,
    name: 'Garlic Bread',
    description: 'Toasted bread topped with garlic and olive oil.',
    price: 109,
    image: 'https://www.ambitiouskitchen.com/wp-content/uploads/2018/01/garlicbread-2.jpg',
    category: 'Starters',
    rating: 4.2
  },
  {
    id: 6,
    name: 'Lemonade',
    description: 'Freshly squeezed lemon juice with water and sugar.',
    price: 99,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60',
    category: 'Drinks',
    rating: 4.1
  },
  {
    id: 7,
    name: 'Paneer Tikka Pizza',
    description: 'Stone-baked pizza topped with spiced paneer, onion, and capsicum.',
    price: 319,
    image: 'https://images.unsplash.com/photo-1594007654729-407eedc4be65?auto=format&fit=crop&w=500&q=60',
    category: 'Specials',
    rating: 4.8,
    isPopular: true,
    isSpicy: true,
    isChefPick: true
  },
  {
    id: 8,
    name: 'Classic Veg Burger',
    description: 'Crispy veg patty with cheese, lettuce, and house burger sauce.',
    price: 189,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=60',
    category: 'Burger',
    rating: 4.4,
    isPopular: true
  },
  {
    id: 9,
    name: 'Mushroom Risotto',
    description: 'Creamy arborio rice with mushrooms, parmesan, and herbs.',
    price: 339,
    image: 'https://images.unsplash.com/photo-1476124369491-e7addf5db371?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course',
    rating: 4.7,
    isChefPick: true
  },
  {
    id: 10,
    name: 'Greek Salad Bowl',
    description: 'Cucumber, olives, tomatoes, feta, and lemon-oregano dressing.',
    price: 179,
    image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=500&q=60',
    category: 'Salad',
    rating: 4.3,
    isNew: true
  },
  {
    id: 11,
    name: 'Smoky Veg Wrap',
    description: 'Chargrilled veggies and hummus wrapped in soft flatbread.',
    price: 169,
    image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?auto=format&fit=crop&w=500&q=60',
    category: 'Wraps',
    rating: 4.2,
    isNew: true
  },
  {
    id: 12,
    name: 'Loaded Nachos',
    description: 'Crispy nachos layered with salsa, jalapenos, and cheese sauce.',
    price: 159,
    image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=500&q=60',
    category: 'Starters',
    rating: 4.5,
    isPopular: true,
    isSpicy: true
  },
  {
    id: 13,
    name: 'Cold Coffee Float',
    description: 'Chilled coffee shake with vanilla ice cream and cocoa.',
    price: 129,
    image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=60',
    category: 'Drinks',
    rating: 4.4,
    isPopular: true
  },
  {
    id: 14,
    name: 'Chocolate Lava Cake',
    description: 'Warm chocolate cake with molten center and vanilla drizzle.',
    price: 189,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=60',
    category: 'Desserts',
    rating: 4.6,
    isNew: true
  },
  {
    id: 15,
    name: 'Pesto Penne',
    description: 'Penne tossed in basil pesto with roasted cherry tomatoes.',
    price: 279,
    image: 'https://images.unsplash.com/photo-1556761223-4c4282c73f77?auto=format&fit=crop&w=500&q=60',
    category: 'Pasta',
    rating: 4.6
  },
  {
    id: 16,
    name: 'Signature Thali',
    description: 'Chef curated platter with breads, curry, dal, rice, and dessert.',
    price: 359,
    image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=500&q=60',
    category: 'Specials',
    rating: 4.9,
    isPopular: true,
    isChefPick: true
  },
  {
    id: 17,
    name: 'Virgin Mojito',
    description: 'Mint, lime, and soda served over ice.',
    price: 119,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=500&q=60',
    category: 'Drinks',
    rating: 4.4,
    isNew: true
  },
  {
    id: 18,
    name: 'Watermelon Cooler',
    description: 'Fresh watermelon juice with basil and lemon.',
    price: 129,
    image: 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=500&q=60',
    category: 'Drinks',
    rating: 4.3
  },
  {
    id: 19,
    name: 'Truffle Mushroom Steak',
    description: 'Grilled mushroom steak with truffle butter and pepper jus.',
    price: 389,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course',
    rating: 4.8,
    isChefPick: true
  },
  {
    id: 20,
    name: 'Smoky BBQ Chicken Pizza',
    description: 'Loaded with barbecue chicken, onions, and mozzarella.',
    price: 349,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
    rating: 4.8,
    isPopular: true
  },
  {
    id: 21,
    name: 'Double Cheese Crunch Burger',
    description: 'Juicy double patty burger with cheddar and crispy onions.',
    price: 259,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60',
    category: 'Burger',
    rating: 4.7,
    isPopular: true
  },
  {
    id: 22,
    name: 'Mediterranean Quinoa Salad',
    description: 'Quinoa, olives, feta, cherry tomatoes, and lemon dressing.',
    price: 219,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=60',
    category: 'Salad',
    rating: 4.6,
    isChefPick: true
  },
  {
    id: 23,
    name: 'Peri Peri Paneer Wrap',
    description: 'Spicy paneer, crunchy veggies, and creamy garlic mayo wrap.',
    price: 209,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=60',
    category: 'Wraps',
    rating: 4.7,
    isPopular: true,
    isSpicy: true
  }
];

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const { url, method, body } = req;

  // Mock GET /api/menu
  if (url.endsWith('/api/menu') && method === 'GET') {
    return of(new HttpResponse({ status: 200, body: MENU_ITEMS })).pipe(delay(500));
  }

  // Mock GET /api/menu/:id
  const match = url.match(/\/api\/menu\/(\d+)$/);
  if (match && method === 'GET') {
    const id = parseInt(match[1], 10);
    const item = MENU_ITEMS.find(i => i.id === id);
    if (item) {
      return of(new HttpResponse({ status: 200, body: item })).pipe(delay(500));
    } else {
      return of(new HttpResponse({ status: 404, body: { message: 'Item not found' } })).pipe(delay(500));
    }
  }

  // Mock POST /api/orders
  if (url.endsWith('/api/orders') && method === 'POST') {
    const orderBody = body as {
      customer?: { name?: string; email?: string; address?: string };
      items?: Array<{ id?: number; name?: string; price?: number; quantity?: number }>;
      total?: number;
      date?: string;
    };

    const orders = readMockOrders();
    const nextId = orders.length > 0 ? Math.max(...orders.map((entry) => entry.id)) + 1 : 1;
    const newOrder: MockOrder = {
      id: nextId,
      customer: {
        name: orderBody.customer?.name || 'Customer',
        email: String(orderBody.customer?.email || '').trim().toLowerCase(),
        address: orderBody.customer?.address || '',
      },
      items: Array.isArray(orderBody.items) ? orderBody.items : [],
      total: Number(orderBody.total) || 0,
      date: orderBody.date ? new Date(orderBody.date).toISOString() : new Date().toISOString(),
      status: 'placed',
      cancelledAt: null,
    };

    writeMockOrders([newOrder, ...orders]);

    return of(new HttpResponse({ 
      status: 201, 
      body: { message: 'Order placed successfully', order: newOrder } 
    })).pipe(delay(1000));
  }

  // Mock GET /api/orders?email=...
  if (url.includes('/api/orders') && method === 'GET') {
    const orders = readMockOrders();
    const emailFilter = req.params.get('email');
    const filtered = emailFilter
      ? orders.filter((order) => order.customer.email === emailFilter.trim().toLowerCase())
      : orders;

    return of(new HttpResponse({ status: 200, body: filtered })).pipe(delay(400));
  }

  // Mock PATCH /api/orders/:id/cancel
  const cancelMatch = url.match(/\/api\/orders\/(\d+)\/cancel$/);
  if (cancelMatch && method === 'PATCH') {
    const orderId = Number(cancelMatch[1]);
    const orders = readMockOrders();
    const target = orders.find((order) => order.id === orderId);

    if (!target) {
      return of(new HttpResponse({ status: 404, body: { message: 'Order not found' } })).pipe(delay(300));
    }

    if (target.status === 'cancelled') {
      return of(new HttpResponse({ status: 409, body: { message: 'Order already cancelled', order: target } })).pipe(delay(300));
    }

    if (!isWithinCancellationWindow(target.date)) {
      return of(new HttpResponse({
        status: 409,
        body: {
          message: `Cancellation is allowed only within ${CANCELLATION_WINDOW_MINUTES} minutes of placing the order.`,
          order: target,
        }
      })).pipe(delay(300));
    }

    target.status = 'cancelled';
    target.cancelledAt = new Date().toISOString();
    writeMockOrders(orders);

    return of(new HttpResponse({ status: 200, body: { message: 'Order cancelled successfully', order: target } })).pipe(delay(500));
  }

  // Pass through other requests
  return next(req);
};
