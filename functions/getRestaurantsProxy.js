const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const lat = '33.883822'; // Replace with default lat
    const lon = '-83.9258738'; // Replace with default lon
    const apiKey = 'YOUR_GOOGLE_PLACES_API_KEY';
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=restaurant&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        return {
            statusCode: 200,
            body: JSON.stringify(data),
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
