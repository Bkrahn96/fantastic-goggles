const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon, type, sort } = event.queryStringParameters;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=restaurant&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('API Response:', data.results); // Log the API response for debugging
        data.results.forEach(restaurant => console.log('Restaurant Types:', restaurant.types)); // Log types for each restaurant
        const filteredData = filterByType(data, type, lat, lon);
        const sortedData = sortResults(filteredData.results, sort, lat, lon);
        return {
            statusCode: 200,
            body: JSON.stringify({ ...filteredData, results: sortedData }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error); // Log the error for debugging
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data', details: error.message }),
        };
    }
};

function filterByType(data, type, lat, lon) {
    const typesMap = {
        "0": ["fast_food"],           // Fast Food
        "1": ["restaurant"],          // Casual Dining
        "2": ["restaurant"]           // Fine Dining (not an explicit type in Places API)
    };

    const fastFoodChains = ["mcdonald's", "subway", "burger king", "wendy's", "kfc", "taco bell", "dairy queen"];
    
    const typeKeywords = typesMap[type];
    
    if (!typeKeywords) {
        return data;
    }

    const filteredResults = data.results.filter(restaurant =>
        typeKeywords.some(keyword => restaurant.types.includes(keyword)) ||
        (type === "0" && fastFoodChains.some(chain => restaurant.name.toLowerCase().includes(chain)))
    );

    const uniqueRestaurants = {};
    filteredResults.forEach(restaurant => {
        const name = restaurant.name.toLowerCase();
        if (!uniqueRestaurants[name] || calculateDistance(lat, lon, restaurant.geometry.location.lat, restaurant.geometry.location.lng) <
            calculateDistance(lat, lon, uniqueRestaurants[name].geometry.location.lat, uniqueRestaurants[name].geometry.location.lng)) {
            uniqueRestaurants[name] = restaurant;
        }
    });

    console.log('Filtered Results:', Object.values(uniqueRestaurants)); // Log filtered results for debugging
    return { ...data, results: Object.values(uniqueRestaurants) };
}

function sortResults(results, sort, lat, lon) {
    if (sort === 'distance') {
        return results.sort((a, b) => 
            calculateDistance(lat, lon, a.geometry.location.lat, a.geometry.location.lng) - 
            calculateDistance(lat, lon, b.geometry.location.lat, b.geometry.location.lng)
        );
    } else if (sort === 'rating') {
        return results.sort((a, b) => b.rating - a.rating);
    }
    return results;
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        0.5 - Math.cos(dLat)/2 + 
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
        (1 - Math.cos(dLon))/2;

    return R * 2 * Math.asin(Math.sqrt(a));
}
