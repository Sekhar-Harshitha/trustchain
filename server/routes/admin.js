// server/routes/admin.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../store/memoryStore');
const { validateChain } = require('../blockchain/validator');

router.get('/stats', (req, res) => {
  const totalOrders = memoryStore.orders.length;
  const totalReturns = memoryStore.returns.length;
  const fraudFlags = memoryStore.returns.filter(r => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL").length;
  const validation = validateChain(req.app.get('blockchain').chain);

  res.json({
    success: true,
    data: {
      totalOrders,
      totalReturns,
      fraudFlags,
      chainValid: validation.valid
    }
  });
});

router.get('/returns', (req, res) => {
  res.json({ success: true, data: memoryStore.returns });
});

router.get('/chain', (req, res) => {
  res.json({ success: true, data: req.app.get('blockchain').chain });
});

router.get('/validate', (req, res) => {
  const validation = validateChain(req.app.get('blockchain').chain);
  res.json({ success: true, data: validation });
});

module.exports = router;
