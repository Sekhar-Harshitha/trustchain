// server/routes/auth.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../store/memoryStore');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  const user = memoryStore.users.find(u => u.email === email && u.password === password);
  
  if (user) {
    res.json({ success: true, data: { id: user.id, email: user.email, name: user.name, trustScore: user.trustScore } });
  } else {
    res.status(401).json({ success: false, error: "Invalid credentials" });
  }
});

router.post('/register', (req, res) => {
  const { email, password, name } = req.body;
  
  if (memoryStore.users.find(u => u.email === email)) {
    return res.status(400).json({ success: false, error: "Email already exists" });
  }

  const newUser = {
    id: "u" + (memoryStore.users.length + 1),
    email,
    password,
    name,
    trustScore: 100
  };

  memoryStore.users.push(newUser);
  res.json({ success: true, data: newUser });
});

module.exports = router;
