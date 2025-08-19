// Nearby cities data organized by state and city
export const nearbyCitiesData: Record<string, Record<string, string[]>> = {
  virginia: {
    'sterling': ['Ashburn', 'Herndon', 'Reston', 'Leesburg', 'Chantilly', 'Fairfax'],
    'ashburn': ['Sterling', 'Leesburg', 'Herndon', 'Reston', 'Chantilly', 'Fairfax'],
    'reston': ['Herndon', 'Sterling', 'Fairfax', 'Vienna', 'McLean', 'Ashburn'],
    'herndon': ['Reston', 'Sterling', 'Ashburn', 'Chantilly', 'Fairfax', 'Vienna'],
    'leesburg': ['Ashburn', 'Sterling', 'Purcellville', 'Hamilton', 'Lovettsville', 'Round Hill'],
    'fairfax': ['Vienna', 'Chantilly', 'Reston', 'Arlington', 'Falls Church', 'McLean'],
    'arlington': ['Alexandria', 'Falls Church', 'McLean', 'Fairfax', 'Vienna', 'Springfield'],
    'alexandria': ['Arlington', 'Falls Church', 'Springfield', 'Fairfax', 'Mount Vernon', 'Annandale'],
    'richmond': ['Henrico', 'Chesterfield', 'Mechanicsville', 'Glen Allen', 'Midlothian', 'Short Pump'],
    'norfolk': ['Virginia Beach', 'Chesapeake', 'Portsmouth', 'Hampton', 'Newport News', 'Suffolk'],
    'virginia-beach': ['Norfolk', 'Chesapeake', 'Portsmouth', 'Hampton', 'Suffolk', 'Newport News'],
    'chesapeake': ['Norfolk', 'Virginia Beach', 'Portsmouth', 'Suffolk', 'Hampton', 'Newport News'],
    'newport-news': ['Hampton', 'Yorktown', 'Williamsburg', 'Norfolk', 'Portsmouth', 'Poquoson'],
    'hampton': ['Newport News', 'Norfolk', 'Yorktown', 'Poquoson', 'Williamsburg', 'Portsmouth'],
    'charlottesville': ['Waynesboro', 'Harrisonburg', 'Staunton', 'Crozet', 'Earlysville', 'Free Union'],
    'lynchburg': ['Forest', 'Madison Heights', 'Amherst', 'Bedford', 'Appomattox', 'Rustburg'],
    'roanoke': ['Salem', 'Vinton', 'Cave Spring', 'Christiansburg', 'Blacksburg', 'Bedford'],
    'manassas': ['Centreville', 'Gainesville', 'Haymarket', 'Bristow', 'Nokesville', 'Warrenton'],
    'fredericksburg': ['Stafford', 'Spotsylvania', 'King George', 'Caroline', 'Falmouth', 'Thornburg'],
    'harrisonburg': ['Staunton', 'Waynesboro', 'Bridgewater', 'Elkton', 'Broadway', 'Charlottesville']
  },
  maryland: {
    'baltimore': ['Towson', 'Columbia', 'Glen Burnie', 'Ellicott City', 'Catonsville', 'Dundalk'],
    'annapolis': ['Glen Burnie', 'Severna Park', 'Arnold', 'Pasadena', 'Crofton', 'Odenton'],
    'rockville': ['Bethesda', 'Gaithersburg', 'Silver Spring', 'Potomac', 'Germantown', 'Wheaton'],
    'bethesda': ['Rockville', 'Silver Spring', 'Chevy Chase', 'Potomac', 'Kensington', 'Takoma Park'],
    'silver-spring': ['Bethesda', 'Rockville', 'Takoma Park', 'Wheaton', 'College Park', 'Kensington'],
    'columbia': ['Ellicott City', 'Laurel', 'Clarksville', 'Fulton', 'Highland', 'Jessup'],
    'germantown': ['Gaithersburg', 'Clarksburg', 'Montgomery Village', 'Rockville', 'Damascus', 'Boyds'],
    'frederick': ['Hagerstown', 'Westminster', 'Mount Airy', 'Urbana', 'New Market', 'Thurmont'],
    'hagerstown': ['Frederick', 'Chambersburg', 'Martinsburg', 'Waynesboro', 'Smithsburg', 'Boonsboro'],
    'salisbury': ['Ocean City', 'Cambridge', 'Easton', 'Seaford', 'Fruitland', 'Delmar']
  },
  'north-carolina': {
    'charlotte': ['Huntersville', 'Matthews', 'Mint Hill', 'Indian Trail', 'Pineville', 'Fort Mill'],
    'raleigh': ['Durham', 'Cary', 'Apex', 'Wake Forest', 'Holly Springs', 'Garner'],
    'durham': ['Raleigh', 'Chapel Hill', 'Cary', 'Morrisville', 'Hillsborough', 'Apex'],
    'greensboro': ['High Point', 'Winston-Salem', 'Burlington', 'Kernersville', 'Jamestown', 'Oak Ridge'],
    'winston-salem': ['Greensboro', 'High Point', 'Kernersville', 'Clemmons', 'Lewisville', 'Mocksville'],
    'asheville': ['Hendersonville', 'Waynesville', 'Black Mountain', 'Weaverville', 'Fletcher', 'Arden'],
    'wilmington': ['Wrightsville Beach', 'Carolina Beach', 'Leland', 'Hampstead', 'Southport', 'Kure Beach'],
    'fayetteville': ['Fort Bragg', 'Spring Lake', 'Hope Mills', 'Raeford', 'Lumberton', 'Sanford'],
    'cary': ['Raleigh', 'Apex', 'Morrisville', 'Holly Springs', 'Durham', 'Fuquay-Varina'],
    'high-point': ['Greensboro', 'Winston-Salem', 'Jamestown', 'Thomasville', 'Archdale', 'Trinity']
  },
  pennsylvania: {
    'philadelphia': ['Camden', 'Wilmington', 'Chester', 'Norristown', 'Trenton', 'King of Prussia'],
    'pittsburgh': ['Monroeville', 'Bethel Park', 'Ross Township', 'McCandless', 'Mount Lebanon', 'Cranberry'],
    'allentown': ['Bethlehem', 'Easton', 'Emmaus', 'Whitehall', 'Northampton', 'Catasauqua'],
    'erie': ['Millcreek', 'Harborcreek', 'Fairview', 'Girard', 'North East', 'Edinboro'],
    'reading': ['Lancaster', 'Pottstown', 'Ephrata', 'Lebanon', 'Wyomissing', 'Shillington'],
    'scranton': ['Wilkes-Barre', 'Dunmore', 'Dickson City', 'Clarks Summit', 'Moosic', 'Taylor'],
    'lancaster': ['Reading', 'York', 'Ephrata', 'Lititz', 'Manheim', 'Columbia'],
    'harrisburg': ['Hershey', 'Carlisle', 'Mechanicsburg', 'Camp Hill', 'New Cumberland', 'Lemoyne'],
    'york': ['Lancaster', 'Hanover', 'Red Lion', 'Dallastown', 'Spring Grove', 'Dover'],
    'bethlehem': ['Allentown', 'Easton', 'Emmaus', 'Hellertown', 'Nazareth', 'Catasauqua']
  },
  'new-jersey': {
    'newark': ['Jersey City', 'Elizabeth', 'Paterson', 'Union City', 'Irvington', 'East Orange'],
    'jersey-city': ['Newark', 'Hoboken', 'Union City', 'Bayonne', 'Secaucus', 'Weehawken'],
    'paterson': ['Newark', 'Passaic', 'Clifton', 'Wayne', 'Fair Lawn', 'Hawthorne'],
    'elizabeth': ['Newark', 'Union', 'Linden', 'Rahway', 'Roselle', 'Hillside'],
    'edison': ['New Brunswick', 'Woodbridge', 'Perth Amboy', 'Piscataway', 'Metuchen', 'South Plainfield'],
    'trenton': ['Princeton', 'Hamilton', 'Ewing', 'Lawrence', 'West Windsor', 'Hopewell'],
    'camden': ['Philadelphia', 'Cherry Hill', 'Gloucester City', 'Pennsauken', 'Collingswood', 'Haddonfield'],
    'atlantic-city': ['Ventnor City', 'Margate City', 'Pleasantville', 'Absecon', 'Egg Harbor', 'Brigantine'],
    'princeton': ['Trenton', 'West Windsor', 'Plainsboro', 'Lawrence', 'Hopewell', 'Montgomery'],
    'toms-river': ['Brick', 'Lakewood', 'Jackson', 'Manchester', 'Berkeley', 'Beachwood']
  },
  florida: {
    'miami': ['Fort Lauderdale', 'Hollywood', 'Coral Gables', 'Aventura', 'Miami Beach', 'Homestead'],
    'orlando': ['Kissimmee', 'Sanford', 'Winter Park', 'Altamonte Springs', 'Lake Mary', 'Oviedo'],
    'tampa': ['St. Petersburg', 'Clearwater', 'Brandon', 'Lakeland', 'Plant City', 'Temple Terrace'],
    'jacksonville': ['St. Augustine', 'Orange Park', 'Fleming Island', 'Ponte Vedra', 'Atlantic Beach', 'Neptune Beach'],
    'fort-lauderdale': ['Miami', 'Hollywood', 'Pompano Beach', 'Coral Springs', 'Plantation', 'Davie'],
    'st-petersburg': ['Tampa', 'Clearwater', 'Largo', 'Pinellas Park', 'Seminole', 'Dunedin'],
    'tallahassee': ['Thomasville', 'Quincy', 'Crawfordville', 'Monticello', 'Perry', 'Live Oak'],
    'gainesville': ['Ocala', 'Lake City', 'Alachua', 'Newberry', 'High Springs', 'Archer'],
    'naples': ['Fort Myers', 'Cape Coral', 'Marco Island', 'Bonita Springs', 'Estero', 'Golden Gate'],
    'sarasota': ['Bradenton', 'Venice', 'North Port', 'Palmetto', 'Lakewood Ranch', 'Englewood']
  },
  georgia: {
    'atlanta': ['Marietta', 'Roswell', 'Sandy Springs', 'Alpharetta', 'Decatur', 'Smyrna'],
    'augusta': ['Evans', 'Martinez', 'Grovetown', 'North Augusta', 'Aiken', 'Thomson'],
    'columbus': ['Phenix City', 'Fort Benning', 'LaGrange', 'Opelika', 'Auburn', 'Smiths Station'],
    'savannah': ['Pooler', 'Richmond Hill', 'Hinesville', 'Statesboro', 'Bluffton', 'Hilton Head'],
    'athens': ['Commerce', 'Winder', 'Monroe', 'Watkinsville', 'Jefferson', 'Lawrenceville'],
    'macon': ['Warner Robins', 'Perry', 'Byron', 'Forsyth', 'Gray', 'Milledgeville'],
    'roswell': ['Alpharetta', 'Atlanta', 'Sandy Springs', 'Johns Creek', 'Milton', 'Marietta'],
    'sandy-springs': ['Atlanta', 'Roswell', 'Dunwoody', 'Brookhaven', 'Buckhead', 'Marietta'],
    'johns-creek': ['Alpharetta', 'Roswell', 'Duluth', 'Suwanee', 'Milton', 'Cumming'],
    'albany': ['Leesburg', 'Cordele', 'Americus', 'Tifton', 'Moultrie', 'Sylvester']
  },
  texas: {
    'houston': ['Sugar Land', 'The Woodlands', 'Katy', 'Pasadena', 'Pearland', 'League City'],
    'dallas': ['Fort Worth', 'Arlington', 'Plano', 'Irving', 'Garland', 'McKinney'],
    'austin': ['Round Rock', 'Cedar Park', 'Georgetown', 'Pflugerville', 'San Marcos', 'Kyle'],
    'san-antonio': ['New Braunfels', 'Seguin', 'Boerne', 'Schertz', 'Cibolo', 'Universal City'],
    'fort-worth': ['Dallas', 'Arlington', 'Denton', 'Grapevine', 'Southlake', 'Keller'],
    'el-paso': ['Las Cruces', 'Ciudad Juárez', 'Horizon City', 'Socorro', 'Anthony', 'Canutillo'],
    'arlington': ['Dallas', 'Fort Worth', 'Grand Prairie', 'Mansfield', 'Irving', 'Euless'],
    'plano': ['Dallas', 'Richardson', 'Allen', 'McKinney', 'Frisco', 'Garland'],
    'corpus-christi': ['Portland', 'Kingsville', 'Alice', 'Robstown', 'Aransas Pass', 'Ingleside'],
    'lubbock': ['Amarillo', 'Midland', 'Odessa', 'Plainview', 'Levelland', 'Brownfield']
  },
  california: {
    'los-angeles': ['Long Beach', 'Anaheim', 'Santa Monica', 'Pasadena', 'Glendale', 'Burbank'],
    'san-diego': ['Chula Vista', 'Oceanside', 'Escondido', 'Carlsbad', 'El Cajon', 'Vista'],
    'san-francisco': ['Oakland', 'San Jose', 'Berkeley', 'Daly City', 'San Mateo', 'Redwood City'],
    'san-jose': ['San Francisco', 'Santa Clara', 'Sunnyvale', 'Fremont', 'Palo Alto', 'Mountain View'],
    'sacramento': ['Roseville', 'Elk Grove', 'Folsom', 'Davis', 'Rocklin', 'Citrus Heights'],
    'fresno': ['Clovis', 'Visalia', 'Madera', 'Hanford', 'Merced', 'Tulare'],
    'oakland': ['San Francisco', 'Berkeley', 'Fremont', 'Hayward', 'San Leandro', 'Alameda'],
    'long-beach': ['Los Angeles', 'Anaheim', 'Santa Ana', 'Huntington Beach', 'Torrance', 'Carson'],
    'bakersfield': ['Fresno', 'Visalia', 'Delano', 'Tehachapi', 'Arvin', 'Shafter'],
    'anaheim': ['Los Angeles', 'Long Beach', 'Santa Ana', 'Irvine', 'Orange', 'Fullerton']
  }
};

