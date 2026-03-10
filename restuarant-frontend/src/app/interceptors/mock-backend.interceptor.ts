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

interface MockAuthUser {
  id: number;
  name: string;
  email: string;
  password: string;
  address: string;
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
  createdAt: string;
  updatedAt: string;
}

const ORDER_STORAGE_KEY = 'urban-plate-mock-orders';
const USER_STORAGE_KEY = 'urban-plate-mock-users';
const CANCELLATION_WINDOW_MINUTES = 15;
const DEFAULT_AUTH_USERS: MockAuthUser[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: 'john@123',
    address: '123, Main City, New York',
    cardNumber: '1234 5678 9101 1234',
    cardHolder: 'John Doe',
    expiry: '08/28',
    cvv: '123',
    createdAt: '2026-03-09T05:58:44.553Z',
    updatedAt: '2026-03-09T05:58:44.553Z'
  }
];

const hasStorage = () => typeof localStorage !== 'undefined';
const normalizeEmail = (email?: string): string => String(email || '').trim().toLowerCase();

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

const sanitizeUser = (user: MockAuthUser) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  address: user.address,
  cardNumber: user.cardNumber,
  cardHolder: user.cardHolder,
  expiry: user.expiry,
  cvv: user.cvv,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

const writeMockUsers = (users: MockAuthUser[]): void => {
  if (!hasStorage()) {
    return;
  }

  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(users));
};

const readMockUsers = (): MockAuthUser[] => {
  if (!hasStorage()) {
    return DEFAULT_AUTH_USERS;
  }

  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) {
      writeMockUsers(DEFAULT_AUTH_USERS);
      return DEFAULT_AUTH_USERS;
    }

    const parsed = JSON.parse(raw) as MockAuthUser[];
    if (!Array.isArray(parsed)) {
      writeMockUsers(DEFAULT_AUTH_USERS);
      return DEFAULT_AUTH_USERS;
    }

    return parsed;
  } catch {
    writeMockUsers(DEFAULT_AUTH_USERS);
    return DEFAULT_AUTH_USERS;
  }
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
  },
  {
    id: 24,
    name: 'Herb Crusted Grilled Salmon',
    description: 'Pan-seared salmon with herbed crust, garlic mash, and lemon butter.',
    price: 429,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course',
    rating: 4.9,
    isChefPick: true
  },
  {
    id: 25,
    name: 'Creamy Butter Chicken Bowl',
    description: 'Smoky tandoor chicken simmered in rich tomato-butter gravy.',
    price: 379,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course',
    rating: 4.8,
    isPopular: true
  },
  {
    id: 26,
    name: 'Four Cheese Volcano Pizza',
    description: 'Mozzarella, cheddar, parmesan, and gouda on a crispy base.',
    price: 369,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
    rating: 4.8,
    isChefPick: true
  },
  {
    id: 27,
    name: 'Spicy Pepperoni Feast',
    description: 'Pepperoni-loaded pizza with jalapenos and chili oil drizzle.',
    price: 389,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
    rating: 4.7,
    isPopular: true,
    isSpicy: true
  },
  {
    id: 28,
    name: 'Nashville Crunch Chicken Burger',
    description: 'Crispy chicken fillet, pickles, spicy mayo, and slaw.',
    price: 279,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=60',
    category: 'Burger',
    rating: 4.8,
    isPopular: true,
    isSpicy: true
  },
  {
    id: 29,
    name: 'BBQ Bacon Smash Burger',
    description: 'Double smashed patties, smoky BBQ glaze, bacon, and cheddar.',
    price: 299,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60',
    category: 'Burger',
    rating: 4.7,
    isChefPick: true
  },
  {
    id: 30,
    name: 'Avocado Citrus Power Salad',
    description: 'Avocado, baby greens, citrus, seeds, and honey-lime dressing.',
    price: 239,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60',
    category: 'Salad',
    rating: 4.6,
    isPopular: true
  },
  {
    id: 31,
    name: 'Roasted Beetroot Goat Cheese Salad',
    description: 'Roasted beets, goat cheese, walnuts, and balsamic glaze.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=500&q=60',
    category: 'Salad',
    rating: 4.7,
    isChefPick: true
  },
  {
    id: 32,
    name: 'Tandoori Chicken Kathi Wrap',
    description: 'Charred tandoori chicken, onions, mint chutney, and soft roti.',
    price: 249,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=60',
    category: 'Wraps',
    rating: 4.8,
    isPopular: true,
    isSpicy: true
  },
  {
    id: 33,
    name: 'Falafel Hummus Crunch Wrap',
    description: 'Crispy falafel, hummus, veggies, and tahini in a toasted wrap.',
    price: 229,
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=500&q=60',
    category: 'Wraps',
    rating: 4.6,
    isChefPick: true
  }
];

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const { url, method, body } = req;

  // Mock POST /api/auth/register
  if (url.endsWith('/api/auth/register') && method === 'POST') {
    const registerBody = body as {
      name?: string;
      email?: string;
      password?: string;
      address?: string;
      cardNumber?: string;
      cardHolder?: string;
      expiry?: string;
      cvv?: string;
    };

    const requiredFields = [
      registerBody.name,
      registerBody.email,
      registerBody.password,
      registerBody.address,
      registerBody.cardNumber,
      registerBody.cardHolder,
      registerBody.expiry,
      registerBody.cvv,
    ];

    if (requiredFields.some((value) => !String(value || '').trim())) {
      return of(new HttpResponse({
        status: 400,
        body: { message: 'All fields are required for registration.' }
      })).pipe(delay(300));
    }

    const users = readMockUsers();
    const normalizedEmail = normalizeEmail(registerBody.email);
    const existing = users.find((user) => user.email === normalizedEmail);

    if (existing) {
      return of(new HttpResponse({
        status: 409,
        body: { message: 'User already exists. Please login.' }
      })).pipe(delay(300));
    }

    const nextId = users.length > 0 ? Math.max(...users.map((user) => Number(user.id) || 0)) + 1 : 1;
    const now = new Date().toISOString();
    const newUser: MockAuthUser = {
      id: nextId,
      name: String(registerBody.name).trim(),
      email: normalizedEmail,
      password: String(registerBody.password),
      address: String(registerBody.address).trim(),
      cardNumber: String(registerBody.cardNumber).trim(),
      cardHolder: String(registerBody.cardHolder).trim(),
      expiry: String(registerBody.expiry).trim(),
      cvv: String(registerBody.cvv).trim(),
      createdAt: now,
      updatedAt: now,
    };

    writeMockUsers([...users, newUser]);

    return of(new HttpResponse({
      status: 201,
      body: {
        message: 'Registration successful',
        user: sanitizeUser(newUser)
      }
    })).pipe(delay(500));
  }

  // Mock POST /api/auth/login
  if (url.endsWith('/api/auth/login') && method === 'POST') {
    const loginBody = body as { email?: string; password?: string };
    const email = normalizeEmail(loginBody.email);
    const password = String(loginBody.password || '');

    if (!email || !password) {
      return of(new HttpResponse({
        status: 400,
        body: { message: 'Email and password are required.' }
      })).pipe(delay(300));
    }

    const users = readMockUsers();
    const user = users.find((entry) => entry.email === email && entry.password === password);

    if (!user) {
      return of(new HttpResponse({
        status: 401,
        body: { message: 'Invalid email or password.' }
      })).pipe(delay(350));
    }

    return of(new HttpResponse({
      status: 200,
      body: {
        message: 'Login successful',
        user: sanitizeUser(user)
      }
    })).pipe(delay(400));
  }

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
