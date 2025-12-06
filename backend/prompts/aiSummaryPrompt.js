function aiSummaryPrompt(scored) {
    return `
	Analyze these vendor proposals and produce:
	
	1. A summary of how each vendor compares  
	2. Strengths & weaknesses per vendor  
	3. A final recommendation  
	4. A one-line decision statement
	
	Return a JSON with:
	
	{
	  "summary": "...",
	  "per_vendor": { "vendorName": "details..." },
	  "recommendation": "...",
	  "decision": "..."
	}
	
	Vendor Data:
	${JSON.stringify(scored, null, 2)}
	`;
}


module.exports = { aiSummaryPrompt };