// Get nearby cities for a given city and state
export function getNearbyCities(city: string, state: string): string[] {
  const stateKey = state.toLowerCase().replace(/\s+/g, '-');
  const cityKey = city.toLowerCase().replace(/\s+/g, '-');
  
  if (nearbyCitiesData[stateKey] && nearbyCitiesData[stateKey][cityKey]) {
    return nearbyCitiesData[stateKey][cityKey];
  }
  
  // Return default cities if not found
  return getDefaultCitiesForState(state);
}

// Get default major cities for a state
export function getDefaultCitiesForState(state: string): string[] {
  const stateKey = state.toLowerCase().replace(/\s+/g, '-');
  
  const defaultCities: Record<string, string[]> = {
    'virginia': ['Richmond', 'Norfolk', 'Virginia Beach', 'Chesapeake', 'Newport News', 'Alexandria'],
    'maryland': ['Baltimore', 'Columbia', 'Germantown', 'Silver Spring', 'Frederick', 'Rockville'],
    'north-carolina': ['Charlotte', 'Raleigh', 'Greensboro', 'Durham', 'Winston-Salem', 'Fayetteville'],
    'pennsylvania': ['Philadelphia', 'Pittsburgh', 'Allentown', 'Erie', 'Reading', 'Scranton'],
    'new-jersey': ['Newark', 'Jersey City', 'Paterson', 'Elizabeth', 'Edison', 'Trenton'],
    'florida': ['Miami', 'Orlando', 'Tampa', 'Jacksonville', 'St. Petersburg', 'Fort Lauderdale'],
    'georgia': ['Atlanta', 'Augusta', 'Columbus', 'Savannah', 'Athens', 'Macon'],
    'texas': ['Houston', 'Dallas', 'Austin', 'San Antonio', 'Fort Worth', 'El Paso'],
    'california': ['Los Angeles', 'San Diego', 'San Francisco', 'San Jose', 'Sacramento', 'Fresno'],
    'new-york': ['New York City', 'Buffalo', 'Rochester', 'Albany', 'Syracuse', 'Yonkers'],
    'illinois': ['Chicago', 'Aurora', 'Rockford', 'Joliet', 'Naperville', 'Springfield'],
    'ohio': ['Columbus', 'Cleveland', 'Cincinnati', 'Toledo', 'Akron', 'Dayton'],
    'michigan': ['Detroit', 'Grand Rapids', 'Warren', 'Sterling Heights', 'Ann Arbor', 'Lansing'],
    'arizona': ['Phoenix', 'Tucson', 'Mesa', 'Chandler', 'Scottsdale', 'Glendale'],
    'washington': ['Seattle', 'Spokane', 'Tacoma', 'Vancouver', 'Bellevue', 'Everett']
  };
  
  return defaultCities[stateKey] || ['Contact us for service in your area'];
}

