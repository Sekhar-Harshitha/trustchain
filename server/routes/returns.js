// server/routes/returns.js
const express = require('express');
const router = express.Router();
const memoryStore = require('../store/memoryStore');
const narrativeEngine = require('../ai/narrativeEngine');
const scoreEngine = require('../ai/scoreEngine');

router.post('/', (req, res) => {
  const { userId, orderId, reason, orderValue } = req.body;
  
  const userHistory = memoryStore.returns.filter(r => r.userId === userId);
  
  // 1. AI Analysis
  const analysis = narrativeEngine.analyze(reason, userId, userHistory, orderValue);
  
  // 2. Score Calculation
  const scoreData = scoreEngine.calculate(userId, [...userHistory, { riskLevel: analysis.riskLevel }]);
  
  // 3. Decision Logic
  let decision = "UNDER REVIEW";
  if (scoreData.score >= 80 && (analysis.riskLevel === "LOW" || analysis.riskLevel === "MEDIUM")) {
    decision = "APPROVED";
  } else if (scoreData.score < 50 || analysis.riskLevel === "CRITICAL") {
    decision = "REJECTED";
  }

  // 4. Create Return Record
  const newReturn = {
    id: "ret_" + Math.random().toString(36).substr(2, 9),
    userId,
    orderId,
    reason,
    orderValue,
    riskLevel: analysis.riskLevel,
    status: decision,
    timestamp: new Date().toISOString(),
    analysis: analysis // store flags for admin
  };

  memoryStore.returns.push(newReturn);

  // 5. Add to Blockchain (will be initialized in server.js)
  const block = req.app.get('blockchain').addBlock({
    userId,
    orderId,
    reason,
    riskLevel: analysis.riskLevel,
    timestamp: newReturn.timestamp
  });

  newReturn.blockHash = block.hash;

  // 6. Update User Score in Memory
  const user = memoryStore.users.find(u => u.id === userId);
  if (user) {
    user.trustScore = scoreData.score;
  }

  res.json({
    success: true,
    data: {
      returnId: newReturn.id,
      decision,
      riskLevel: analysis.riskLevel,
      trustScore: scoreData.score,
      blockHash: block.hash
    }
  });
});

router.get('/:userId', (req, res) => {
  const { userId } = req.params;
  const userReturns = memoryStore.returns.filter(r => r.userId === userId);
  res.json({ success: true, data: userReturns });
});

module.exports = router;
