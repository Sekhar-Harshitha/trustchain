// server/routes/orders.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../store/memoryStore');
const { v4: uuidv4 } = require('uuid');

router.post('/', (req, res) => {
  const { userId, items, total } = req.body;
  
  const newOrder = {
    id: "ord_" + Math.random().toString(36).substr(2, 9),
    userId,
    items,
    total,
    timestamp: new Date().toISOString(),
    status: "delivered"
  };

  memoryStore.orders.push(newOrder);
  res.json({ success: true, data: newOrder });
});

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const userOrders = memoryStore.orders.filter(o => o.userId === userId);
  res.json({ success: true, data: userOrders });
});

module.exports = router;