// Get state slug from state code (e.g., "VA" -> "virginia")
export function getStateSlugFromCode(stateCode: string): string {
  const stateMapping: Record<string, string> = {
    'VA': 'virginia',
    'MD': 'maryland',
    'NC': 'north-carolina',
    'SC': 'south-carolina',
    'PA': 'pennsylvania',
    'NJ': 'new-jersey',
    'NY': 'new-york',
    'FL': 'florida',
    'GA': 'georgia',
    'TX': 'texas',
    'CA': 'california',
    'IL': 'illinois',
    'OH': 'ohio',
    'MI': 'michigan',
    'AZ': 'arizona',
    'WA': 'washington',
    'MA': 'massachusetts',
    'TN': 'tennessee',
    'IN': 'indiana',
    'MO': 'missouri',
    'WI': 'wisconsin',
    'MN': 'minnesota',
    'CO': 'colorado',
    'AL': 'alabama',
    'LA': 'louisiana',
    'KY': 'kentucky',
    'OR': 'oregon',
    'OK': 'oklahoma',
    'CT': 'connecticut',
    'IA': 'iowa',
    'MS': 'mississippi',
    'AR': 'arkansas',
    'UT': 'utah',
    'NV': 'nevada',
    'KS': 'kansas',
    'NM': 'new-mexico',
    'NE': 'nebraska',
    'WV': 'west-virginia',
    'ID': 'idaho',
    'HI': 'hawaii',
    'NH': 'new-hampshire',
    'ME': 'maine',
    'RI': 'rhode-island',
    'MT': 'montana',
    'DE': 'delaware',
    'SD': 'south-dakota',
    'ND': 'north-dakota',
    'AK': 'alaska',
    'VT': 'vermont',
    'WY': 'wyoming',
    'DC': 'district-of-columbia'
  };
  
  return stateMapping[stateCode.toUpperCase()] || 'locations';
}

