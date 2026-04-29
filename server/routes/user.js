// server/routes/user.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../store/memoryStore');
const scoreEngine = require('../ai/scoreEngine');

router.get('/:userId/trust-score', (req, res) => {
  const { userId } = req.params;
  const user = memoryStore.users.find(u => u.id === userId);
  if (!user) return res.status(404).json({ success: false, error: "User not found" });

  const userHistory = memoryStore.returns.filter(r => r.userId === userId);
  const scoreData = scoreEngine.calculate(userId, userHistory);

  res.json({ success: true, data: scoreData });
});

module.exports = router;
