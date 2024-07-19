const fetch = require('node-fetch');

exports.handler = async function(event, context) {
    const { lat, lon, mealType } = event.queryStringParameters;
    const apiKey = process.env.GOOGLE_API_KEY;
    let type;

    switch (mealType) {
        case 'breakfast':
            type = 'breakfast'; // Modify according to the actual place type for breakfast
            break;
        case 'lunch':
            type = 'lunch'; // Modify according to the actual place type for lunch
            break;
        case 'dinner':
            type = 'dinner'; // Modify according to the actual place type for dinner
            break;
        default:
            type = 'restaurant';
            break;
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=1500&type=${type}&key=${apiKey}`;

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
