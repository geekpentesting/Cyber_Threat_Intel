// api/abuseipdb.js
export default async function handler(req, res) {
  try {
    // Get the AbuseIPDB API key from environment variables
    const apiKey = process.env.ABUSEIPDB_API_KEY;
    
    if (!apiKey) {
      throw new Error('AbuseIPDB API key is not configured');
    }
    
    // Make the request to the AbuseIPDB API
    const response = await fetch('https://api.abuseipdb.com/api/v2/blacklist?limit=100&confidenceMinimum=90', {
      headers: {
        'Key': apiKey,
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`AbuseIPDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add cache headers to reduce API calls
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json(data);
  } catch (error) {
    console.error('AbuseIPDB API error:', error);
    
    // Return sample data for development/demo purposes
    res.status(500).json({ 
      error: error.message,
      source: 'AbuseIPDB API',
      timestamp: new Date().toISOString(),
      // You could include sample data here if needed
    });
  }
}