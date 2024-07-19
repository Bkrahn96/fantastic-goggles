const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon, type, sort } = event.queryStringParameters;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const baseUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=5000&type=restaurant&key=${apiKey}`;

    try {
        let url = baseUrl;
        let allResults = [];
        let nextPageToken = null;

        do {
            const response = await fetch(url);
            const data = await response.json();
            if (data.status !== 'OK') {
                throw new Error(data.status);
            }
            allResults = allResults.concat(data.results);
            nextPageToken = data.next_page_token;
            if (nextPageToken) {
                url = `${baseUrl}&pagetoken=${nextPageToken}`;
                await new Promise(resolve => setTimeout(resolve, 2000)); // Google Places API requires a short delay before fetching the next page
            }
        } while (nextPageToken);

        console.log('API Response:', allResults); // Log the API response for debugging
        allResults.forEach(restaurant => console.log('Restaurant Types:', restaurant.types)); // Log types for each restaurant

        const filteredData = filterByType(allResults, type, lat, lon);
        const sortedData = sortResults(filteredData, sort, lat, lon);
        return {
            statusCode: 200,
            body: JSON.stringify({ results: sortedData }),
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

function filterByType(results, type, lat, lon) {
    const typesMap = {
        "0": ["fast_food"],           // Fast Food
        "1": ["restaurant"],          // Casual Dining
        "2": ["restaurant"]           // Fine Dining (not an explicit type in Places API)
    };

    const fastFoodChains = [
        "mcdonald's", "subway", "burger king", "wendy's", "kfc", "taco bell", "dairy queen", "dairy queen grill & chill"
    ];
    
    const typeKeywords = typesMap[type];
    
    if (!typeKeywords) {
        return results;
    }

    let filteredResults = results.filter(restaurant =>
        typeKeywords.some(keyword => restaurant.types.includes(keyword)) ||
        (type === "0" && fastFoodChains.some(chain => restaurant.name.toLowerCase().includes(chain)))
    );

    // Ensure fast food options are excluded from casual and fine dining
    if (type !== "0") {
        filteredResults = filteredResults.filter(restaurant =>
            !fastFoodChains.some(chain => restaurant.name.toLowerCase().includes(chain))
        );
    }

    const uniqueRestaurants = {};
    filteredResults.forEach(restaurant => {
        const name = restaurant.name.toLowerCase();
        if (!uniqueRestaurants[name] || calculateDistance(lat, lon, restaurant.geometry.location.lat, restaurant.geometry.location.lng) <
            calculateDistance(lat, lon, uniqueRestaurants[name].geometry.location.lat, uniqueRestaurants[name].geometry.location.lng)) {
            uniqueRestaurants[name] = restaurant;
        }
    });

    console.log('Filtered Results:', Object.values(uniqueRestaurants)); // Log filtered results for debugging
    return Object.values(uniqueRestaurants);
}

function sortResults(results, sort, lat, lon) {
    if (sort === 'distance') {
        return results.sort((a, b) => 
            calculateDistance(lat, lon, a.geometry.location.lat, a.geometry.location.lng) - 
            calculateDistance(lat, lon, b.geometry.location.lat, b.geometry.location.lng)
        );
    } else if (sort === 'rating') {
        return results.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'cost') {
        return results.sort((a, b) => (a.price_level || Infinity) - (b.price_level || Infinity));
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
