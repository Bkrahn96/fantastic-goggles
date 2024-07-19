const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon, type } = event.queryStringParameters;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=restaurant&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        console.log('API Response:', data.results); // Log the API response for debugging
        data.results.forEach(restaurant => console.log('Restaurant Types:', restaurant.types)); // Log types for each restaurant
        const filteredData = filterByType(data, type);
        return {
            statusCode: 200,
            body: JSON.stringify(filteredData),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};

function filterByType(data, type) {
    const typesMap = {
        "0": ["fast_food"],           // Fast Food
        "1": ["restaurant"],          // Casual Dining
        "2": ["restaurant"]           // Fine Dining (not an explicit type in Places API)
    };

    const fastFoodChains = ["mcdonald's", "subway", "burger king", "wendy's", "kfc", "taco bell"];
    
    const typeKeywords = typesMap[type];
    
    if (!typeKeywords) {
        return data;
    }

    const filteredResults = data.results.filter(restaurant =>
        typeKeywords.some(keyword => restaurant.types.includes(keyword)) ||
        (type === "0" && fastFoodChains.some(chain => restaurant.name.toLowerCase().includes(chain)))
    );

    console.log('Filtered Results:', filteredResults); // Log filtered results for debugging
    return { ...data, results: filteredResults };
}
