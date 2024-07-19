const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon, type } = event.queryStringParameters;
    const apiKey = 'AIzaSyAQOuogIYyjxwC1VtkoCSzuA6IHyRVFxlI';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=restaurant&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
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
        "0": ["fast_food"],   // Fast Food
        "1": ["restaurant"],  // Casual Dining
        "2": ["fine_dining"]  // Fine Dining
    };

    const typeKeywords = typesMap[type];
    
    if (!typeKeywords) {
        return data;
    }

    const filteredResults = data.results.filter(restaurant =>
        typeKeywords.some(keyword => restaurant.types.includes(keyword))
    );

    return { ...data, results: filteredResults };
}
