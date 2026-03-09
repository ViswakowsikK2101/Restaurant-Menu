const fs = require('fs');
const path = require('path');

const usersFilePath = path.join(__dirname, '../data/users.json');

const getUsersData = () => {
  try {
    const data = fs.readFileSync(usersFilePath, 'utf8');
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveUsersData = (users) => {
  fs.writeFileSync(usersFilePath, JSON.stringify(users, null, 2));
};

const sanitizeUser = (user) => ({
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

exports.register = (req, res) => {
  try {
    const { name, email, password, address, cardNumber, cardHolder, expiry, cvv } = req.body;

    if (!name || !email || !password || !address || !cardNumber || !cardHolder || !expiry || !cvv) {
      return res.status(400).json({ message: 'All fields are required for registration.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const users = getUsersData();
    const existing = users.find((user) => user.email === normalizedEmail);

    if (existing) {
      return res.status(409).json({ message: 'User already exists. Please login.' });
    }

    const nextId = users.length > 0 ? Math.max(...users.map((user) => Number(user.id) || 0)) + 1 : 1;
    const now = new Date().toISOString();

    const newUser = {
      id: nextId,
      name: String(name).trim(),
      email: normalizedEmail,
      password: String(password),
      address: String(address).trim(),
      cardNumber: String(cardNumber).trim(),
      cardHolder: String(cardHolder).trim(),
      expiry: String(expiry).trim(),
      cvv: String(cvv).trim(),
      createdAt: now,
      updatedAt: now,
    };

    users.push(newUser);
    saveUsersData(users);

    return res.status(201).json({
      message: 'Registration successful',
      user: sanitizeUser(newUser),
    });
  } catch (error) {
    console.error('Error registering user:', error);
    return res.status(500).json({ message: 'Error registering user' });
  }
};

exports.login = (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const users = getUsersData();
    const user = users.find((entry) => entry.email === normalizedEmail && entry.password === String(password));

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.status(200).json({
      message: 'Login successful',
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    return res.status(500).json({ message: 'Error logging in user' });
  }
};
