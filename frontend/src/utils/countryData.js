/**
 * Global Multi-Country Location Registry & Administrative Level Configuration
 */

export const SUPPORTED_MARKETS = [
  {
    key: 'India',
    name: 'India',
    country_code: 'IN',
    region: 'Asia',
    admin_level_1_label: 'State / Territory',
    admin_level_2_label: 'District / City',
    requires_admin_level_1: true,
    requires_admin_level_2: true,
  },
  {
    key: 'United States',
    name: 'United States',
    country_code: 'US',
    region: 'Americas',
    admin_level_1_label: 'State',
    admin_level_2_label: 'City',
    requires_admin_level_1: true,
    requires_admin_level_2: true,
  },
  {
    key: 'Australia',
    name: 'Australia',
    country_code: 'AU',
    region: 'Oceania',
    admin_level_1_label: 'State / Territory',
    admin_level_2_label: 'City',
    requires_admin_level_1: true,
    requires_admin_level_2: true,
  },
  {
    key: 'Singapore',
    name: 'Singapore',
    country_code: 'SG',
    region: 'Asia',
    admin_level_1_label: null,
    admin_level_2_label: 'City / Planning Area',
    requires_admin_level_1: false,
    requires_admin_level_2: true,
  },
  {
    key: 'Japan',
    name: 'Japan',
    country_code: 'JP',
    region: 'Asia',
    admin_level_1_label: 'Prefecture',
    admin_level_2_label: 'City / Ward',
    requires_admin_level_1: true,
    requires_admin_level_2: true,
  },
  {
    key: 'Europe',
    name: 'Europe (Select Country)',
    country_code: 'EU',
    is_region_group: true,
    region: 'Europe',
    countries: [
      { key: 'United Kingdom', name: 'United Kingdom', country_code: 'GB', admin_level_1_label: 'Nation / Region', admin_level_2_label: 'City', requires_admin_level_1: true, requires_admin_level_2: true },
      { key: 'Germany', name: 'Germany', country_code: 'DE', admin_level_1_label: 'State (Bundesland)', admin_level_2_label: 'City', requires_admin_level_1: true, requires_admin_level_2: true },
      { key: 'France', name: 'France', country_code: 'FR', admin_level_1_label: 'Region', admin_level_2_label: 'City', requires_admin_level_1: true, requires_admin_level_2: true },
      { key: 'Netherlands', name: 'Netherlands', country_code: 'NL', admin_level_1_label: 'Province', admin_level_2_label: 'City', requires_admin_level_1: true, requires_admin_level_2: true },
      { key: 'Spain', name: 'Spain', country_code: 'ES', admin_level_1_label: 'Autonomous Community', admin_level_2_label: 'City', requires_admin_level_1: true, requires_admin_level_2: true },
      { key: 'Italy', name: 'Italy', country_code: 'IT', admin_level_1_label: 'Region', admin_level_2_label: 'City', requires_admin_level_1: true, requires_admin_level_2: true },
    ]
  }
];

export const COUNTRY_ISO_MAP = {
  'India': 'IN',
  'United States': 'US',
  'Australia': 'AU',
  'Singapore': 'SG',
  'Japan': 'JP',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Netherlands': 'NL',
  'Spain': 'ES',
  'Italy': 'IT',
  'Canada': 'CA',
  'United Arab Emirates': 'AE'
};