// Get state code from state name
export function getStateCode(stateName: string): string {
  const stateCodes: Record<string, string> = {
    'virginia': 'VA',
    'maryland': 'MD',
    'north-carolina': 'NC',
    'south-carolina': 'SC',
    'pennsylvania': 'PA',
    'new-jersey': 'NJ',
    'new-york': 'NY',
    'florida': 'FL',
    'georgia': 'GA',
    'texas': 'TX',
    'california': 'CA',
    'illinois': 'IL',
    'ohio': 'OH',
    'michigan': 'MI',
    'arizona': 'AZ',
    'washington': 'WA',
    'massachusetts': 'MA',
    'tennessee': 'TN',
    'indiana': 'IN',
    'missouri': 'MO',
    'wisconsin': 'WI',
    'minnesota': 'MN',
    'colorado': 'CO',
    'alabama': 'AL',
    'louisiana': 'LA',
    'kentucky': 'KY',
    'oregon': 'OR',
    'oklahoma': 'OK',
    'connecticut': 'CT',
    'iowa': 'IA',
    'mississippi': 'MS',
    'arkansas': 'AR',
    'utah': 'UT',
    'nevada': 'NV',
    'kansas': 'KS',
    'new-mexico': 'NM',
    'nebraska': 'NE',
    'west-virginia': 'WV',
    'idaho': 'ID',
    'hawaii': 'HI',
    'new-hampshire': 'NH',
    'maine': 'ME',
    'rhode-island': 'RI',
    'montana': 'MT',
    'delaware': 'DE',
    'south-dakota': 'SD',
    'north-dakota': 'ND',
    'alaska': 'AK',
    'vermont': 'VT',
    'wyoming': 'WY'
  };
  
  const key = stateName.toLowerCase().replace(/\s+/g, '-');
  return stateCodes[key] || stateName.substring(0, 2).toUpperCase();
}