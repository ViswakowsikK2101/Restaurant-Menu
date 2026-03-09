const fs = require('fs');
const path = require('path');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const ordersFilePath = path.join(__dirname, '../data/orders.json');
const CANCELLATION_WINDOW_MINUTES = 15;

const isWithinCancellationWindow = (orderDateIso) => {
  const orderTimestamp = Date.parse(orderDateIso);
  if (Number.isNaN(orderTimestamp)) {
    return false;
  }

  const elapsedMs = Date.now() - orderTimestamp;
  return elapsedMs <= CANCELLATION_WINDOW_MINUTES * 60 * 1000;
};

// Helper to read current orders
const getOrdersData = () => {
  try {
    const data = fs.readFileSync(ordersFilePath, 'utf8');
    const parsed = JSON.parse(data);
    return parsed.map((order) => ({
      ...order,
      status: order.status || 'placed',
      cancelledAt: order.cancelledAt || null,
    }));
  } catch (error) {
    return []; // Return empty array if file is empty or missing
  }
};

const saveOrdersData = (ordersData) => {
  fs.writeFileSync(ordersFilePath, JSON.stringify(ordersData, null, 2));
};

// Create a new order
exports.createOrder = (req, res) => {
  try {
    const { customer, items } = req.body;

    if (!customer || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order data. Customer and items are required.' });
    }

    // Process customer
    const newCustomer = new Customer(customer.name, customer.email, customer.address);

    // Calculate total price based on passed items
    let total = 0;
    items.forEach(item => {
      // Assuming item has price and quantity fields, or just price
      const price = item.price || 0;
      const quantity = item.quantity || 1;
      total += (price * quantity);
    });

    const ordersData = getOrdersData();
    
    // Generate simple ID based on length
    const orderId = ordersData.length > 0 ? ordersData[ordersData.length - 1].id + 1 : 1;

    const newOrder = new Order(orderId, newCustomer, items, total, new Date(), 'placed', null);

    // Save to array and write to file
    ordersData.push(newOrder);
    saveOrdersData(ordersData);

    res.status(201).json({ message: 'Order strictly placed successfully', order: newOrder });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Error placing new order' });
  }
};

// Return all orders
exports.getAllOrders = (req, res) => {
  try {
    const ordersData = getOrdersData();
    const emailFilter = String(req.query.email || '').trim().toLowerCase();

    if (!emailFilter) {
      return res.status(200).json(ordersData);
    }

    const filtered = ordersData.filter((order) => {
      const customerEmail = String(order.customer?.email || '').trim().toLowerCase();
      return customerEmail === emailFilter;
    });

    res.status(200).json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving orders' });
  }
};

exports.cancelOrder = (req, res) => {
  try {
    const orderId = Number(req.params.id);
    if (!Number.isInteger(orderId)) {
      return res.status(400).json({ message: 'Invalid order id' });
    }

    const ordersData = getOrdersData();
    const target = ordersData.find((order) => Number(order.id) === orderId);

    if (!target) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (target.status === 'cancelled') {
      return res.status(409).json({ message: 'Order is already cancelled', order: target });
    }

    if (!isWithinCancellationWindow(target.date)) {
      return res.status(409).json({
        message: `Cancellation is allowed only within ${CANCELLATION_WINDOW_MINUTES} minutes of placing the order.`,
        order: target,
      });
    }

    target.status = 'cancelled';
    target.cancelledAt = new Date().toISOString();
    saveOrdersData(ordersData);

    return res.status(200).json({ message: 'Order cancelled successfully', order: target });
  } catch (error) {
    console.error('Error cancelling order:', error);
    return res.status(500).json({ message: 'Error cancelling order' });
  }
};
