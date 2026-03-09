class Order {
  constructor(id, customer, items, total, date, status, cancelledAt) {
    this.id = id;
    this.customer = customer; // Customer object
    this.items = items;       // Array of menu item choices/quantities
    this.total = total;
    this.date = date || new Date();
    this.status = status || 'placed';
    this.cancelledAt = cancelledAt || null;
  }
}

module.exports = Order;
