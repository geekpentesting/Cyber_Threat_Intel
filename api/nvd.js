// api/nvd.js
export default async function handler(req, res) {
  try {
    // Get the NIST API key from environment variables
    const apiKey = process.env.NIST_API_KEY || process.env.NVD_API_KEY;
    
    // Set up date range (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const pubStartDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    // Build the URL with query parameters
    let url = `https://services.nvd.nist.gov/rest/json/cves/2.0?pubStartDate=${pubStartDate}&cvssV3Severity=HIGH&keywordSearch=industrial+control+scada+pipeline+oil+gas&resultsPerPage=10`;
    
    // Add API key if available
    if (apiKey) {
      url += `&apiKey=${apiKey}`;
    }
    
    // Make the request to the NVD API
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`NVD API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Add cache headers to reduce API calls
    res.setHeader('Cache-Control', 'public, s-maxage=1800, stale-while-revalidate=3600');
    res.status(200).json(data);
  } catch (error) {
    console.error('NVD API error:', error);
    res.status(500).json({ 
      error: error.message,
      source: 'NVD API',
      timestamp: new Date().toISOString()
    });
  }
}