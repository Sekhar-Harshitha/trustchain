// server/ai/narrativeEngine.js

const analyze = (reason, userId, returnHistory, orderValue) => {
  const flags = [];
  const now = Date.now();
  
  // a) KEYWORD SCAN
  const keywords = ["defective", "broken", "never arrived", "not as described", "wrong item", "damaged", "fault", "missing", "fake", "scam", "didn't order"];
  const foundKeywords = keywords.filter(kw => (reason || '').toLowerCase().includes(kw));
  if (foundKeywords.length >= 2) {
    flags.push("Suspicious Keywords");
  }

  // b) FREQUENCY CHECK
  const last7Days = returnHistory.filter(r => (now - new Date(r.timestamp)) < (7 * 24 * 60 * 60 * 1000));
  const last30Days = returnHistory.filter(r => (now - new Date(r.timestamp)) < (30 * 24 * 60 * 60 * 1000));
  
  if (last7Days.length >= 2) flags.push("Frequency Flag");
  if (last30Days.length >= 4) flags.push("Chronic Flag");

  // c) VALUE-AT-RISK
  if (orderValue > 10000) flags.push("High Value Flag");

  // d) NARRATIVE REPETITION
  const recent3 = returnHistory.slice(0, 3);
  if (recent3.length === 3 && recent3.every(r => r.reason === reason)) {
    flags.push("Repetition Flag");
  }

  // Risk Level Mapping
  let riskLevel = "LOW";
  const flagCount = flags.length;
  if (flagCount === 1) riskLevel = "MEDIUM";
  else if (flagCount === 2) riskLevel = "HIGH";
  else if (flagCount >= 3) riskLevel = "CRITICAL";

  // Narrative Score (0-100)
  let narrative_score = 100 - (flagCount * 25);
  narrative_score = Math.max(0, narrative_score);

  return { flags, riskLevel, narrative_score };
};

module.exports = { analyze };