export const GLOBAL_LOCATION_HIERARCHY = {
  India: {
    'Tamil Nadu': ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli (Trichy)', 'Salem', 'Tirunelveli', 'Erode', 'Vellore', 'Thanjavur', 'Kanchipuram', 'Tiruppur', 'Cuddalore', 'Dindigul'],
    Kerala: ['Thiruvananthapuram (Trivandrum)', 'Ernakulam (Kochi)', 'Kozhikode (Calicut)', 'Thrissur', 'Kollam', 'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad'],
    Karnataka: ['Bengaluru Urban (Bangalore)', 'Mysuru (Mysore)', 'Dakshina Kannada (Mangalore)', 'Dharwad (Hubballi)', 'Belagavi (Belgaum)', 'Kalaburagi (Gulbarga)', 'Shivamogga (Shimoga)', 'Tumakuru (Tumkur)', 'Udupi'],
    Maharashtra: ['Mumbai City', 'Mumbai Suburban', 'Pune', 'Nagpur', 'Nashik', 'Thane', 'Chhatrapati Sambhajinagar (Aurangabad)', 'Solapur', 'Kolhapur'],
    Telangana: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar', 'Khammam'],
    'Andhra Pradesh': ['Visakhapatnam', 'NTR (Vijayawada)', 'Guntur', 'Tirupati', 'Kakinada', 'Nellore', 'Kurnool', 'Rajahmundry'],
    Gujarat: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
    'Delhi NCR': ['New Delhi', 'Central Delhi', 'South Delhi', 'Gurugram (Gurgaon)', 'Noida', 'Greater Noida', 'Faridabad', 'Ghaziabad'],
    'West Bengal': ['Kolkata', 'Howrah', 'Siliguri', 'Paschim Bardhaman (Durgapur/Asansol)', 'Darjeeling'],
    'Uttar Pradesh': ['Lucknow', 'Kanpur Nagar', 'Agra', 'Varanasi', 'Prayagraj (Allahabad)', 'Meerut', 'Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Bareilly'],
    Rajasthan: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer'],
    Punjab: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Sahibzada Ajit Singh Nagar (Mohali)']
  },
  'United States': {
    California: ['San Francisco', 'Los Angeles', 'San Jose', 'San Diego', 'Sacramento', 'Oakland', 'Fresno', 'Irvine', 'Palo Alto', 'Santa Clara'],
    'New York': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse'],
    Texas: ['Austin', 'Houston', 'Dallas', 'San Antonio', 'Fort Worth', 'El Paso', 'Arlington'],
    Florida: ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'Fort Lauderdale'],
    Washington: ['Seattle', 'Bellevue', 'Redmond', 'Tacoma', 'Spokane'],
    Massachusetts: ['Boston', 'Cambridge', 'Worcester', 'Springfield'],
    Illinois: ['Chicago', 'Aurora', 'Naperville', 'Springfield']
  },
  Australia: {
    'New South Wales': ['Sydney', 'Newcastle', 'Wollongong', 'Central Coast'],
    Victoria: ['Melbourne', 'Geelong', 'Ballarat', 'Bendigo'],
    Queensland: ['Brisbane', 'Gold Coast', 'Sunshine Coast', 'Townsville', 'Cairns'],
    'Western Australia': ['Perth', 'Fremantle', 'Mandurah']
  },
  Singapore: {
    Singapore: ['Singapore', 'Central Business District', 'Marina Bay', 'Jurong East', 'Tampines', 'Woodlands', 'Changi']
  },
  Japan: {
    Tokyo: ['Tokyo', 'Shinjuku', 'Shibuya', 'Chiyoda', 'Minato', 'Chuo', 'Shinagawa'],
    Osaka: ['Osaka', 'Umeda', 'Namba'],
    Kanagawa: ['Yokohama', 'Kawasaki'],
    Aichi: ['Nagoya'],
    Fukuoka: ['Fukuoka']
  },
  'United Kingdom': {
    England: ['London', 'Manchester', 'Birmingham', 'Bristol', 'Leeds', 'Liverpool', 'Cambridge', 'Oxford', 'Sheffield'],
    Scotland: ['Edinburgh', 'Glasgow', 'Aberdeen'],
    Wales: ['Cardiff', 'Swansea'],
    'Northern Ireland': ['Belfast']
  },
  Germany: {
    Bavaria: ['Munich', 'Nuremberg', 'Augsburg', 'Regensburg'],
    Berlin: ['Berlin'],
    Hamburg: ['Hamburg'],
    'North Rhine-Westphalia': ['Cologne', 'Düsseldorf', 'Dortmund', 'Essen', 'Bonn'],
    Hesse: ['Frankfurt am Main', 'Wiesbaden', 'Kassel'],
    Baden-Württemberg: ['Stuttgart', 'Karlsruhe', 'Heidelberg', 'Freiburg']
  },
  France: {
    'Île-de-France': ['Paris', 'Boulogne-Billancourt', 'Saint-Denis', 'Versailles'],
    'Provence-Alpes-Côte dAzur': ['Marseille', 'Nice', 'Cannes'],
    'Auvergne-Rhône-Alpes': ['Lyon', 'Grenoble'],
    Occitanie: ['Toulouse', 'Montpellier']
  },
  Netherlands: {
    'North Holland': ['Amsterdam', 'Haarlem', 'Hilversum'],
    'South Holland': ['Rotterdam', 'The Hague (Den Haag)', 'Delft', 'Leiden'],
    Utrecht: ['Utrecht']
  },
  Spain: {
    'Community of Madrid': ['Madrid', 'Alcobendas'],
    Catalonia: ['Barcelona', 'Girona'],
    Andalusia: ['Seville', 'Málaga'],
    'Valencian Community': ['Valencia']
  },
  Italy: {
    Lombardy: ['Milan', 'Brescia', 'Bergamo'],
    Lazio: ['Rome'],
    Tuscany: ['Florence', 'Pisa'],
    Piedmont: ['Turin']
  }
};
