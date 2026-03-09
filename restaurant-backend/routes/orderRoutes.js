const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

// POST a new order
router.post('/', orderController.createOrder);

// GET all orders
router.get('/', orderController.getAllOrders);

// PATCH cancel order by id
router.patch('/:id/cancel', orderController.cancelOrder);

module.exports = router;
