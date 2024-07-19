const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon, mealType, restaurantType } = event.queryStringParameters;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=restaurant&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        // Filter results based on mealType and restaurantType
        const filteredResults = data.results.filter(restaurant => {
            // Example filtering logic (adjust as needed)
            const mealTypeMatches = mealType == '0' && restaurant.types.includes('breakfast') ||
                                    mealType == '1' && restaurant.types.includes('lunch') ||
                                    mealType == '2' && restaurant.types.includes('dinner');

            const restaurantTypeMatches = restaurantType == '0' && restaurant.price_level <= 1 ||
                                          restaurantType == '1' && (restaurant.price_level == 2 || restaurant.price_level == 3) ||
                                          restaurantType == '2' && restaurant.price_level >= 4;

            return mealTypeMatches && restaurantTypeMatches;
        });

        return {
            statusCode: 200,
            body: JSON.stringify({ results: filteredResults }),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        };
    } catch (error) {
        console.error('Error fetching data:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};
