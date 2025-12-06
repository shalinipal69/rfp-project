function rfpPrompt(text) {
    return `
You are an AI trained to extract structured data.

Return ONLY valid JSON. 
NO explanations. 
NO <think> tags. 
NO markdown. 
NO comments.

Extract:

{
  "title": string,
  "items": [{ "name": string, "quantity": number, "specs": {} }],
  "budget": { "amount": number, "currency": string },
  "delivery_days": number,
  "payment_terms": string | null,
  "warranty": string | null
}

Text:
"""${text}"""
`;
}


module.exports = { rfpPrompt };