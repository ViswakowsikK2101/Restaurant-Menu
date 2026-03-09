const fs = require('fs');
const path = require('path');

const menuFilePath = path.join(__dirname, '../data/menu.json');

// Read mock data
const getMenuData = () => {
  const data = fs.readFileSync(menuFilePath, 'utf8');
  return JSON.parse(data);
};

// Return all menu items
exports.getAllMenuItems = (req, res) => {
  try {
    const menuItems = getMenuData();
    res.status(200).json(menuItems);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving menu items' });
  }
};

// Return a specific menu item
exports.getMenuItemById = (req, res) => {
  try {
    const { id } = req.params;
    const menuItems = getMenuData();
    const item = menuItems.find((m) => m.id === parseInt(id));

    if (!item) {
      return res.status(404).json({ message: 'Menu item not found' });
    }

    res.status(200).json(item);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving menu item' });
  }
};
