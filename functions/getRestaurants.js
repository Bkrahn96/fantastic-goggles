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
            // Meal type filtering logic (example, adjust as needed)
            if (mealType == '0' && !restaurant.types.includes('breakfast')) return false;
            if (mealType == '1' && !restaurant.types.includes('lunch')) return false;
            if (mealType == '2' && !restaurant.types.includes('dinner')) return false;

            // Restaurant type filtering logic (example, adjust as needed)
            if (restaurantType == '0' && !restaurant.price_level <= 1) return false;
            if (restaurantType == '1' && (restaurant.price_level < 2 || restaurant.price_level > 3)) return false;
            if (restaurantType == '2' && restaurant.price_level < 4) return false;

            return true;
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
        return {
            statusCode: 500,
            body: JSON.stringify({ error: 'Failed to fetch data' }),
        };
    }
};
