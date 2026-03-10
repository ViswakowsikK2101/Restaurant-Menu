import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import {join} from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// Mock Data
const MENU_ITEMS = [
  {
    id: 1,
    name: 'Margherita Pizza',
    description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course'
  },
  {
    id: 2,
    name: 'Caesar Salad',
    description: 'Romaine lettuce, croutons, parmesan cheese, and Caesar dressing.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=500&q=60',
    category: 'Starters'
  },
  {
    id: 3,
    name: 'Spaghetti Carbonara',
    description: 'Pasta with eggs, cheese, pancetta, and black pepper.',
    price: 14.50,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course'
  },
  {
    id: 4,
    name: 'Tiramisu',
    description: 'Coffee-flavoured Italian dessert.',
    price: 6.50,
    image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?auto=format&fit=crop&w=500&q=60',
    category: 'Desserts'
  },
  {
    id: 6,
    name: 'Lemonade',
    description: 'Freshly squeezed lemon juice with water and sugar.',
    price: 3.99,
    image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=60',
    category: 'Drinks'
  },
  {
    id: 7,
    name: 'Virgin Mojito',
    description: 'Mint, lime, and soda served over ice.',
    price: 4.49,
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?auto=format&fit=crop&w=500&q=60',
    category: 'Drinks'
  },
  {
    id: 8,
    name: 'Watermelon Cooler',
    description: 'Fresh watermelon juice with basil and lemon.',
    price: 4.99,
    image: 'https://images.unsplash.com/photo-1523371054106-bbf80586c38c?auto=format&fit=crop&w=500&q=60',
    category: 'Drinks'
  },
  {
    id: 9,
    name: 'Truffle Mushroom Steak',
    description: 'Grilled mushroom steak with truffle butter and pepper jus.',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course',
    isChefPick: true
  },
  {
    id: 10,
    name: 'Smoky BBQ Chicken Pizza',
    description: 'Loaded with barbecue chicken, onions, and mozzarella.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
    isPopular: true
  },
  {
    id: 11,
    name: 'Double Cheese Crunch Burger',
    description: 'Juicy double patty burger with cheddar and crispy onions.',
    price: 9.99,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=60',
    category: 'Burger',
    isPopular: true
  },
  {
    id: 12,
    name: 'Mediterranean Quinoa Salad',
    description: 'Quinoa, olives, feta, cherry tomatoes, and lemon dressing.',
    price: 8.49,
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&w=500&q=60',
    category: 'Salad',
    isChefPick: true
  },
  {
    id: 13,
    name: 'Peri Peri Paneer Wrap',
    description: 'Spicy paneer, crunchy veggies, and creamy garlic mayo wrap.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=500&q=60',
    category: 'Wraps',
    isPopular: true
  },
  {
    id: 14,
    name: 'Herb Crusted Grilled Salmon',
    description: 'Pan-seared salmon with herbed crust, garlic mash, and lemon butter.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course',
    isChefPick: true
  },
  {
    id: 15,
    name: 'Creamy Butter Chicken Bowl',
    description: 'Smoky tandoor chicken simmered in rich tomato-butter gravy.',
    price: 13.49,
    image: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=500&q=60',
    category: 'Main Course',
    isPopular: true
  },
  {
    id: 16,
    name: 'Four Cheese Volcano Pizza',
    description: 'Mozzarella, cheddar, parmesan, and gouda on a crispy base.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
    isChefPick: true
  },
  {
    id: 17,
    name: 'Spicy Pepperoni Feast',
    description: 'Pepperoni-loaded pizza with jalapenos and chili oil drizzle.',
    price: 13.99,
    image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=500&q=60',
    category: 'Pizza',
    isPopular: true
  },
  {
    id: 18,
    name: 'Nashville Crunch Chicken Burger',
    description: 'Crispy chicken fillet, pickles, spicy mayo, and slaw.',
    price: 10.99,
    image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=500&q=60',
    category: 'Burger',
    isPopular: true
  },
  {
    id: 19,
    name: 'BBQ Bacon Smash Burger',
    description: 'Double smashed patties, smoky BBQ glaze, bacon, and cheddar.',
    price: 11.49,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=500&q=60',
    category: 'Burger',
    isChefPick: true
  },
  {
    id: 20,
    name: 'Avocado Citrus Power Salad',
    description: 'Avocado, baby greens, citrus, seeds, and honey-lime dressing.',
    price: 8.49,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=500&q=60',
    category: 'Salad',
    isPopular: true
  },
  {
    id: 21,
    name: 'Roasted Beetroot Goat Cheese Salad',
    description: 'Roasted beets, goat cheese, walnuts, and balsamic glaze.',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?auto=format&fit=crop&w=500&q=60',
    category: 'Salad',
    isChefPick: true
  },
  {
    id: 22,
    name: 'Tandoori Chicken Kathi Wrap',
    description: 'Charred tandoori chicken, onions, mint chutney, and soft roti.',
    price: 9.49,
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=60',
    category: 'Wraps',
    isPopular: true
  },
  {
    id: 23,
    name: 'Falafel Hummus Crunch Wrap',
    description: 'Crispy falafel, hummus, veggies, and tahini in a toasted wrap.',
    price: 8.79,
    image: 'https://images.unsplash.com/photo-1547496502-affa22d38842?auto=format&fit=crop&w=500&q=60',
    category: 'Wraps',
    isChefPick: true
  }
];

// API Endpoints
app.get('/api/menu', (req, res) => {
  res.json(MENU_ITEMS);
});

app.get('/api/menu/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const item = MENU_ITEMS.find(i => i.id === id);
  if (item) {
    res.json(item);
  } else {
    res.status(404).json({ message: 'Item not found' });
  }
});

app.post('/api/orders', (req, res) => {
  const order = req.body;
  // In a real app, save to database
  console.log('Order received:', order);
  res.status(201).json({ message: 'Order placed successfully', orderId: Math.floor(Math.random() * 1000) });
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);
