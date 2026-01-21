export interface Airport {
    code: string;
    name: string;
    city: string;
    country: string;
}

export const AIRPORTS: Airport[] = [
    // North America
    { code: 'JFK', name: 'John F. Kennedy International Airport', city: 'New York', country: 'USA' },
    { code: 'EWR', name: 'Newark Liberty International Airport', city: 'New York', country: 'USA' },
    { code: 'LGA', name: 'LaGuardia Airport', city: 'New York', country: 'USA' },
    { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles', country: 'USA' },
    { code: 'ORD', name: 'O\'Hare International Airport', city: 'Chicago', country: 'USA' },
    { code: 'SFO', name: 'San Francisco International Airport', city: 'San Francisco', country: 'USA' },
    { code: 'MIA', name: 'Miami International Airport', city: 'Miami', country: 'USA' },
    { code: 'ATL', name: 'Hartsfield-Jackson Atlanta International Airport', city: 'Atlanta', country: 'USA' },
    { code: 'DFW', name: 'Dallas/Fort Worth International Airport', city: 'Dallas', country: 'USA' },
    { code: 'DEN', name: 'Denver International Airport', city: 'Denver', country: 'USA' },
    { code: 'SEA', name: 'Seattle-Tacoma International Airport', city: 'Seattle', country: 'USA' },
    { code: 'LAS', name: 'Harry Reid International Airport', city: 'Las Vegas', country: 'USA' },
    { code: 'MCO', name: 'Orlando International Airport', city: 'Orlando', country: 'USA' },
    { code: 'YYZ', name: 'Toronto Pearson International Airport', city: 'Toronto', country: 'Canada' },
    { code: 'YVR', name: 'Vancouver International Airport', city: 'Vancouver', country: 'Canada' },
    { code: 'YUL', name: 'Montréal-Trudeau International Airport', city: 'Montreal', country: 'Canada' },
    { code: 'MEX', name: 'Benito Juárez International Airport', city: 'Mexico City', country: 'Mexico' },
    { code: 'CUN', name: 'Cancún International Airport', city: 'Cancun', country: 'Mexico' },

    // Europe
    { code: 'LHR', name: 'Heathrow Airport', city: 'London', country: 'UK' },
    { code: 'LGW', name: 'Gatwick Airport', city: 'London', country: 'UK' },
    { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris', country: 'France' },
    { code: 'ORY', name: 'Orly Airport', city: 'Paris', country: 'France' },
    { code: 'AMS', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', country: 'Netherlands' },
    { code: 'FRA', name: 'Frankfurt Airport', city: 'Frankfurt', country: 'Germany' },
    { code: 'MUC', name: 'Munich Airport', city: 'Munich', country: 'Germany' },
    { code: 'BER', name: 'Berlin Brandenburg Airport', city: 'Berlin', country: 'Germany' },
    { code: 'MAD', name: 'Adolfo Suárez Madrid-Barajas Airport', city: 'Madrid', country: 'Spain' },
    { code: 'BCN', name: 'Josep Tarradellas Barcelona-El Prat Airport', city: 'Barcelona', country: 'Spain' },
    { code: 'FCO', name: 'Leonardo da Vinci-Fiumicino Airport', city: 'Rome', country: 'Italy' },
    { code: 'MXP', name: 'Malpensa Airport', city: 'Milan', country: 'Italy' },
    { code: 'ZRH', name: 'Zurich Airport', city: 'Zurich', country: 'Switzerland' },
    { code: 'GVA', name: 'Geneva Airport', city: 'Geneva', country: 'Switzerland' },
    { code: 'VIE', name: 'Vienna International Airport', city: 'Vienna', country: 'Austria' },
    { code: 'IST', name: 'Istanbul Airport', city: 'Istanbul', country: 'Turkey' },
    { code: 'ATH', name: 'Athens International Airport', city: 'Athens', country: 'Greece' },
    { code: 'LIS', name: 'Humberto Delgado Airport', city: 'Lisbon', country: 'Portugal' },
    { code: 'DUB', name: 'Dublin Airport', city: 'Dublin', country: 'Ireland' },
    { code: 'CPH', name: 'Copenhagen Airport', city: 'Copenhagen', country: 'Denmark' },
    { code: 'ARN', name: 'Stockholm Arlanda Airport', city: 'Stockholm', country: 'Sweden' },
    { code: 'OSL', name: 'Oslo Airport', city: 'Oslo', country: 'Norway' },
    { code: 'HEL', name: 'Helsinki-Vantaa Airport', city: 'Helsinki', country: 'Finland' },

    // Asia
    { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai', country: 'UAE' },
    { code: 'AUH', name: 'Zayed International Airport', city: 'Abu Dhabi', country: 'UAE' },
    { code: 'DOH', name: 'Hamad International Airport', city: 'Doha', country: 'Qatar' },
    { code: 'SIN', name: 'Singapore Changi Airport', city: 'Singapore', country: 'Singapore' },
    { code: 'HND', name: 'Haneda Airport', city: 'Tokyo', country: 'Japan' },
    { code: 'NRT', name: 'Narita International Airport', city: 'Tokyo', country: 'Japan' },
    { code: 'ICN', name: 'Incheon International Airport', city: 'Seoul', country: 'South Korea' },
    { code: 'HKG', name: 'Hong Kong International Airport', city: 'Hong Kong', country: 'Hong Kong' },
    { code: 'BKK', name: 'Suvarnabhumi Airport', city: 'Bangkok', country: 'Thailand' },
    { code: 'DEL', name: 'Indira Gandhi International Airport', city: 'Delhi', country: 'India' },
    { code: 'BOM', name: 'Chhatrapati Shivaji Maharaj International Airport', city: 'Mumbai', country: 'India' },
    { code: 'PEK', name: 'Beijing Capital International Airport', city: 'Beijing', country: 'China' },
    { code: 'PVG', name: 'Shanghai Pudong International Airport', city: 'Shanghai', country: 'China' },
    { code: 'KUL', name: 'Kuala Lumpur International Airport', city: 'Kuala Lumpur', country: 'Malaysia' },
    { code: 'CGK', name: 'Soekarno-Hatta International Airport', city: 'Jakarta', country: 'Indonesia' },
    { code: 'SGN', name: 'Tan Son Nhat International Airport', city: 'Ho Chi Minh City', country: 'Vietnam' },
    { code: 'MNL', name: 'Ninoy Aquino International Airport', city: 'Manila', country: 'Philippines' },
    { code: 'TPE', name: 'Taoyuan International Airport', city: 'Taipei', country: 'Taiwan' },

    // Oceania
    { code: 'SYD', name: 'Sydney Kingsford Smith Airport', city: 'Sydney', country: 'Australia' },
    { code: 'MEL', name: 'Melbourne Airport', city: 'Melbourne', country: 'Australia' },
    { code: 'BNE', name: 'Brisbane Airport', city: 'Brisbane', country: 'Australia' },
    { code: 'PER', name: 'Perth Airport', city: 'Perth', country: 'Australia' },
    { code: 'AKL', name: 'Auckland Airport', city: 'Auckland', country: 'New Zealand' },
    { code: 'CHC', name: 'Christchurch International Airport', city: 'Christchurch', country: 'New Zealand' },

    // South America
    { code: 'GRU', name: 'São Paulo/Guarulhos International Airport', city: 'São Paulo', country: 'Brazil' },
    { code: 'GIG', name: 'Rio de Janeiro/Galeão International Airport', city: 'Rio de Janeiro', country: 'Brazil' },
    { code: 'EZE', name: 'Ministro Pistarini International Airport', city: 'Buenos Aires', country: 'Argentina' },
    { code: 'SCL', name: 'Arturo Merino Benítez International Airport', city: 'Santiago', country: 'Chile' },
    { code: 'BOG', name: 'El Dorado International Airport', city: 'Bogotá', country: 'Colombia' },
    { code: 'LIM', name: 'Jorge Chávez International Airport', city: 'Lima', country: 'Peru' },

    // Africa
    { code: 'JNB', name: 'O. R. Tambo International Airport', city: 'Johannesburg', country: 'South Africa' },
    { code: 'CPT', name: 'Cape Town International Airport', city: 'Cape Town', country: 'South Africa' },
    { code: 'CAI', name: 'Cairo International Airport', city: 'Cairo', country: 'Egypt' },
    { code: 'CMN', name: 'Mohammed V International Airport', city: 'Casablanca', country: 'Morocco' },
    { code: 'ADD', name: 'Addis Ababa Bole International Airport', city: 'Addis Ababa', country: 'Ethiopia' },
    { code: 'LOS', name: 'Murtala Muhammed International Airport', city: 'Lagos', country: 'Nigeria' },
    { code: 'NBO', name: 'Jomo Kenyatta International Airport', city: 'Nairobi', country: 'Kenya' }
];
