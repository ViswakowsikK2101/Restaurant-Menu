const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// GET all menu items
router.get('/', menuController.getAllMenuItems);

// GET specific menu item
router.get('/:id', menuController.getMenuItemById);

module.exports = router;
