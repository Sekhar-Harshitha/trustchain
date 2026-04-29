// server/routes/products.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../store/memoryStore');

router.get('/', (req, res) => {
  res.json({ success: true, data: memoryStore.products });
});

module.exports = router;
