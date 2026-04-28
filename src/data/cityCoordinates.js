// City coordinates lookup table
// Key format: "City,STATE"
// These will be replaced by geocoded coordinates from Google Sheets in production

export const CITY_COORDINATES = {
  'San Francisco,CA': { lat: 37.7749, lng: -122.4194 },
  'Los Angeles,CA':   { lat: 34.0522, lng: -118.2437 },
  'San Diego,CA':     { lat: 32.7157, lng: -117.1611 },
  'San Jose,CA':      { lat: 37.3382, lng: -121.8863 },
  'Sacramento,CA':    { lat: 38.5816, lng: -121.4944 },
  'Oakland,CA':       { lat: 37.8044, lng: -122.2712 },
  'Fresno,CA':        { lat: 36.7378, lng: -119.7871 },
  'New York,NY':      { lat: 40.7128, lng: -74.0060  },
  'Brooklyn,NY':      { lat: 40.6782, lng: -73.9442  },
  'Queens,NY':        { lat: 40.7282, lng: -73.7949  },
  'Manhattan,NY':     { lat: 40.7831, lng: -73.9712  },
  'Austin,TX':        { lat: 30.2672, lng: -97.7431  },
  'Houston,TX':       { lat: 29.7604, lng: -95.3698  },
  'Dallas,TX':        { lat: 32.7767, lng: -96.7970  },
  'San Antonio,TX':   { lat: 29.4241, lng: -98.4936  },
  'Plano,TX':         { lat: 33.0198, lng: -96.6989  },
  'Seattle,WA':       { lat: 47.6062, lng: -122.3321 },
  'Bellevue,WA':      { lat: 47.6101, lng: -122.2015 },
  'Chicago,IL':       { lat: 41.8781, lng: -87.6298  },
  'Boston,MA':        { lat: 42.3601, lng: -71.0589  },
  'Cambridge,MA':     { lat: 42.3736, lng: -71.1097  },
  'Miami,FL':         { lat: 25.7617, lng: -80.1918  },
  'Orlando,FL':       { lat: 28.5383, lng: -81.3792  },
  'Tampa,FL':         { lat: 27.9506, lng: -82.4572  },
  'Philadelphia,PA':  { lat: 39.9526, lng: -75.1652  },
  'Arlington,VA':     { lat: 38.8816, lng: -77.0910  },
  'Charlotte,NC':     { lat: 35.2271, lng: -80.8431  },
  'Columbus,OH':      { lat: 39.9612, lng: -82.9988  },
  'Detroit,MI':       { lat: 42.3314, lng: -83.0458  },
  'Minneapolis,MN':   { lat: 44.9778, lng: -93.2650  },
  'Stamford,CT':      { lat: 41.0534, lng: -73.5387  },
  'Baltimore,MD':     { lat: 39.2904, lng: -76.6122  },
  'Princeton,NJ':     { lat: 40.3573, lng: -74.6672  },
  'Newark,NJ':        { lat: 40.7357, lng: -74.1724  },
  'Jersey City,NJ':   { lat: 40.7178, lng: -74.0431  },
  'Denver,CO':        { lat: 39.7392, lng: -104.9903 },
  'Phoenix,AZ':       { lat: 33.4484, lng: -112.0740 },
  'Atlanta,GA':       { lat: 33.7490, lng: -84.3880  },
  'Honolulu,HI':      { lat: 21.3099, lng: -157.8581 },
  'Las Vegas,NV':     { lat: 36.1699, lng: -115.1398 },
}

// Get coordinates for a member
// Returns null if city not found
export function getMemberCoordinates(member) {
  const key = `${member.city},${member.state}`
  return CITY_COORDINATES[key] || null
}