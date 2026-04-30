import os
import anthropic

def heuristic_analyze(reason, user_history, order_value):
    risk_score = 0
    flags = []
    
    high_risk = ["never arrived", "not received", "wrong item", "fake", "scam", "fraud", "counterfeit"]
    medium_risk = ["defective", "broken", "damaged", "fault", "missing", "not working", "stopped working"]
    legit_signals = ["size issue", "color", "doesn't fit", "changed mind", "gift duplicate"]
    
    reason_lower = reason.lower()
    
    for kw in high_risk:
        if kw in reason_lower:
            risk_score += 25
            flags.append(f"High risk keyword: '{kw}'")
            
    for kw in medium_risk:
        if kw in reason_lower:
            risk_score += 12
            flags.append(f"Medium risk keyword: '{kw}'")
            
    for kw in legit_signals:
        if kw in reason_lower:
            risk_score -= 8
            flags.append(f"Legitimate signal: '{kw}'")
            
    from datetime import datetime, timedelta
    now = datetime.now()
    recent_7d = []
    recent_30d = []
    
    for r in user_history:
        ts = r.get("timestamp")
        if ts:
            try:
                r_date = datetime.fromisoformat(ts)
                if r_date >= now - timedelta(days=7):
                    recent_7d.append(r)
                if r_date >= now - timedelta(days=30):
                    recent_30d.append(r)
            except:
                pass

    if len(recent_7d) >= 2:
        risk_score += 20
        flags.append("Frequent returns: 7-day window")
        
    if len(recent_30d) >= 4:
        risk_score += 30
        flags.append("Chronic returner: 30-day window")
        
    last_reasons = [r.get("reason", "") for r in user_history[-3:]]
    if reason.strip().lower() in [r.strip().lower() for r in last_reasons if r]:
        risk_score += 35
        flags.append("Identical reason repeated")
    elif any(reason[:20].lower() in r.lower() for r in last_reasons if r and len(reason) > 5):
        risk_score += 20
        flags.append("Similar narrative repeated")

    try:
        val = float(order_value)
        if val > 25000:
            risk_score += 35
            flags.append("Very high value return >₹25,000")
        elif val > 10000:
            risk_score += 20
            flags.append("High value return >₹10,000")
    except:
        pass

    prior_high = [r for r in user_history if r.get("risk_level") in ["HIGH", "CRITICAL"]]
    if len(prior_high) >= 3:
        risk_score += 25
        flags.append("3+ prior high-risk returns")
    elif len(prior_high) >= 1:
        risk_score += 10
        flags.append("Prior high-risk return found")

    risk_score = min(100, max(0, risk_score))
    
    if risk_score <= 30:
        risk_level = "LOW"
    elif risk_score <= 55:
        risk_level = "MEDIUM"
    elif risk_score <= 80:
        risk_level = "HIGH"
    else:
        risk_level = "CRITICAL"

    return {
        "risk_level": risk_level,
        "risk_score": risk_score,
        "flags": flags,
        "heuristic_powered": True,
        "ai_powered": False
    }

def claude_analyze(reason, user_history, order_value, user_name):
    try:
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key:
            raise ValueError("Missing ANTHROPIC_API_KEY")
            
        client = anthropic.Anthropic(api_key=api_key)
        
        prompt = f"""You are TrustChain's fraud detection AI for an Indian e-commerce platform.
Analyze return requests for fraud. Be precise and concise.
Respond ONLY with valid JSON. No explanation outside the JSON.

User: {user_name}
Order Value: {order_value}
Return Reason: {reason}
User History: {user_history}

Expected JSON response shape:
{{
  "fraud_probability": 0.0,
  "detected_patterns": ["pattern1", "pattern2"],
  "narrative_coherence": "HIGH" | "MEDIUM" | "LOW",
  "reasoning": "2-3 sentence explanation",
  "recommendation": "APPROVE" | "REVIEW" | "REJECT",
  "confidence": "HIGH" | "MEDIUM" | "LOW",
  "ai_powered": true
}}"""

        message = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            messages=[{"role": "user", "content": prompt}]
        )
        
        import json
        content = message.content[0].text
        start_idx = content.find('{')
        end_idx = content.rfind('}') + 1
        
        if start_idx == -1 or end_idx == 0:
            raise ValueError("No JSON found in response")
            
        json_str = content[start_idx:end_idx]
        result = json.loads(json_str)
        result["ai_powered"] = True
        return result
        
    except Exception as e:
        print(f"Anthropic API Error: {str(e)}")
        fallback = heuristic_analyze(reason, user_history, order_value)
        fallback["fallback_reason"] = str(e)
        return fallback
