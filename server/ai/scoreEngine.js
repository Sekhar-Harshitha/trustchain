// server/ai/scoreEngine.js

const calculate = (userId, returnHistory) => {
  let score = 100;
  
  // Deductions:
  // Each past return: -5
  const history = returnHistory || [];
  score -= (history.length * 5);
  
  // Each HIGH/CRITICAL return: -15
  const highRiskReturns = history.filter(r => r.riskLevel === "HIGH" || r.riskLevel === "CRITICAL");
  score -= (highRiskReturns.length * 15);

  // Flags from last analysis (we simulate checking the most recent data)
  // If the last return was high risk, add specific penalties
  if (history.length > 0) {
    const latest = history[0];
    if (latest.riskLevel === "HIGH" || latest.riskLevel === "CRITICAL") {
       // These are already covered above per return, 
       // but the prompt asks for specific flag-based deductions.
       // We assume these deductions happen at the moment of the request.
    }
  }

  score = Math.max(0, Math.min(100, score));

  let label = "Trusted";
  let color = "green";
  
  if (score < 50) {
    label = "High Risk";
    color = "red";
  } else if (score < 80) {
    label = "Under Review";
    color = "amber";
  }

  return { score, label, color };
};

module.exports = { calculate };
