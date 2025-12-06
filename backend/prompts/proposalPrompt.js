function proposalPrompt(rawText) {
    return `
  You are an AI that extracts pricing and terms from vendor email proposals.
  
  Return ONLY valid JSON.
  DO NOT return <think> tags, markdown, explanations, or comments.
  
  Extract the following fields:
  
  {
	"total_cost": number | null,
	"currency": "USD" | "INR" | "EUR" | null,
	"delivery_days": number | null,
	"warranty_years": number | null,
	"unit_prices": [
		{ "item": string, "unit_price": number | null, "quantity": number | null }
	]
  }
  
  CRITICAL RULES:
  - Always extract total_cost if ANY price is mentioned.
  - If vendor lists unit price * quantity, calculate total_cost.
  - If currency symbol ($, ₹, €) is used, map to USD/INR/EUR.
  - Do NOT rewrite or summarize the email.
  - Use null only if the information truly does not exist.
  
  Vendor email:
  """${rawText}"""
  `;
}

module.exports = { proposalPrompt };