// api/otx.js
export default async function handler(req, res) {
  try {
    // Get the AlienVault OTX API key from environment variables
    const apiKey = process.env.ALIENVAULT_OTX_API_KEY;
    
    if (!apiKey) {
      throw new Error('AlienVault OTX API key is not configured');
    }
    
    // Make the request to the OTX API
    const response = await fetch('https://otx.alienvault.com/api/v1/pulses/subscribed?limit=20', {
      headers: {
        'X-OTX-API-KEY': apiKey
      }
    });
    
    if (!response.ok) {
      throw new Error(`OTX API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Filter for oil & gas and industrial control system related threats
    const keywords = ['oil', 'gas', 'energy', 'industrial', 'scada', 'ics', 'pipeline', 'critical infrastructure', 'uae', 'middle east'];
    
    // Basic filtering - in production you might want more sophisticated filtering
    const filteredResults = data.results.filter(pulse => {
      // Check name and description
      const nameAndDesc = (pulse.name + ' ' + (pulse.description || '')).toLowerCase();
      const hasTags = pulse.tags && Array.isArray(pulse.tags) && pulse.tags.length > 0;
      
      // Check if any keywords match in name, description or tags
      return keywords.some(keyword => 
        nameAndDesc.includes(keyword) || 
        (hasTags && pulse.tags.some(tag => tag.toLowerCase().includes(keyword)))
      );
    });
    
    // If no filtered results, return all results
    const resultsToReturn = filteredResults.length > 0 ? filteredResults : data.results;
    
    // Add cache headers to reduce API calls
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json({ results: resultsToReturn });
  } catch (error) {
    console.error('OTX API error:', error);
    
    res.status(500).json({ 
      error: error.message,
      source: 'AlienVault OTX API',
      timestamp: new Date().toISOString()
    });
  }
}